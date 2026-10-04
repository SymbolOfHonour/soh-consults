import {storageConnectSources} from "./lib/storage-origin";
import { NextResponse, type NextRequest } from "next/server";

/** Guard state-changing admin API requests before they reach route handlers. */
export function proxy(request: NextRequest) {
  const path=request.nextUrl.pathname;
  if(!path.startsWith("/api/admin/")) {
    const nonce=Buffer.from(crypto.randomUUID()).toString("base64");
    const privatePage=path==="/admin"||path.startsWith("/admin/");
    const csp=privatePage?`default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' https:; font-src 'self' data:; connect-src 'self' ${storageConnectSources()}; worker-src 'self' blob:`:`object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'unsafe-eval' https: http:; upgrade-insecure-requests`;
    const h=new Headers(request.headers);h.set("x-nonce",nonce);h.set("x-private-page",String(privatePage));h.set("Content-Security-Policy",csp);
    const response=NextResponse.next({request:{headers:h}});response.headers.set("Content-Security-Policy",csp);
    if(privatePage) {response.headers.set("X-Robots-Tag","noindex, nofollow");response.headers.set("Cache-Control","private, no-store");}
    return response;
  }
  const method = request.method.toUpperCase();
  if (request.nextUrl.pathname === "/api/admin/stories" && method === "DELETE") {
    return NextResponse.json(
      { error: "Move the update to Trash and use Recovery to permanently delete it." },
      { status: 405, headers: { Allow: "GET, POST, PATCH" } },
    );
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const origin = request.headers.get("origin");
    if (!origin || origin === "null") {
      return NextResponse.json({ error: "Admin changes require a same-origin request." }, { status: 403 });
    }
    let requestOrigin: string;
    try { requestOrigin = new URL(origin).origin; }
    catch { return NextResponse.json({ error: "Invalid request origin." }, { status: 403 }); }
    if (requestOrigin !== request.nextUrl.origin) {
      return NextResponse.json({ error: "Cross-origin admin requests are not allowed." }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/api/admin/:path*", "/((?!api/|_next/|.*\\.[^/]+$).*)"] };
