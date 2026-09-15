import { NextResponse } from "next/server";
import { ADMIN_COOKIE, expectedAdminToken } from "../../../../lib/admin-auth";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  const configured = process.env.ADMIN_PASSWORD;
  const token = expectedAdminToken();
  if (!configured || !token) return NextResponse.json({ error: "Admin password is not configured." }, { status: 503 });
  if (password !== configured) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" });
  return response;
}

