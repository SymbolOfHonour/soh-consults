import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { uploadStoryFile } from "../../../../lib/news-queue";
import { uploadValidationError } from "../../../../lib/article-uploads";

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind");
    if (!(file instanceof File) || (kind !== "image" && kind !== "document" && kind !== "video")) return NextResponse.json({ error: "A valid file and type are required." }, { status: 400 });
    const error = await uploadValidationError(file, kind);
    if (error) return NextResponse.json({error}, {status:400});
    return NextResponse.json({ url: await uploadStoryFile(file, kind), name: file.name });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 }); }
}
