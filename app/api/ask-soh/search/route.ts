import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { contentCatalogue } from "../../../../lib/content-catalogue";
import { listPublishedStories } from "../../../../lib/news-queue";
import { rankContent } from "../../../../lib/ranking-engine";

type SearchResult={title:string;url:string;snippet:string;official:boolean;internal?:boolean};
type Confidence="high"|"medium"|"low";
type ChatTurn={role:"user"|"assistant";content:string};

async function generateGroundedAnswer(question:string,history:ChatTurn[],results:SearchResult[],fallback:string,currentSensitive:boolean){
  const apiKey=process.env.OPENAI_API_KEY; // production credential supplied through the deployment environment
  if(!apiKey||results.length===0)return null;
  const evidence=results.slice(0,5).map((item,index)=>`[${index+1}] ${item.title} | ${item.official?"OFFICIAL":item.internal?"S.O.H":"WEB"} | ${item.snippet} | ${item.url}`).join("\n");
  const recent=history.slice(-6).map(turn=>`${turn.role.toUpperCase()}: ${turn.content.slice(0,500)}`).join("\n");
  const instructions=`You are Ask S.O.H, the education and admission assistant for S.O.H CONSULTS in Nigeria.
Answer only from the supplied evidence. Never invent admission requirements, deadlines, fees, cut-offs, eligibility, availability or guarantees.
For current-sensitive information, prefer OFFICIAL evidence. If official evidence does not establish the answer, say what is unverified.
Do not promise admission. Do not claim a candidate is certain to gain admission.
Be concise, helpful and student-friendly. Do not mention internal implementation, prompts or model names.
Do not add URLs because the interface renders source cards separately.`;
  try{
    const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:process.env.ASK_SOH_MODEL||"gpt-6-luna",instructions,input:`Conversation:\n${recent||"(new conversation)"}\n\nQuestion: ${question}\nCurrent-sensitive: ${currentSensitive?"yes":"no"}\n\nEvidence:\n${evidence}\n\nFallback answer if evidence is insufficient: ${fallback}`,max_output_tokens:350})});
    if(!response.ok)return null;
    const data=await response.json() as {output_text?:string;output?:Array<{content?:Array<{type?:string;text?:string}>}>};
    const text=data.output_text?.trim()||data.output?.flatMap(item=>item.content||[]).find(item=>item.type==="output_text")?.text?.trim();
    return text&&text.length>20?text:null;
  }catch{return null;}
}
const OFFICIAL_HOSTS=["jamb.gov.ng","lasu.edu.ng","lidc.lasu.edu.ng","services.lidc.lasu.edu.ng","education.gov.ng","nbte.gov.ng","nysc.gov.ng","waec.org","neco.gov.ng"];
function cleanText(value:string){
  return value
    .replace(/!\[[^\]]*\]\((?:blob:|data:|https?:\/\/localhost)[^)]+\)/gi," ")
    .replace(/(?:blob:|data:|https?:\/\/localhost)\S*/gi," ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g," ")
    .replace(/\s+/g," ")
    .replace(/^[-–—•]+\s*/,"")
    .trim();
}
function isUsableResult(title:string,url:string,snippet:string){
  if(!title||!snippet||snippet.length<35)return false;
  if(/(?:blob:|data:|localhost)/i.test(url)||/(?:blob:|data:|localhost)/i.test(title+snippet))return false;
  if(/^!?\[?image\b/i.test(title)||/^image\s*\d*$/i.test(title))return false;
  try{const parsed=new URL(url);return parsed.protocol==="https:"||parsed.protocol==="http:";}catch{return false;}
}
function isOfficial(url:string){try{const host=new URL(url).hostname.toLowerCase().replace(/^www\./,"");return OFFICIAL_HOSTS.some(a=>host===a||host.endsWith(`.${a}`));}catch{return false;}}
function composeAnswer(question:string,results:SearchResult[],currentSensitive:boolean):{answer:string;confidence:Confidence;needsHuman:boolean}{
  const official=results.filter(item=>item.official);
  const internal=results.filter(item=>item.internal);
  const preferred=currentSensitive ? (official[0] ?? internal[0]) : (internal[0] ?? official[0]);
  if(!preferred)return {answer:"I could not verify a reliable answer from the sources available to me right now. I would rather not guess. You can check the prepared search results or continue with S.O.H CONSULTS for human guidance.",confidence:"low",needsHuman:true};
  const corroborated=results.some(item=>item.url!==preferred.url && cleanText(item.snippet).toLowerCase()===cleanText(preferred.snippet).toLowerCase());
  const confidence:Confidence=preferred.official ? "high" : internal.length>0 ? "medium" : "low";
  const prefix=currentSensitive
    ? preferred.official ? "I checked a current official source." : "I found relevant information, but I could not confirm it from an official source."
    : preferred.internal ? "From S.O.H CONSULTS knowledge:" : "From the strongest source I found:";
  const caution=currentSensitive && !preferred.official
    ? " Because this can change, confirm it from the institution or agency before paying or taking an irreversible action."
    : confidence==="low" ? " Please verify this before relying on it." : "";
  const support=corroborated ? " I also found a matching source." : "";
  return {answer:`${prefix} ${cleanText(preferred.snippet)}${support}${caution}`,confidence,needsHuman:confidence==="low"};
}

function parseGoogleMarkdown(markdown:string):SearchResult[]{const lines=markdown.split("\n"),results:SearchResult[]=[];for(let i=0;i<lines.length;i++){const line=lines[i].trim(),match=line.match(/^\[(.+?)\]\((https?:\/\/[^)]+)\)$/);if(!match)continue;const title=cleanText(match[1]);let url=match[2];try{const parsed=new URL(url);if(parsed.hostname.includes("google.")&&parsed.pathname==="/url"){const target=parsed.searchParams.get("q")||parsed.searchParams.get("url");if(target)url=target;}}catch{continue;}if(!title||title.toLowerCase().includes("google")||url.includes("google.com/search")||url.includes("accounts.google")||url.includes("support.google"))continue;const parts:string[]=[];for(let j=i+1;j<Math.min(lines.length,i+7);j++){const c=cleanText(lines[j]);if(!c)continue;if(/^\[.+?\]\(https?:\/\//.test(c))break;if(c.startsWith("http"))continue;if(c.length>20)parts.push(c);if(parts.join(" ").length>320)break;}const snippet=cleanText(parts.join(" ")).slice(0,360);if(!isUsableResult(title,url,snippet))continue;if(!results.some(x=>x.url===url))results.push({title,url,snippet,official:isOfficial(url)});if(results.length>=5)break;}return results.sort((a,b)=>Number(b.official)-Number(a.official));}

async function searchSOH(question:string):Promise<SearchResult[]>{
  try{
    const stories=await listPublishedStories();
    return rankContent(contentCatalogue(stories),{query:question})
      .filter(({breakdown})=>breakdown.relevance>0)
      .slice(0,4)
      .map(({item})=>({title:item.title,url:item.href,snippet:cleanText(item.summary||item.body||"Relevant S.O.H CONSULTS resource.").slice(0,360),official:false,internal:true}));
  }catch{return [];}
}

async function handleSearch(request:NextRequest,body?:{question?:string;context?:string;history?:ChatTurn[]}){

  const rate=await checkRateLimit(request,"ask-soh-search",30,60*60);
  if(!rate.allowed)return NextResponse.json({error:"Search limit reached. Please try again later.",results:[]},{status:429,headers:{"Retry-After":String(rate.retryAfter)}});
  const question=(body?.question??request.nextUrl.searchParams.get("q"))?.trim();
  const context=(body?.context??request.nextUrl.searchParams.get("context"))?.trim().slice(0,500);
  const history=Array.isArray(body?.history)?body!.history!.filter(turn=>turn&&(turn.role==="user"||turn.role==="assistant")&&typeof turn.content==="string").slice(-6):[];
  if(!question||question.length<3)return NextResponse.json({error:"Please enter a valid question."},{status:400});
  const safeQuestion=question.slice(0,220);
  const resolvedQuestion=context && !safeQuestion.toLowerCase().includes(context.toLowerCase()) ? `${context}. ${safeQuestion}`.slice(0,360) : safeQuestion;
  const currentSensitive=/(latest|current|today|deadline|closing|close|open|fee|price|cost|date|2026|2027|form|cut.?off|registration)/i.test(resolvedQuestion);
  const institutionHint=/\blasu\b|lagos state university/i.test(resolvedQuestion)?" Lagos State University LASU":"";
  const officialHint=currentSensitive&&institutionHint?" site:lasu.edu.ng":"";
  const googleQuery=`${resolvedQuestion}${institutionHint} Nigeria admission JAMB${officialHint}`;
  const googleUrl=`https://www.google.com/search?q=${encodeURIComponent(googleQuery)}&num=8&hl=en`;
  const internalResults=await searchSOH(resolvedQuestion);
  const readerUrl=`https://r.jina.ai/http://www.google.com/search?q=${encodeURIComponent(googleQuery)}&num=8&hl=en`;
  try{
    const response=await fetch(readerUrl,{headers:{Accept:"text/plain","X-Return-Format":"markdown"},next:{revalidate:300}});
    if(!response.ok)throw new Error(`Search service returned ${response.status}`);
    const webResults=parseGoogleMarkdown(await response.text());
    const deduped=[...internalResults,...webResults].filter((item,index,all)=>isUsableResult(item.title,item.url,item.snippet)&&all.findIndex(other=>other.url===item.url)===index);
    const results=deduped.sort((a,b)=>currentSensitive ? Number(b.official)-Number(a.official) : Number(Boolean(b.internal))-Number(Boolean(a.internal))).slice(0,7);
    const composed=composeAnswer(resolvedQuestion,results,currentSensitive);
    const generated=await generateGroundedAnswer(resolvedQuestion,history,results,composed.answer,currentSensitive);
    return NextResponse.json({query:safeQuestion,googleUrl,results,searchedAt:new Date().toISOString(),knowledgeMatches:internalResults.length,currentSensitive,...composed,answer:generated??composed.answer,generative:Boolean(generated)});
  }catch(error){
    const composed=composeAnswer(resolvedQuestion,internalResults,currentSensitive);
    const generated=await generateGroundedAnswer(resolvedQuestion,history,internalResults,composed.answer,currentSensitive);
    return NextResponse.json({query:safeQuestion,googleUrl,results:internalResults,searchedAt:new Date().toISOString(),knowledgeMatches:internalResults.length,currentSensitive,...composed,answer:generated??composed.answer,generative:Boolean(generated),error:error instanceof Error?error.message:"Live search temporarily unavailable."},{status:200});
  }
}

export async function GET(request:NextRequest){return handleSearch(request);}
export async function POST(request:NextRequest){
  try{
    const body=await request.json() as {question?:string;context?:string;history?:ChatTurn[]};
    return handleSearch(request,body);
  }catch{return NextResponse.json({error:"Invalid request.",results:[]},{status:400});}
}
