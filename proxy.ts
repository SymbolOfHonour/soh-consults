import { NextResponse, type NextRequest } from "next/server";

/** Permanent deletion must go through the Trash-only recovery endpoint. */
export function proxy(request: NextRequest) {
  if (request.method === "DELETE") {
    return NextResponse.json(
      { error: "Move the update to Trash and use Recovery to permanently delete it." },
      { status: 405, headers: { Allow: "GET, POST, PATCH" } },
    );
  }
  return NextResponse.next();
}

export const config = { matcher: ["/api/admin/stories"] };
