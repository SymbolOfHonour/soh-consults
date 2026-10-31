import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "soh_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = { exp: number; nonce: string };

function secret() {
  return process.env.ADMIN_SESSION_SECRET || null;
}

function sign(payload: string) {
  const key = secret();
  if (!key) return null;
  return createHmac("sha256", key).update(payload).digest("hex");
}

export function createAdminToken() {
  if (!process.env.ADMIN_PASSWORD || !secret()) return null;
  const payload: SessionPayload = {
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    nonce: crypto.randomUUID(),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(encoded);
  return signature ? `${encoded}.${signature}` : null;
}

export function adminSessionMaxAge() {
  return SESSION_TTL_SECONDS;
}

export async function isAdmin() {
  const received = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!received || received.length > 1024 || !secret()) return false;
  const [encoded, signature, extra] = received.split(".");
  // Reject malformed cookies before decoding or constant-time comparison.
  // Comparing character lengths alone can throw on multibyte signatures.
  if (!encoded || !/^[A-Za-z0-9_-]+$/.test(encoded) || !/^[a-f0-9]{64}$/.test(signature || "") || extra !== undefined) return false;
  const expected = sign(encoded);
  if (!expected || expected.length !== signature.length) return false;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return false;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    return payload !== null && Number.isSafeInteger(payload.exp) && payload.exp > now &&
      payload.exp <= now + SESSION_TTL_SECONDS && typeof payload.nonce === "string" &&
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(payload.nonce);
  } catch {
    return false;
  }
}
