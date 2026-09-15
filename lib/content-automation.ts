import { listStories, updateStory, type QueuedStory } from "./news-queue";

const SCHEDULE_PREFIX="[SCHEDULE:";
const EXPIRES_PREFIX="[EXPIRES:";

function marker(text:string,prefix:string){const start=text.indexOf(prefix);if(start<0)return null;const end=text.indexOf("]",start);if(end<0)return null;const raw=text.slice(start+prefix.length,end).trim();const d=new Date(raw);return Number.isNaN(d.getTime())?null:d;}
export function getSchedule(story:QueuedStory){return marker(story.details||"",SCHEDULE_PREFIX)}
export function getExpiry(story:QueuedStory){return marker(story.details||"",EXPIRES_PREFIX)}
// deadline_iso is visitor-facing information only. It must never archive or unpublish content.
export function automationSummary(story:QueuedStory){return{scheduled_for:getSchedule(story)?.toISOString()||null,expires_at:getExpiry(story)?.toISOString()||null,visitor_deadline:story.deadline_iso||null}}

export async function runContentAutomation(now=new Date()){
 const stories=await listStories();let published=0,archived=0;
 for(const story of stories){
  const schedule=getSchedule(story);const expiry=getExpiry(story);
  if(schedule&&schedule<=now&&(story.status==="draft"||story.status==="approved")){await updateStory(story.id,{status:"published"});published++;continue;}
  if(expiry&&!Number.isNaN(expiry.getTime())&&expiry<now&&story.status==="published"){await updateStory(story.id,{status:"archived"});archived++;}
 }
 return{ok:true,checked:stories.length,published,archived,ran_at:now.toISOString()};
}
