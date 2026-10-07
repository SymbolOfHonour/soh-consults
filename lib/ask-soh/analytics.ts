const URL=process.env.SUPABASE_URL,KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
function headers(){if(!URL||!KEY)return null;return{apikey:KEY,...(KEY.startsWith("eyJ")?{Authorization:`Bearer ${KEY}`}:{}),"Content-Type":"application/json"};}
async function rows(path:string){const h=headers();if(!URL||!h)return[];const r=await fetch(`${URL}/rest/v1/${path}`,{headers:h,cache:"no-store"});return r.ok?await r.json():[];}
export async function getAskSohInsights(){const [questions,feedback]=await Promise.all([rows("ask_soh_questions?select=normalized_question,institution_key,intent,answered,confidence,created_at&order=created_at.desc&limit=1000"),rows("ask_soh_feedback?select=helpful,created_at&order=created_at.desc&limit=1000")]);
 const unanswered=questions.filter((q:any)=>!q.answered);const counts=new Map<string,number>();for(const q of unanswered){const k=q.normalized_question;counts.set(k,(counts.get(k)||0)+1);}
 const topGaps=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([question,count])=>({question,count}));
 return{totalQuestions:questions.length,unanswered:unanswered.length,negativeFeedback:feedback.filter((f:any)=>!f.helpful).length,topGaps};
}
