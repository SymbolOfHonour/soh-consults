import { NextResponse, type NextRequest } from "next/server";

/** Guard state-changing admin API requests before they reach route handlers. */
export function proxy(request: NextRequest) {
  const method = request.method.toUpperCase();
  if (request.nextUrl.pathname === "/api/admin/stories" && method === "DELETE") {
    return NextResponse.json(
      { error: "Move the update to Trash and use Recovery to permanently delete it." },
      { status: 405, headers: { Allow: "GET, POST, PATCH" } },
    );
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const origin = request.headers.get("origin");
    if (origin) {
      let requestOrigin: string;
      try { requestOrigin = new URL(origin).origin; }
      catch { return NextResponse.json({ error: "Invalid request origin." }, { status: 403 }); }
      if (requestOrigin !== request.nextUrl.origin) {
        return NextResponse.json({ error: "Cross-origin admin requests are not allowed." }, { status: 403 });
      }
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/api/admin/:path*"] };
