import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "soh_admin_session";

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function expectedAdminToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return digest(`soh-consults:${password}`);
}

export async function isAdmin() {
  const expected = expectedAdminToken();
  const received = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!expected || !received || expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

