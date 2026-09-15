import { createHmac } from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function identifier(request: Request, scope: string) {
  const secret = process.env.RATE_LIMIT_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(`${scope}:${clientIp(request)}`).digest("hex");
}

export async function checkRateLimit(request: Request, scope: string, limit: number, windowSeconds: number) {
  if (!SUPABASE_URL || !SERVICE_KEY) return { allowed: false, retryAfter: windowSeconds };
  const key = identifier(request, scope);
  if (!key) return { allowed: false, retryAfter: windowSeconds };
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_rate_limit`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        ...(SERVICE_KEY.startsWith("eyJ") ? { Authorization: `Bearer ${SERVICE_KEY}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_scope: scope, p_identifier: key, p_limit: limit, p_window_seconds: windowSeconds }),
      cache: "no-store",
    });
    if (!response.ok) return { allowed: false, retryAfter: windowSeconds };
    const result = await response.json();
    if (typeof result === "boolean") return { allowed: result, retryAfter: windowSeconds };
    return { allowed: Boolean(result?.allowed), retryAfter: Number(result?.retry_after) || windowSeconds };
  } catch {
    return { allowed: false, retryAfter: windowSeconds };
  }
}
