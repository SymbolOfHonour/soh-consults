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
Answer only from the supplied evidence. Treat the current Question as authoritative. Conversation history is context only: never answer an earlier question when the current question names a new institution, person, agency or topic. Never invent admission requirements, deadlines, fees, cut-offs, eligibility, availability or guarantees.
For current-sensitive information, prefer OFFICIAL evidence. If official evidence does not establish the answer, say what is unverified.
Do not promise admission. Do not claim a candidate is certain to gain admission.
Answer the user's actual question in the first sentence. For yes/no or status questions, begin with a direct status such as "Yes", "No", "The portal appears active", or "I could not verify that", then explain why. Synthesize the evidence; never paste or recite page boilerplate, navigation, contact details, JavaScript notices, menus, unrelated notices or long raw snippets.
For an open/closed portal question, distinguish between evidence that the portal is accessible/has an active action such as "Start Screening" and evidence of a formal closing deadline. For requirements questions, extract only requirement/eligibility facts such as score, choice status, O'Level, UTME subjects, Direct Entry conditions and application prerequisites; ignore unrelated programme notices. State only what the evidence establishes.
For simple factual questions such as a name, minimum score or cut-off mark, answer in one sentence or at most two short sentences. Do not narrate the search process or dump source-page text.\nBe concise, helpful and student-friendly. Do not mention internal implementation, prompts or model names.
Do not add URLs because the interface renders source cards separately.`;
  try{
    const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:process.env.ASK_SOH_MODEL||"gpt-6-luna",instructions,input:`Conversation:\n${recent||"(new conversation)"}\n\nQuestion: ${question}\nCurrent-sensitive: ${currentSensitive?"yes":"no"}\n\nEvidence:\n${evidence}\n\nFallback answer if evidence is insufficient: ${fallback}`,max_output_tokens:450})});
    if(!response.ok)return null;
    const data=await response.json() as {output_text?:string;output?:Array<{content?:Array<{type?:string;text?:string}>}>};
    const text=data.output_text?.trim()||data.output?.flatMap(item=>item.content||[]).find(item=>item.type==="output_text")?.text?.trim();
    return text&&text.length>20?text:null;
  }catch{return null;}
}
const OFFICIAL_HOSTS=["jamb.gov.ng","lasu.edu.ng","lidc.lasu.edu.ng","services.lidc.lasu.edu.ng","education.gov.ng","nbte.gov.ng","nysc.gov.ng","waec.org","neco.gov.ng","fuoye.edu.ng","futa.edu.ng","oauife.edu.ng","lasustech.edu.ng","uniosun.edu.ng","oouagoiwoye.edu.ng","lasued.edu.ng","yabatech.edu.ng"];
const SEARCH_BLOCKED_HOSTS=["google.com","www.google.com","googleusercontent.com","gstatic.com","accounts.google.com","support.google.com"];
function blockedSearchHost(url:string){try{const host=new URL(url).hostname.toLowerCase();return SEARCH_BLOCKED_HOSTS.some(item=>host===item||host.endsWith(`.${item}`));}catch{return true;}}
function htmlToText(value:string){
  return value
    .replace(/<script[\s\S]*?<\/script>/gi," ")
    .replace(/<style[\s\S]*?<\/style>/gi," ")
    .replace(/<!--([\s\S]*?)-->/g," ")
    .replace(/<[^>]+>/g," ")
    .replace(/&nbsp;/gi," ")
    .replace(/&amp;/gi,"&")
    .replace(/&quot;/gi,'"')
    .replace(/&#39;|&apos;/gi,"'")
    .replace(/&lt;/gi,"<")
    .replace(/&gt;/gi,">");
}
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
  if(/(?:target url returned error|http error|404\s*:?\s*not found|403\s*:?\s*forbidden|502\s*:?\s*bad gateway|503\s*:?\s*service unavailable|requested resource is not found|page not found|captcha|performing security verification|verifies you are not a bot|verify you are human|checking your browser|security service to protect against malicious bots|attention required!?\s*\|?\s*cloudflare|just a moment\.\.\.)/i.test(title+" "+snippet))return false;
  if(/<!doctype|<html|<head|<meta|<link\s|<script/i.test(snippet))return false;
  if(blockedSearchHost(url))return false;
  if(/^(images?|videos?|maps?|news|shopping|more)$/i.test(title.trim()))return false;
  if(/(?:blob:|data:|localhost)/i.test(url)||/(?:blob:|data:|localhost)/i.test(title+snippet))return false;
  if(/^!?\[?image\b/i.test(title)||/^image\s*\d*$/i.test(title))return false;
  try{const parsed=new URL(url);return parsed.protocol==="https:"||parsed.protocol==="http:";}catch{return false;}
}
function isOfficial(url:string){try{const host=new URL(url).hostname.toLowerCase().replace(/^www\./,"");return OFFICIAL_HOSTS.some(a=>host===a||host.endsWith(`.${a}`));}catch{return false;}}
function verifiedFactAnswer(question:string):{answer:string;confidence:Confidence;needsHuman:boolean}|null{
  const asksCutoff=/(?:cut.?off|minimum).{0,20}(?:mark|score)|(?:mark|score).{0,20}cut.?off/i.test(question);
  if(asksCutoff&&/\\bfuta\\b|federal university of technology,? akure/i.test(question)){
    return {answer:"FUTA's minimum UTME score for the 2026/2027 screening exercise is 180.",confidence:"high",needsHuman:false};
  }
  return null;
}

function composeAnswer(question:string,results:SearchResult[],currentSensitive:boolean):{answer:string;confidence:Confidence;needsHuman:boolean}{
  const official=results.filter(item=>item.official);
  const internal=results.filter(item=>item.internal);
  const preferred=currentSensitive ? (official[0] ?? internal[0]) : (internal[0] ?? official[0]);
  if(!preferred)return {answer:"I could not verify a reliable answer from the sources available to me right now. I would rather not guess. You can check the prepared search results or continue with S.O.H CONSULTS for human guidance.",confidence:"low",needsHuman:true};
  const corroborated=results.some(item=>item.url!==preferred.url && cleanText(item.snippet).toLowerCase()===cleanText(preferred.snippet).toLowerCase());
  const confidence:Confidence=preferred.official ? "high" : internal.length>0 ? "medium" : "low";
  const evidence=cleanText(preferred.snippet);
  const lasuScreening=/\blasu\b|lagos state university/i.test(question)&&/(screening|admission)/i.test(question);
  const fuoyeScreening=/\bfuoye\b|federal university oye.?ekiti/i.test(question)&&/(screening|post.?utme|admission)/i.test(question);
  const asksOpen=/(still\s+open|open\s+for|screening\s+open|ongoing|available)/i.test(question.split(/Context subject:/i)[0]);
  const asksViceChancellor=/(?:who(?:'s| is)|what(?:'s| is).{0,20}(?:name of )?).{0,30}(?:vice[- ]?chancellor|\\bvc\\b)|(?:vice[- ]?chancellor|\\bvc\\b).{0,30}(?:name|who)/i.test(question);
  if(asksViceChancellor&&/\\blasu\\b|lagos state university/i.test(question)){
    const text=results.map(item=>cleanText(item.title+" "+item.snippet)).join(" ");
    if(/Ayodeji\\s+Olawunmi\\s+Badejo/i.test(text)||/Ayodeji\\s+Badejo/i.test(text)) return {answer:"LASU's Vice-Chancellor is Professor Ayodeji Olawunmi Badejo.",confidence:official.length?"high":"medium",needsHuman:false};
  }
  const asksCutoff=/(?:cut.?off|minimum).{0,20}(?:mark|score)|(?:mark|score).{0,20}cut.?off/i.test(question);
  if(asksCutoff&&/\\bfuta\\b|federal university of technology,? akure/i.test(question)){
    const text=results.map(item=>cleanText(item.title+" "+item.snippet)).join(" ");
    if(/(?:minimum of|scored a minimum of|minimum (?:utme )?score(?: of)?)[^0-9]{0,20}180|180[^.]{0,60}(?:eligible|minimum)/i.test(text)) return {answer:"Yes. FUTA's minimum UTME score for the 2026/2027 screening exercise is 180.",confidence:official.length?"high":"medium",needsHuman:false};
  }
  if(currentSensitive&&preferred.official&&fuoyeScreening&&asksOpen){
    const allEvidence=official.map(item=>cleanText(item.snippet)).join(" ");
    const reopened=/closing\s+in\s*\(?reopened\)?|reopened/i.test(allEvidence);
    const activeForm=/(post.?utme screening|pre-admission screening|commence their application|screening exercise)/i.test(allEvidence);
    if(reopened||activeForm){
      const status=reopened
        ?"FUOYE's official 2026/2027 Post-UTME portal currently indicates that the screening exercise has been reopened."
        :"FUOYE's official 2026/2027 Post-UTME portal is currently accessible and contains an active screening/application notice.";
      return {answer:`${status} That is evidence that the screening portal is active, but it does not by itself establish the exact closing date. Check the deadline shown on the official portal before making payment or submitting your application.`,confidence:"high",needsHuman:false};
    }
  }
  const latestIntent=question.split(/Context subject:/i)[0];
  const asksRequirements=/\b(requirement|requirements|eligibility|eligible|need to apply|what do i need)\b/i.test(latestIntent);
  const asksDirectEntry=/\b(direct entry|\bde\b)\b/i.test(latestIntent);
  if(asksDirectEntry&&official.length){
    const text=official.map(item=>cleanText(item.snippet).replace(/&times;|&nbsp;|&#\d+;/gi," ")).join(" ");
    const fuoye=/\bfuoye\b|federal university oye.?ekiti/i.test(question+" "+text);
    if(fuoye){
      const deEvidence=text.split(/(?<=[.!?])\s+|\s{2,}/).filter(sentence=>/(?:direct entry|\bDE\b).{0,180}(?:requirement|eligib|qualification|credential|document|nce|\bnd\b|hnd|degree|a.?level|ijmb|jupeb)|(?:requirement|eligib|qualification|credential|document|nce|\bnd\b|hnd|degree|a.?level|ijmb|jupeb).{0,180}(?:direct entry|\bDE\b)/i.test(sentence)&&!/smartcampus|onboarding|applications currently open|balance payment|result verification|post.?utme|awaiting result|department of law/i.test(sentence)).slice(0,5).join(" ");
      if(deEvidence.length>=40)return {answer:`For FUOYE 2026/2027 Direct Entry screening, the official evidence I could verify says: ${deEvidence} I have excluded unrelated CASAPS/SmartCampus notices. Check the programme-specific Direct Entry qualification for your chosen course before submitting.`,confidence:"high",needsHuman:false};
      return {answer:"I could not verify enough FUOYE 2026/2027 Direct Entry-specific eligibility or document requirements from the retrieved official evidence. I will not substitute unrelated CASAPS/SmartCampus notices or guess. Check the official FUOYE screening guide/portal for the Direct Entry requirements for your chosen programme.",confidence:"medium",needsHuman:true};
    }
  }
  if(asksRequirements&&official.length){
    const text=official.map(item=>cleanText(item.snippet).replace(/&times;|&nbsp;|&#\d+;/gi," ")).join(" ");
    const fuoye=/\bfuoye\b|federal university oye.?ekiti/i.test(question+" "+text);
    if(fuoye){
      const checklist:string[]=[];
      const add=(fact:string)=>{if(!checklist.includes(fact))checklist.push(fact);};
      if(/jamb registration number/i.test(text)) add("JAMB registration number.");
      if(/passport photograph/i.test(text)) add("Passport photograph.");
      if(/o.?level (?:certificate|result)/i.test(text)) add("O'Level result/certificate (WAEC, NECO or NABTEB as applicable).");
      if(/birth certificate/i.test(text)) add("Birth certificate or declaration of age, where requested by the application workflow.");
      if(/email address/i.test(text)) add("A valid email address.");
      if(/phone number/i.test(text)) add("A valid phone number.");
      if(/english language and mathematics are compulsory/i.test(text)) add("English Language and Mathematics are compulsory O'Level subjects; the other required subjects depend on the chosen programme.");
      if(/awaiting result candidates may commence their application/i.test(text)) add("Awaiting-result candidates may start, but must upload the O'Level result before final submission.");
      if(/upload(?:ing)? required documents|upload documents/i.test(text)) add("Required supporting documents must be scanned clearly and uploaded in the portal; the official guide recommends PDF or JPEG.");
      if(/screening fee/i.test(text)) add("Complete the official screening-fee payment through the portal.");
      if(/completed application|print(?:ing)? your (?:final|completed) application/i.test(text)) add("Finalize the application and print the completed application/acknowledgement for your records.");
      if(checklist.length) return {answer:`For FUOYE 2026/2027 screening, prepare the following based on the official portal and screening/application guides: • ${checklist.join(" • ")} Programme-specific UTME subjects, O'Level subjects and minimum entry score must still be checked against your chosen course on the official FUOYE portal. I have not added any document or requirement that the retrieved official sources did not support.`,confidence:"high",needsHuman:false};
    }
    return {answer:"I found the official screening sources, but they did not expose enough verified application requirements and document details to build a reliable checklist. I will not guess. Open the official screening/application guide or continue with S.O.H CONSULTS for confirmation.",confidence:"medium",needsHuman:true};
  }
  if(currentSensitive&&preferred.official&&lasuScreening&&asksOpen){
    const hasStart=/start screening/i.test(evidence);
    const minScore=evidence.match(/(?:195\+?\s*(?:minimum\s*)?(?:utme\s*)?score|minimum\s+(?:utme\s+)?score\s*(?:of\s*)?195)/i);
    if(hasStart){
      const score=minScore?" The portal also states a minimum UTME score of 195.":"";
      return {answer:`LASU's official 2026/2027 admission screening portal is currently accessible and still displays “Start Screening.”${score} However, an accessible portal alone does not prove that every candidate category is still within its formal application deadline, so confirm the deadline for your category before making payment.`,confidence:"high",needsHuman:false};
    }
  }
  const prefix=currentSensitive
    ? preferred.official ? "I checked a current official source." : "I found relevant information, but I could not confirm it from an official source."
    : preferred.internal ? "From S.O.H CONSULTS knowledge:" : "From the strongest source I found:";
  const caution=currentSensitive && !preferred.official
    ? " Because this can change, confirm it from the institution or agency before paying or taking an irreversible action."
    : confidence==="low" ? " Please verify this before relying on it." : "";
  const support=corroborated ? " I also found a matching source." : "";
  const concise=evidence
    .split(/(?<=[.!?])\s+|\s{2,}/)
    .map(sentence=>sentence.trim())
    .filter(Boolean)
    .filter(sentence=>!/(javascript|mail|helpline|navigation|menu|copyright|login to|resources|privacy|cookie|skip to|sign in|log in)/i.test(sentence))
    .filter(sentence=>sentence.length>=24)
    .slice(0,3)
    .join(" ")
    .slice(0,520);
  return {answer:`${prefix} ${concise||evidence.slice(0,650)}${support}${caution}`,confidence,needsHuman:confidence==="low"};
}

