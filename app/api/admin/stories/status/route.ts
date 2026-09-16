import {revalidatePath} from "next/cache";
import {NextResponse} from "next/server";
import {isAdmin} from "../../../../../lib/admin-auth";
import {listStories,updateStory} from "../../../../../lib/news-queue";
import {recordAudit,recordVersion,visibleAdminStories} from "../../../../../lib/admin-recovery";

export async function PATCH(request:Request){
 if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await request.json().catch(()=>null) as {id?:unknown;status?:unknown}|null;
 if(typeof body?.id!=="string"||body.status!=="archived")return NextResponse.json({error:"Valid update ID and archive status required."},{status:400});
 try{
  const previous=visibleAdminStories(await listStories()).find(s=>s.id===body.id);
  if(!previous)return NextResponse.json({error:"Update not found."},{status:404});
  if(previous.status!=="published")return NextResponse.json({error:"This update is no longer published. Refresh the module."},{status:409});
  await recordVersion(previous,"before_edit");
  const updated=await updateStory(previous.id,{status:"archived"});
  if(!updated)return NextResponse.json({error:"Update not found."},{status:404});
  await recordAudit("Status changed published → archived",updated,"Archived from a linked operations module.").catch(()=>{});
  for(const path of ["/","/updates","/admin","/admin/updates","/admin/modules","/admin/opportunities","/admin/forms","/admin/media","/admin/calendar","/admin/recovery",`/updates/imported/${previous.id}`])revalidatePath(path);
  return NextResponse.json({story:updated});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to archive update."},{status:500});}
}
