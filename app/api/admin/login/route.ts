import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminSessionMaxAge, createAdminToken } from "../../../../lib/admin-auth";
import { checkRateLimit } from "../../../../lib/rate-limit";

function sameSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function decodeBase32(value: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = value.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const char of clean) {
    const index = alphabet.indexOf(char);
    if (index < 0) return Buffer.alloc(0);
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function totp(secret: string, counter: number) {
  const key = decodeBase32(secret);
  if (!key.length) return "";
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", key).update(message).digest();
  const offset = digest[digest.length - 1] & 15;
  return ((digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).toString().padStart(6, "0");
}

function validTotp(code: string, secret: string) {
  if (!/^\d{6}$/.test(code)) return false;
  const counter = Math.floor(Date.now() / 30_000);
  return [-1, 0, 1].some((window) => sameSecret(code, totp(secret, counter + window)));
}

function isLocalDevelopment(request: Request) {
  if (process.env.NODE_ENV === "production") return false;
  try {
    const host = new URL(request.url).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const localDevelopment = isLocalDevelopment(request);

  // Durable rate limiting is intentionally production-only here. Localhost still
  // requires the real admin password and TOTP when configured, but cannot become
  // locked by Supabase rate-limit state while developing/testing.
  if (!localDevelopment) {
    const rate = await checkRateLimit(request, "admin-login", 8, 15 * 60);
    if (!rate.allowed) return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  }

  const body = await request.json().catch(() => ({ password: "", otp: "" }));
  const password = typeof body.password === "string" ? body.password : "";
  const otp = typeof body.otp === "string" ? body.otp.trim() : "";
  const configured = process.env.ADMIN_PASSWORD;
  const totpSecret = process.env.ADMIN_TOTP_SECRET?.trim();
  const requireTwoFactor = process.env.NODE_ENV === "production" || process.env.ADMIN_REQUIRE_2FA === "true";

  if (!configured || !process.env.ADMIN_SESSION_SECRET) return NextResponse.json({ error: "Admin security is not fully configured." }, { status: 503 });
  if (requireTwoFactor && !totpSecret) return NextResponse.json({ error: "Admin sign-in is temporarily unavailable because two-factor authentication is not configured." }, { status: 503 });

  if (!sameSecret(password, configured) || (totpSecret && !validTotp(otp, totpSecret))) {
    return NextResponse.json({ error: totpSecret ? "Incorrect password or authenticator code." : "Incorrect password." }, { status: 401 });
  }

  const token = createAdminToken();
  if (!token) return NextResponse.json({ error: "Unable to create admin session." }, { status: 503 });
  const response = NextResponse.json({ success: true, twoFactorEnabled: Boolean(totpSecret) });
  response.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: adminSessionMaxAge() });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", expires: new Date(0), path: "/" });
  return response;
}
