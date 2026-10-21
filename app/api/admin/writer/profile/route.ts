import { NextResponse } from "next/server";
import { currentWriter, EditorError, memberFields, teamRequest, type TeamMember } from "../../../../../lib/editor-team";
import { checkRateLimit } from "../../../../../lib/rate-limit";
import { uploadValidationError } from "../../../../../lib/article-uploads";
import { uploadStoryFile } from "../../../../../lib/news-queue";
export async function PATCH(request:Request) {
  try {
    const member=await currentWriter();
    if(!member)return NextResponse.json({error:"Unauthorized"},{status:401});
    const body=await request.json().catch(()=>null);
    if(!body||Object.keys(body).some(k=>!["name","about","remove_picture"].includes(k)))throw new EditorError("Only your name, About and picture can be changed here.");
    if(typeof body.name!=="string"||!body.name.trim()||body.name.trim().length>100||typeof body.about!=="string"||body.about.trim().length>1000)throw new EditorError("Use a name up to 100 characters and an About up to 1,000 characters.");
    const patch={name:body.name.trim(),about:body.about.trim(),...(body.remove_picture===true?{picture_url:""}:{})};
    const rows=await teamRequest<TeamMember[]>(`/rest/v1/editor_team?id=eq.${member.id}&active=eq.true&select=${memberFields}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(patch)});
    if(!rows[0])throw new EditorError("Team access is no longer active.",403);
    return NextResponse.json({member:rows[0]},{headers:{"Cache-Control":"no-store"}});
  }catch(e){return failure(e);}
}
export async function POST(request:Request) {
  try {
    const member=await currentWriter();
    if(!member)return NextResponse.json({error:"Unauthorized"},{status:401});
    const rate=await checkRateLimit(request,`writer-profile-${member.id}`,10,3600);
    if(!rate.allowed)throw new EditorError("Picture upload limit reached. Try again later.",rate.unavailable?503:429);
    const form=await request.formData();const file=form.get("file");
    if(!(file instanceof File)||file.size>2*1024*1024)throw new EditorError("Choose a JPG, PNG or WebP picture up to 2 MB.");
    const error=await uploadValidationError(file,"image");if(error)throw new EditorError(error);
    const picture_url=await uploadStoryFile(file,"image");
    const rows=await teamRequest<TeamMember[]>(`/rest/v1/editor_team?id=eq.${member.id}&active=eq.true&select=${memberFields}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({picture_url})});
    if(!rows[0])throw new EditorError("Team access is no longer active.",403);
    return NextResponse.json({member:rows[0]},{headers:{"Cache-Control":"no-store"}});
  }catch(e){return failure(e);}
}
function failure(e:unknown){return NextResponse.json({error:e instanceof EditorError?e.message:"Unable to update your profile."},{status:e instanceof EditorError?e.status:500,headers:{"Cache-Control":"no-store"}});}
