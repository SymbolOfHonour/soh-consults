import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { uploadStoryFile } from "../../../../lib/news-queue";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const kind = form.get("kind");
  if (!(file instanceof File) || (kind !== "image" && kind !== "document")) return NextResponse.json({ error: "A valid file and type are required." }, { status: 400 });
  if (kind === "image" && (!imageTypes.has(file.type) || file.size > 5 * 1024 * 1024)) return NextResponse.json({ error: "Use a JPG, PNG or WebP image not larger than 5 MB." }, { status: 400 });
  if (kind === "document" && (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024)) return NextResponse.json({ error: "Use a PDF document not larger than 10 MB." }, { status: 400 });
  try { return NextResponse.json({ url: await uploadStoryFile(file, kind), name: file.name }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 }); }
}
