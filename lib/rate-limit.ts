import { createHmac } from "crypto";

type RateLimitResult = {
  allowed: boolean;
  retryAfter: number;
  unavailable?: true;
};

const unavailable = (retryAfter: number): RateLimitResult => ({ allowed: false, retryAfter, unavailable: true });

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function identifier(request: Request, scope: string) {
  const secret = process.env.RATE_LIMIT_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(`${scope}:${clientIp(request)}`).digest("hex");
}

export async function checkRateLimit(request: Request, scope: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  // Read runtime configuration at request time, including in Cloudflare Workers.
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) return unavailable(windowSeconds);
  const key = identifier(request, scope);
  if (!key) return unavailable(windowSeconds);
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
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return unavailable(windowSeconds);
    const result = await response.json();
    if (typeof result === "boolean") return { allowed: result, retryAfter: windowSeconds };
    if (!result || typeof result.allowed !== "boolean") return unavailable(windowSeconds);
    const retryAfter = Number(result.retry_after);
    return { allowed: result.allowed, retryAfter: Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(windowSeconds, Math.ceil(retryAfter)) : windowSeconds };
  } catch {
    return unavailable(windowSeconds);
  }
}
