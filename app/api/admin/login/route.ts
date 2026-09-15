import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminSessionMaxAge, createAdminToken } from "../../../../lib/admin-auth";

function sameSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Admin security is not fully configured." }, { status: 503 });
  }
  if (typeof password !== "string" || !sameSecret(password, configured)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  const token = createAdminToken();
  if (!token) return NextResponse.json({ error: "Unable to create admin session." }, { status: 503 });
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminSessionMaxAge(),
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", expires: new Date(0), path: "/" });
  return response;
}
