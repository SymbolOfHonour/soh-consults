import {parseSubmission} from '../../../lib/survey-validation';
import {teamRequest} from '../../../lib/editor-team';
import {checkRateLimit} from '../../../lib/rate-limit';
import {sendSurveyCopy} from '../../../lib/survey-mail';
import {surveyHeaders} from '../../../lib/survey-storage';
export const maxDuration=60;
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:surveyHeaders});
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Please submit from the survey page.'},403);
 let data;try{if(Number(request.headers.get('content-length')||0)>24000)return reply({error:'Response is too large.'},413);const raw=await request.text();if(raw.length>24000)return reply({error:'Response is too large.'},413);data=parseSubmission(JSON.parse(raw))}catch(e){return reply({error:e instanceof Error?e.message:'Please check your answers.'},400)}
 const rate=await checkRateLimit(request,'community-survey',10,3600);if(!rate.allowed)return reply({error:rate.unavailable?'Survey is temporarily unavailable. Please try again.':'Please wait before sending another response.'},rate.unavailable?503:429);
 let stored:{id:string}[];const submittedAt=new Date().toISOString();
 try{stored=await teamRequest<{id:string}[]>('/rest/v1/community_survey_responses?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify({id:data.id,submitted_at:submittedAt,is_test:false,role:data.role,uses_json:JSON.stringify(data.uses),challenge:data.challenge,improvement:data.improvement,features_json:JSON.stringify(data.features),questions:data.questions,experience:data.experience,name:data.name,permission:data.permission,source:'website',email_requested:data.emailRequested,receipt_email:data.receiptEmail,receipt_status:data.emailRequested?'pending':'not_requested'})})}catch{return reply({error:'Could not save your response. Your answers are still on this page. Please try again.'},503)}
 if(!stored?.length)return reply({saved:true,id:data.id,isTest:false,emailCopy:data.emailRequested?'already_requested':'not_requested'});
 let emailCopy='not_requested';
 if(data.emailRequested){
  try{await sendSurveyCopy(data,submittedAt);emailCopy='accepted'}catch{emailCopy='failed'}
  try{await teamRequest(`/rest/v1/community_survey_responses?id=eq.${data.id}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({receipt_status:emailCopy})})}catch{if(emailCopy==='accepted')emailCopy='unknown'}
 }
 return reply({saved:true,id:data.id,isTest:false,emailCopy});
}
