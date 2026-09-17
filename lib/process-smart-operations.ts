import {revalidatePath} from "next/cache";
import {listStories,updateStory} from "./news-queue";
import {recordAudit,recordVersion,visibleAdminStories} from "./admin-recovery";
import {scheduledAt,expiryAt,writeSmartMeta,smartMeta} from "./smart-operations";

export async function processSmartOperations(){
 const now=new Date();let published=0,expired=0;
 for(const story of visibleAdminStories(await listStories())){
  const schedule=scheduledAt(story),expiry=expiryAt(story);
  if(schedule&&schedule<=now&&story.status!=="published"&&story.status!=="archived"&&story.status!=="rejected"){
   await recordVersion(story,"before_scheduled_publish");
   const meta=smartMeta(story.details);
   const updated=await updateStory(story.id,{status:"published",details:writeSmartMeta(story.details,{...meta,schedule:undefined})});
   if(updated){published++;await recordAudit("Scheduled publication completed",updated,`Scheduled for ${schedule.toISOString()}.`).catch(()=>{});}
  }else if(expiry&&expiry<=now&&story.status==="published"){
   await recordVersion(story,"before_expiry_archive");
   const updated=await updateStory(story.id,{status:"archived"});
   if(updated){expired++;await recordAudit("Expired update archived",updated,`Expiry was ${expiry.toISOString()}.`).catch(()=>{});}
  }
 }
 for(const path of ["/","/updates","/admin","/admin/updates","/admin/modules","/admin/forms","/admin/opportunities","/admin/calendar"])revalidatePath(path);
 return{published,expired,processed_at:now.toISOString()};
}
