import {questionHash,redactQuestion} from "./privacy";
const URL=process.env.SUPABASE_URL,KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
function headers(){if(!URL||!KEY)return null;return{apikey:KEY,...(KEY.startsWith("eyJ")?{Authorization:`Bearer ${KEY}`}:{}),"Content-Type":"application/json"};}
export async function recordQuestion(input:{question:string;institutionKey?:string|null;intent?:string|null;confidence?:string|null;answered:boolean;sourceType?:string|null;latencyMs?:number;cacheHit?:boolean}){
 const h=headers();if(!URL||!h)return;const redacted=redactQuestion(input.question);
 const row={question_hash:await questionHash(redacted),normalized_question:redacted.toLowerCase().replace(/\s+/g," ").trim(),institution_key:input.institutionKey||null,intent:input.intent||null,confidence:input.confidence||null,answered:input.answered,source_type:input.sourceType||null,latency_ms:input.latencyMs??null,cache_hit:!!input.cacheHit};
 await fetch(`${URL}/rest/v1/ask_soh_questions`,{method:"POST",headers:h,body:JSON.stringify(row),cache:"no-store",signal:AbortSignal.timeout(3000)}).catch(()=>{});
}
