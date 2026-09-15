import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { uploadStoryFile } from "../../../../lib/news-queue";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

async function detectedType(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((value, i) => bytes[i] === value)) return "image/png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP") return "image/webp";
  if (bytes.length >= 5 && String.fromCharCode(...bytes.slice(0,5)) === "%PDF-") return "application/pdf";
  return null;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const kind = form.get("kind");
  if (!(file instanceof File) || (kind !== "image" && kind !== "document")) return NextResponse.json({ error: "A valid file and type are required." }, { status: 400 });
  const actual = await detectedType(file);
  if (kind === "image" && (!imageTypes.has(file.type) || !actual || actual !== file.type || file.size > 5 * 1024 * 1024)) return NextResponse.json({ error: "Use a genuine JPG, PNG or WebP image not larger than 5 MB." }, { status: 400 });
  if (kind === "document" && (file.type !== "application/pdf" || actual !== "application/pdf" || file.size > 10 * 1024 * 1024)) return NextResponse.json({ error: "Use a genuine PDF document not larger than 10 MB." }, { status: 400 });
  try { return NextResponse.json({ url: await uploadStoryFile(file, kind), name: file.name }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 }); }
}
