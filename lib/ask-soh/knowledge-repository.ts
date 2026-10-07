import {formatAnswer,ResolvedQuestion} from "./question-resolver";
const URL=process.env.SUPABASE_URL,KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
export type KnowledgeFact={id:string;institution_key:string|null;topic:string;intent:string;value_text:string;answer_text:string|null;answer_mode:"numeric"|"name"|"boolean"|"short"|"structured"|"reasoned";academic_session:string|null;source_name:string;source_url:string;evidence_text:string|null;source_authority:number;status:string;verified_at:string|null;review_due_at:string|null;valid_from:string|null;valid_until:string|null;updated_at:string};
function headers(){if(!URL||!KEY)throw new Error("Knowledge store unavailable");return{apikey:KEY,...(KEY.startsWith("eyJ")?{Authorization:`Bearer ${KEY}`}:{}),"Content-Type":"application/json"};}
function active(f:KnowledgeFact,now=Date.now()){if(!["verified","published"].includes(f.status))return false;if(f.valid_from&&+new Date(f.valid_from)>now)return false;if(f.valid_until&&+new Date(f.valid_until)<now)return false;return true;}
export async function findVerifiedFact(q:ResolvedQuestion){if(!URL||!KEY||!q.institutionKey||q.intent==="general")return null;
 const params=new URLSearchParams({select:"*",institution_key:`eq.${q.institutionKey}`,intent:`eq.${q.intent}`,order:"source_authority.desc,verified_at.desc.nullslast",limit:"10"});
 const r=await fetch(`${URL}/rest/v1/ask_soh_facts?${params}`,{headers:headers(),cache:"no-store",signal:AbortSignal.timeout(5000)});if(!r.ok)return null;
 const facts=(await r.json() as KnowledgeFact[]).filter(active).filter(f=>!q.academicSession||!f.academic_session||f.academic_session===q.academicSession);
 const fact=facts[0];if(!fact)return null;
 const stale=!!fact.review_due_at&&+new Date(fact.review_due_at)<Date.now();
 return {fact,answer:formatAnswer(q.answerMode,fact.value_text,fact.answer_text),stale,confidence:stale?"medium":"high" as const};
}
export async function listKnowledgeFacts(){if(!URL||!KEY)return[];const r=await fetch(`${URL}/rest/v1/ask_soh_facts?select=*&order=updated_at.desc&limit=500`,{headers:headers(),cache:"no-store"});return r.ok?await r.json() as KnowledgeFact[]:[];}
