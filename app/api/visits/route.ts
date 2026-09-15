import { NextResponse } from "next/server";
import { checkRateLimit } from "../../../lib/rate-limit";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ success: false, error: "Visit counter is unavailable." }, { status: 503 });
  const rate = await checkRateLimit(request, "site-visit", 30, 60 * 60);
  if (!rate.allowed) return NextResponse.json({ success: false, limited: true }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_site_visit`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        ...(SUPABASE_SERVICE_ROLE_KEY.startsWith("eyJ") ? { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } : {}),
        "Content-Type": "application/json",
      },
      body: "{}",
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Supabase visit counter returned ${response.status}`);
    const value = await response.json();
    return NextResponse.json({ success: true, visits: Number(value) || 0 });
  } catch (error) {
    console.error("Visit counter error:", error);
    return NextResponse.json({ success: false, error: "Visit counter is unavailable." }, { status: 500 });
  }
}
