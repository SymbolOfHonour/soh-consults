import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { uploadStoryFile } from "../../../../lib/news-queue";
import { prepareArticleUpload, completeArticleUpload } from "../../../../lib/direct-article-upload";
import { articleUploadMetadataError, uploadValidationError } from "../../../../lib/article-uploads";

function uploadError(error: unknown, fallback: string, status=500) {
  const message=error instanceof Error&&error.message?error.message:fallback;
  console.error("[admin-upload]",message);
  return NextResponse.json({error:message},{status,headers:{"Cache-Control":"no-store"}});
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers:{"Cache-Control":"no-store"} });
  try {
    if(request.headers.get("content-type")?.includes("application/json")) {
      const body=await request.json().catch(()=>null);
      if(!body)return NextResponse.json({error:"Invalid upload request."},{status:400,headers:{"Cache-Control":"no-store"}});
      if(body.action==="complete") {
        try{return NextResponse.json(await completeArticleUpload(body.receipt),{headers:{"Cache-Control":"no-store"}});}
        catch(error){return uploadError(error,"Could not verify this upload. Select the file and retry.",400);}
      }
      if(body.action!=="prepare"||typeof body.name!=="string"||typeof body.type!=="string"||typeof body.size!=="number")return NextResponse.json({error:"Invalid upload request."},{status:400,headers:{"Cache-Control":"no-store"}});
      const error=articleUploadMetadataError(body.size,body.type,body.kind);if(error)return NextResponse.json({error},{status:400,headers:{"Cache-Control":"no-store"}});
      try{return NextResponse.json(await prepareArticleUpload({kind:body.kind,size:body.size,type:body.type,name:body.name}),{headers:{"Cache-Control":"no-store"}});}
      catch(error){return uploadError(error,"Could not prepare this upload. Please retry.");}
    }
    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind");
    if (!(file instanceof File) || (kind !== "image" && kind !== "document" && kind !== "video")) return NextResponse.json({ error: "A valid file and type are required." }, { status: 400 });
    if(file.size>4*1024*1024)return NextResponse.json({error:"Refresh the editor to use direct uploads for larger files."},{status:400});
    const error = await uploadValidationError(file, kind);
    if (error) return NextResponse.json({error}, {status:400});
    return NextResponse.json({ url: await uploadStoryFile(file, kind), name: file.name });
  } catch (error) { return uploadError(error,"Upload failed."); }
}
