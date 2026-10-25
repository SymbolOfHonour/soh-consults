import {isAdmin} from '../../../../lib/admin-auth';
import {surveyRows,surveyCounts,surveyHeaders} from '../../../../lib/survey-storage';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:surveyHeaders});
export async function GET(request:Request){if(!await isAdmin())return reply({error:'Sign in to your S.O.H admin account.'},401);try{const u=new URL(request.url),test=u.searchParams.get('mode')==='test',before=u.searchParams.get('before')||undefined;const [rows,counts]=await Promise.all([surveyRows(test,before),surveyCounts()]);const responses=rows.slice(0,100);return reply({responses,counts,next:rows.length>100?responses.at(-1)?.submitted_at:null,collectionMode:'live'})}catch{return reply({error:'Could not load survey responses. Please try again.'},503)}}
