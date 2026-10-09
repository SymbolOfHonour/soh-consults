import {embedText} from './semantic';
import {formatAnswer,ResolvedQuestion} from './question-resolver';
import {INSTITUTIONS,InstitutionRecord,isOfficialInstitutionUrl} from './institution-registry';
import {cacheGet,cacheSet} from './cache';
const URL=process.env.SUPABASE_URL,KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
export type KnowledgeFact={id:string;institution_key:string|null;topic:string;intent:string;value_text:string;answer_text:string|null;answer_mode:'numeric'|'name'|'boolean'|'short'|'structured'|'reasoned';academic_session:string|null;source_name:string;source_url:string;evidence_text:string|null;source_authority:number;status:string;verified_at:string|null;review_due_at:string|null;valid_from:string|null;valid_until:string|null;updated_at:string;source_published_at?:string|null;conflicting_evidence?:boolean;metadata?:Record<string,unknown>};
function headers(){if(!URL||!KEY)throw new Error('Knowledge store unavailable');return{apikey:KEY,...(KEY.startsWith('eyJ')?{Authorization:`Bearer ${KEY}`}:{ }),'Content-Type':'application/json'};}
export function factApplicable(f:KnowledgeFact,q?:ResolvedQuestion,now=Date.now()){
 if(!['verified','published'].includes(f.status)||!f.verified_at||!f.evidence_text?.trim()||!f.review_due_at||f.conflicting_evidence)return false;
 if(!isOfficialInstitutionUrl(f.source_url,f.institution_key))return false;
 for(const [value,kind] of [[f.valid_from,'from'],[f.valid_until,'until'],[f.review_due_at,'review'],[f.verified_at,'verified']] as const){if(value){const date=Date.parse(value);if(!Number.isFinite(date)||(kind==='from'&&date>now)||((kind==='until'||kind==='review')&&date<now)||(kind==='verified'&&date>now+60000))return false;}}
 if(q){if(q.institutionKey&&f.institution_key!==q.institutionKey)return false;if(q.intent!=='general'&&f.intent!==q.intent)return false;if(q.academicYear&&f.metadata?.academic_year!==q.academicYear)return false;if(q.academicSession&&f.academic_session!==q.academicSession)return false;if(!q.academicSession&&f.academic_session&&['deadline','status','cutoff','requirements'].includes(q.intent))return false;}
 return true;
}
export async function getInstitution(key:string|null):Promise<InstitutionRecord|null>{
 if(!key)return null;const fallback=INSTITUTIONS.find(i=>i.key===key)||null;if(!URL||!KEY)return fallback;
 const hit=cacheGet<InstitutionRecord>('institution:'+key);if(hit)return hit;
 try{const r=await fetch(`${URL}/rest/v1/ask_soh_institutions?select=key,name,aliases,official_domains,official_urls&key=eq.${encodeURIComponent(key)}&active=eq.true&limit=1`,{headers:headers(),signal:AbortSignal.timeout(3000),cache:'no-store'});if(!r.ok)return fallback;const row=(await r.json())[0];if(!row)return fallback;
 // New domains require a reviewed code registry entry; DB URLs cannot broaden network trust.
 const record={key:row.key,name:row.name,aliases:row.aliases,officialDomains:fallback?.officialDomains||[],sourceUrls:[...(fallback?.sourceUrls||[]),...Object.values(row.official_urls||{}).filter((v):v is string=>typeof v==='string'&&isOfficialInstitutionUrl(v,key))]};cacheSet('institution:'+key,record,180);return record;}catch{return fallback;}
}
export async function findVerifiedFacts(q:ResolvedQuestion,question=''){
 if(!URL||!KEY||!q.institutionKey)return [];
 const params=new URLSearchParams({select:'*',institution_key:`eq.${q.institutionKey}`,intent:`eq.${q.intent}`,status:'in.(verified,published)',order:'source_authority.desc,verified_at.desc.nullslast',limit:'50'});
 const r=await fetch(`${URL}/rest/v1/ask_soh_facts?${params}`,{headers:headers(),cache:'no-store',signal:AbortSignal.timeout(5000)});if(!r.ok)return [];
 const facts=(await r.json() as KnowledgeFact[]).filter(f=>factApplicable(f,q));
 const terms=question.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>2&&!['what','who','when','where','which','how','the','for','does','tell','about','please','lasu','fuoye','uniosun','lasustech','jamb','waec'].includes(w));
 const scored=facts.map(f=>{const topic=f.topic.toLowerCase(),body=(f.value_text+' '+(f.answer_text||'')).toLowerCase();return {f,score:terms.reduce((n,w)=>n+(topic.includes(w)?10:body.includes(w)?1:0),0)};}).sort((a,b)=>b.score-a.score||b.f.source_authority-a.f.source_authority);
 return scored.filter(x=>q.intent!=='general'||x.score>0).map(x=>x.f);
}
export async function findVerifiedFact(q:ResolvedQuestion,question=''){const facts=await findVerifiedFacts(q,question);const fact=facts[0];if(!fact)return null;if(facts.some(f=>f.topic===fact.topic&&f.value_text.trim()!==fact.value_text.trim()))return null;return {fact,answer:formatAnswer(q.answerMode,fact.value_text,fact.answer_text),stale:false,confidence:'high' as const};}
export async function listKnowledgeFacts(){if(!URL||!KEY)return[];const r=await fetch(`${URL}/rest/v1/ask_soh_facts?select=*&order=updated_at.desc&limit=500`,{headers:headers(),cache:'no-store',signal:AbortSignal.timeout(5000)});return r.ok?await r.json() as KnowledgeFact[]:[];}
export async function semanticKnowledgeSearch(question:string,q?:ResolvedQuestion){if(!URL||!KEY)return[];const embedding=await embedText(question);if(!embedding)return[];const r=await fetch(`${URL}/rest/v1/rpc/match_ask_soh_facts`,{method:'POST',headers:headers(),body:JSON.stringify({query_embedding:embedding,match_count:8}),cache:'no-store',signal:AbortSignal.timeout(8000)});if(!r.ok)return[];return (await r.json() as KnowledgeFact[]).filter(f=>factApplicable(f,q));}