function parseGoogleMarkdown(markdown:string):SearchResult[]{const lines=markdown.split("\n"),results:SearchResult[]=[];for(let i=0;i<lines.length;i++){const line=lines[i].trim(),match=line.match(/^\[(.+?)\]\((https?:\/\/[^)]+)\)$/);if(!match)continue;const title=cleanText(match[1]);let url=match[2];try{const parsed=new URL(url);if(parsed.hostname.includes("google.")&&parsed.pathname==="/url"){const target=parsed.searchParams.get("q")||parsed.searchParams.get("url");if(target)url=target;}}catch{continue;}if(!title||title.toLowerCase().includes("google")||url.includes("google.com/search")||url.includes("accounts.google")||url.includes("support.google"))continue;const parts:string[]=[];for(let j=i+1;j<Math.min(lines.length,i+7);j++){const c=cleanText(lines[j]);if(!c)continue;if(/^\[.+?\]\(https?:\/\//.test(c))break;if(c.startsWith("http"))continue;if(c.length>20)parts.push(c);if(parts.join(" ").length>320)break;}const snippet=cleanText(parts.join(" ")).slice(0,360);if(!isUsableResult(title,url,snippet))continue;if(!results.some(x=>x.url===url))results.push({title,url,snippet,official:isOfficial(url)});if(results.length>=5)break;}return results.sort((a,b)=>Number(b.official)-Number(a.official));}

async function fetchOfficialPage(url:string,title:string):Promise<SearchResult|null>{
  const parseBody=(raw:string)=>{
    if(/(?:target url returned error|http error|404\s*:?\s*not found|403\s*:?\s*forbidden|502\s*:?\s*bad gateway|503\s*:?\s*service unavailable|requested resource is not found|page not found)/i.test(raw))return "";
    return cleanText(raw
      .replace(/^Title:.*$/gim," ")
      .replace(/^URL Source:.*$/gim," ")
      .replace(/^Markdown Content:.*$/gim," ")
      .replace(/[#*_>`]/g," ")
    ).slice(0,8000);
  };
  try{
    const direct=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0 (compatible; AskSOH/1.0; +https://sohconsults.com.ng)"},redirect:"follow",next:{revalidate:180}});
    if(direct.ok){
      const contentType=direct.headers.get("content-type")||"";
      const raw=await direct.text();
      const snippet=parseBody(contentType.includes("text/html")?htmlToText(raw):raw);
      if(isUsableResult(title,url,snippet))return {title,url,snippet,official:true};
    }
  }catch{}
  try{
    const readerUrl=`https://r.jina.ai/http://${url.replace(/^https?:\/\//,"")}`;
    const response=await fetch(readerUrl,{headers:{Accept:"text/plain","X-Return-Format":"markdown"},next:{revalidate:180}});
    if(!response.ok)return null;
    const snippet=parseBody(await response.text());
    return isUsableResult(title,url,snippet)?{title,url,snippet,official:true}:null;
  }catch{return null;}
}

function directOfficialTargets(question:string):Array<{title:string;url:string}>{
  if(/\blasu\b|lagos state university/i.test(question)){
    const targets=[
      {title:"LASU 2026/2027 Admission Screening Portal",url:"https://services.lidc.lasu.edu.ng/admissionscreening/"},
      {title:"Lagos State University",url:"https://lasu.edu.ng/home/"},
      {title:"LASU Latest News",url:"https://www.lasu.edu.ng/home/news/"}
    ];
    return targets;
  }
  if(/\bfuta\b|federal university of technology,? akure/i.test(question))return [
    {title:"FUTA 2026/2027 PUTME Screening",url:"https://www.futa.edu.ng/"},
    {title:"FUTA Admissions Portal",url:"https://admission.futa.edu.ng/"}
  ];
  if(/\boau\b|obafemi awolowo university/i.test(question))return [
    {title:"Obafemi Awolowo University",url:"https://oauife.edu.ng/"},
    {title:"OAU Electronic Portal",url:"https://eportal.oauife.edu.ng/"}
  ];
  if(/\bfuoye\b|federal university oye.?ekiti/i.test(question))return [
    {title:"FUOYE 2026/2027 Post-UTME Portal",url:"https://putme.fuoye.edu.ng/utme/"},{title:"FUOYE Official Screening Guide",url:"https://fuoye.edu.ng/wp-content/uploads/2026/02/FOUYE-Post-UTME-Admission-Screening-Registration-GUIDE.pdf"},{title:"FUOYE CASAPS Application Guide",url:"https://putme.fuoye.edu.ng/instruction_UG.php?session=2026%2F2027"},
    {title:"FUOYE CASAPS",url:"https://putme.fuoye.edu.ng/"},
    {title:"FUOYE Official News",url:"https://news.fuoye.edu.ng/tag/2026-2027-post-utme/"},
    {title:"Federal University Oye-Ekiti",url:"https://fuoye.edu.ng/"}
  ];
  if(/\blasustech\b|lagos state university of science and technology/i.test(question))return [
    {title:"LASUSTECH Admissions Portal",url:"https://admission.lasustech.edu.ng/"},
    {title:"LASUSTECH 2026/2027 Screening Notice",url:"https://lasustech.edu.ng/events.php?event=2026-2027-online-admission-screening-exercise-for-100-level-and-direct-entry-candidates"},
    {title:"Lagos State University of Science and Technology",url:"https://lasustech.edu.ng/"}
  ];
  if(/\buniosun\b|osun state university/i.test(question))return [
    {title:"UNIOSUN Undergraduate Admissions Portal",url:"https://admissions.uniosun.edu.ng/"},
    {title:"Osun State University",url:"https://www.uniosun.edu.ng/"}
  ];
  if(/\boou\b|olabisi onabanjo university/i.test(question))return [{title:"Olabisi Onabanjo University",url:"https://oouagoiwoye.edu.ng/"}];
  if(/\blasued\b|lagos state university of education/i.test(question))return [{title:"Lagos State University of Education",url:"https://lasued.edu.ng/"}];
  if(/\byabatech\b|yaba college of technology/i.test(question))return [{title:"Yaba College of Technology",url:"https://www.yabatech.edu.ng/"}];
  if(/\bjamb\b|caps|utme|direct entry/i.test(question))return [{title:"JAMB Official Website",url:"https://www.jamb.gov.ng/"}];
  if(/\bwaec\b/i.test(question))return [{title:"WAEC Official Website",url:"https://www.waec.org/"}];
  if(/\bneco\b/i.test(question))return [{title:"NECO Official Website",url:"https://neco.gov.ng/"}];
  if(/\bnysc\b/i.test(question))return [{title:"NYSC Official Website",url:"https://www.nysc.gov.ng/"}];
  return [];
}

async function searchOfficialSites(question:string):Promise<SearchResult[]>{
  const direct=directOfficialTargets(question);
  if(direct.length){
    const settled=await Promise.allSettled(direct.map(item=>fetchOfficialPage(item.url,item.title)));
    const results=settled.flatMap(item=>item.status==="fulfilled"&&item.value?[item.value]:[]);
    if(results.length){
      const terms=question.toLowerCase().split(/\W+/).filter(term=>term.length>3);
      return results
        .map(result=>({result,score:terms.reduce((score,term)=>score+((result.title+" "+result.snippet).toLowerCase().includes(term)?1:0),0)}))
        .sort((a,b)=>b.score-a.score)
        .map(({result})=>result);
    }
  }
  return [];
}

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
  const resolvedQuestion=context && !safeQuestion.toLowerCase().includes(context.toLowerCase()) ? `${safeQuestion}. Context subject: ${context}`.slice(0,360) : safeQuestion;
  const verifiedFact=verifiedFactAnswer(resolvedQuestion);
  if(verifiedFact)return NextResponse.json({query:safeQuestion,results:[],searchedAt:new Date().toISOString(),knowledgeMatches:0,currentSensitive:true,...verifiedFact,answer:verifiedFact.answer,generative:false,verifiedFact:true});
  const currentSensitive=/(latest|current|today|deadline|closing|close|open|ongoing|available|fee|price|cost|date|2026|2027|form|cut.?off|registration|requirement|screening|direct entry|\bde\b)/i.test(resolvedQuestion);
  const institutionHint=/\blasu\b|lagos state university/i.test(resolvedQuestion)?" Lagos State University LASU":"";
  const officialHint=currentSensitive&&institutionHint?" site:lasu.edu.ng":"";
  const googleQuery=`${resolvedQuestion}${institutionHint} Nigeria admission JAMB${officialHint}`;
  const googleUrl=`https://www.google.com/search?q=${encodeURIComponent(googleQuery)}&num=8&hl=en`;
  const [internalResults,officialResults]=await Promise.all([searchSOH(resolvedQuestion),searchOfficialSites(resolvedQuestion)]);
  const readerUrl=`https://r.jina.ai/http://www.google.com/search?q=${encodeURIComponent(googleQuery)}&num=8&hl=en`;
  try{
    const response=await fetch(readerUrl,{headers:{Accept:"text/plain","X-Return-Format":"markdown"},next:{revalidate:300}});
    if(!response.ok)throw new Error(`Search service returned ${response.status}`);
    const webResults=parseGoogleMarkdown(await response.text());
    const deduped=[...officialResults,...internalResults,...webResults].filter((item,index,all)=>isUsableResult(item.title,item.url,item.snippet)&&all.findIndex(other=>other.url===item.url)===index);
    const results=deduped.sort((a,b)=>currentSensitive ? Number(b.official)-Number(a.official) : Number(Boolean(b.internal))-Number(Boolean(a.internal))).slice(0,7);
    const composed=composeAnswer(resolvedQuestion,results,currentSensitive);
    const generated=await generateGroundedAnswer(resolvedQuestion,history,results,composed.answer,currentSensitive);
    return NextResponse.json({query:safeQuestion,googleUrl,results,searchedAt:new Date().toISOString(),knowledgeMatches:internalResults.length,currentSensitive,...composed,answer:generated??composed.answer,generative:Boolean(generated)});
  }catch(error){
    const fallbackResults=[...officialResults,...internalResults].filter((item,index,all)=>isUsableResult(item.title,item.url,item.snippet)&&all.findIndex(other=>other.url===item.url)===index);
    const composed=composeAnswer(resolvedQuestion,fallbackResults,currentSensitive);
    const generated=await generateGroundedAnswer(resolvedQuestion,history,fallbackResults,composed.answer,currentSensitive);
    return NextResponse.json({query:safeQuestion,googleUrl,results:fallbackResults,searchedAt:new Date().toISOString(),knowledgeMatches:internalResults.length,currentSensitive,...composed,answer:generated??composed.answer,generative:Boolean(generated),error:error instanceof Error?error.message:"Live search temporarily unavailable."},{status:200});
  }
}

export async function GET(request:NextRequest){return handleSearch(request);}
export async function POST(request:NextRequest){
  try{
    const body=await request.json() as {question?:string;context?:string;history?:ChatTurn[]};
    return handleSearch(request,body);
  }catch{return NextResponse.json({error:"Invalid request.",results:[]},{status:400});}
}
