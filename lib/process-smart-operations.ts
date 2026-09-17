import {revalidatePath} from "next/cache";
import {listStories,updateStory} from "./news-queue";
import {recordAudit,recordVersion,visibleAdminStories} from "./admin-recovery";
import {scheduledAt,expiryAt,writeSmartMeta,smartMeta} from "./smart-operations";

/** Shared by the authenticated admin action and the secret-protected Vercel cron. */
export async function processSmartOperations(){
 const now=new Date();let published=0,expired=0,failed=0;
 for(const story of visibleAdminStories(await listStories())){
  try{
   const schedule=scheduledAt(story),expiry=expiryAt(story);
   // Expiry takes priority: an already-expired draft must never be published by the scheduler.
   if(expiry&&expiry<=now){
    if(story.status!=="published")continue;
    await recordVersion(story,"before_expiry_archive");
    const updated=await updateStory(story.id,{status:"archived"});
    if(updated){expired++;await recordAudit("Expired update archived",updated,`Expiry was ${expiry.toISOString()}.`).catch(()=>{});}
   }else if(schedule&&schedule<=now&&["draft","approved"].includes(story.status)){
    await recordVersion(story,"before_scheduled_publish");
    const meta=smartMeta(story.details);
    const updated=await updateStory(story.id,{status:"published",details:writeSmartMeta(story.details,{...meta,schedule:undefined})});
    if(updated){published++;await recordAudit("Scheduled publication completed",updated,`Scheduled for ${schedule.toISOString()}.`).catch(()=>{});}
   }
  }catch(error){failed++;console.error("Smart operations failed for update",story.id,error);}
 }
 if(published||expired){for(const path of ["/","/updates","/admin","/admin/updates","/admin/modules","/admin/forms","/admin/opportunities","/admin/calendar","/admin/media"])revalidatePath(path);}
 return {published,expired,failed,processed_at:now.toISOString()};
}
