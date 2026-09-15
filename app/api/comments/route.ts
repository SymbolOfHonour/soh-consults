import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "../../../lib/rate-limit";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
function isConfigured() { return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY); }
function supabaseHeaders(prefer?: string) { return { apikey: SUPABASE_SERVICE_ROLE_KEY || "", "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) }; }
function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

export async function GET(request: NextRequest) {
  if (!isConfigured()) return NextResponse.json({ success: false, error: "Comments are temporarily unavailable." }, { status: 503 });
  const updateId = Number(request.nextUrl.searchParams.get("updateId"));
  if (!Number.isInteger(updateId) || updateId <= 0) return NextResponse.json({ success: false, error: "Invalid update." }, { status: 400 });
  try {
    const url = new URL(`${SUPABASE_URL}/rest/v1/update_comments`);
    url.searchParams.set("update_id", `eq.${updateId}`); url.searchParams.set("select", "id,name,comment,created_at"); url.searchParams.set("order", "created_at.asc");
    const response = await fetch(url, { method: "GET", headers: supabaseHeaders(), cache: "no-store" });
    if (!response.ok) throw new Error(`Comments returned ${response.status}`);
    const comments = await response.json();
    return NextResponse.json({ success: true, comments: Array.isArray(comments) ? comments : [] });
  } catch (error) { console.error("GET comments server error:", error); return NextResponse.json({ success: false, error: "Unable to load comments right now." }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  if (!isConfigured()) return NextResponse.json({ success: false, error: "Comments are temporarily unavailable." }, { status: 503 });
  const rate = await checkRateLimit(request, "comment-post", 5, 10 * 60);
  if (!rate.allowed) return NextResponse.json({ success: false, error: "Too many comments submitted. Please wait before trying again." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  try {
    const body = await request.json();
    const updateId = Number(body.updateId); const name = String(body.name || "").trim(); const email = String(body.email || "").trim().toLowerCase(); const comment = String(body.comment || "").trim(); const website = String(body.website || "").trim();
    if (website) return NextResponse.json({ success: true, comment: null });
    if (!Number.isInteger(updateId) || updateId <= 0) return NextResponse.json({ success: false, error: "Invalid update." }, { status: 400 });
    if (name.length < 2 || name.length > 80) return NextResponse.json({ success: false, error: "Enter a valid name." }, { status: 400 });
    if (!isValidEmail(email) || email.length > 160) return NextResponse.json({ success: false, error: "Enter a valid email address." }, { status: 400 });
    if (comment.length < 2 || comment.length > 1500) return NextResponse.json({ success: false, error: "Comment must be between 2 and 1500 characters." }, { status: 400 });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/update_comments`, { method: "POST", headers: supabaseHeaders("return=representation"), body: JSON.stringify({ update_id: updateId, name, email, comment }), cache: "no-store" });
    if (!response.ok) throw new Error(`Comment insert returned ${response.status}`);
    const rows = await response.json(); const saved = Array.isArray(rows) ? rows[0] : rows;
    return NextResponse.json({ success: true, comment: saved ? { id: saved.id, name: saved.name, comment: saved.comment, created_at: saved.created_at } : null }, { status: 201 });
  } catch (error) { console.error("POST comment server error:", error); return NextResponse.json({ success: false, error: "Unable to post your comment right now." }, { status: 500 }); }
}
