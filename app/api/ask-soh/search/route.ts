import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { contentCatalogue } from "../../../../lib/content-catalogue";
import { listPublishedStories } from "../../../../lib/news-queue";
import { rankContent } from "../../../../lib/ranking-engine";
import { resolveQuestion } from "../../../../lib/ask-soh/question-resolver";
import { findVerifiedFacts,semanticKnowledgeSearch,getInstitution } from "../../../../lib/ask-soh/knowledge-repository";
import { recordQuestion } from "../../../../lib/ask-soh/telemetry";

import { discoverOfficialSources,searchProviderSources,SourceDocument } from "../../../../lib/ask-soh/source-discovery";
import { verifyAnswer,rankDocuments } from "../../../../lib/ask-soh/answer-verification";
import { formatAnswer } from "../../../../lib/ask-soh/question-resolver";
type SearchResult=SourceDocument;
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
Do not add URLs because the interface renders source cards separately.
Return JSON only with a quotes array: [{"sourceIndex":1,"quote":"one exact relevant sentence from that source"}]. Select up to three directly relevant sentences. Do not paraphrase, add commentary, or use conversation history as evidence.`;
  try{
    const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:process.env.ASK_SOH_MODEL||"gpt-6-luna",instructions,input:`Conversation:\n${recent||"(new conversation)"}\n\nQuestion: ${question}\nCurrent-sensitive: ${currentSensitive?"yes":"no"}\n\nEvidence:\n${evidence}\n\nFallback answer if evidence is insufficient: ${fallback}`,max_output_tokens:450}),signal:AbortSignal.timeout(12_000)});
    if(!response.ok)return null;
    const data=await response.json() as {output_text?:string;output?:Array<{content?:Array<{type?:string;text?:string}>}>};
    const text=data.output_text?.trim()||data.output?.flatMap(item=>item.content||[]).find(item=>item.type==="output_text")?.text?.trim();
    if(!text)return null;
    const parsed=JSON.parse(text) as {quotes?:Array<{sourceIndex:number;quote:string}>};
    if(!Array.isArray(parsed.quotes)||!parsed.quotes.length||parsed.quotes.length>3)return null;
    const verified=parsed.quotes.every(item=>Number.isInteger(item.sourceIndex)&&item.sourceIndex>=1&&item.sourceIndex<=Math.min(results.length,5)&&typeof item.quote==="string"&&item.quote.length>=25&&item.quote.length<=700&&results[item.sourceIndex-1].snippet.includes(item.quote));
    return verified?"The official source states: "+parsed.quotes.map(item=>item.quote).join(" "):null;
  }catch{return null;}
}
function cleanText(value:string){return value.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}
async function searchSOH(question:string):Promise<SearchResult[]>{try{const stories=await listPublishedStories();return rankContent(contentCatalogue(stories),{query:question}).filter(({breakdown})=>breakdown.relevance>0).slice(0,4).map(({item})=>({title:item.title,url:item.href,snippet:cleanText(item.body||item.summary||"Relevant S.O.H CONSULTS resource.").slice(0,4000),official:false,internal:true}));}catch{return [];}}

function examinationResultGuidance(question:string,context:string){
 const q=question.toLowerCase();const ctx=context.toLowerCase();
 const match=(q.match(/\b(waec|neco|nabteb)\b/)||ctx.match(/\b(waec|neco|nabteb)\b/));
 const exam=match?.[1]?.toUpperCase();
 if(!exam||!/\b(check|view|see)\b.{0,35}\bresult\b|\bresult\b.{0,25}\b(check|checking)\b/i.test(q))return null;
 if(exam==="WAEC")return {exam,answer:"To check your WAEC result, visit https://www.waecdirect.org/Default.aspx. Enter your examination number, examination year and type, and the requested e-PIN and voucher serial number. S.O.H CONSULTS sells WAEC result-checking scratch cards and can assist you with the process. Contact us on WhatsApp to confirm the correct card and current price."};
 if(exam==="NECO")return {exam,answer:"To check your NECO result, visit https://results.neco.gov.ng/. Select your examination year and type, enter your registration number and a valid result-checking token, then submit. S.O.H CONSULTS assists with examination result-checking tokens and scratch cards. Contact us on WhatsApp to confirm the appropriate token and current price."};
 return null;
}

function businessServiceAnswer(question:string,context:string):{answer:string;service:string}|null{
 const q=question.toLowerCase();const ctx=context.toLowerCase();
 const exam=/\b(neco|waec|nabteb)\b/.test(q)?(q.match(/\b(neco|waec|nabteb)\b/)?.[0]||"examination").toUpperCase():/\b(neco|waec|nabteb)\b/.test(ctx)?(ctx.match(/\b(neco|waec|nabteb)\b/)?.[0]||"examination").toUpperCase():"examination";
 const priceFollowUp=/^(?:and )?(?:how much(?: does it| is it| will it)?(?: cost)?|what(?:'s| is) (?:the |your )?(?:price|cost|fee)|how much for (?:it|that|this)|is it free)\??$/i.test(question.trim());
 if(priceFollowUp&&/(?:result.{0,20}check|check.{0,20}result|scratch.?card|\btoken\b|e.?pin)/i.test(ctx)){
  return {answer:`S.O.H CONSULTS can help you obtain the appropriate ${exam} result-checking scratch card or token. The current price depends on the examination and product. Please contact us on WhatsApp to confirm availability and the exact price before payment.`,service:`${exam} result-checking scratch card or token pricing`};
 }
 if(priceFollowUp&&ctx){
  const previousService=businessServiceAnswer(context,"");
  if(previousService){return {answer:`S.O.H CONSULTS can assist with ${previousService.service.toLowerCase()}. The current service fee depends on the requirements and institution. Please contact us on WhatsApp for the exact price and payment instructions. Do not pay to an unverified account.`,service:previousService.service};}
 }
 const resultToken=/(scratch.?card|result.?check(?:ing|er)?|e.?pin|\btoken\b|check.{0,20}result|no.{0,30}token|don.t have.{0,30}token)/i.test(q);
 if(resultToken&&(/\b(neco|waec|nabteb)\b/.test(q+" "+ctx)||/scratch.?card|result.?check(?:ing|er)?|e.?pin|\btoken\b/i.test(q))){
  const details=/\btoken\b|scratch.?card|e.?pin|don.t have/i.test(q)?`If you need a ${exam} result-checking token or scratch card, S.O.H CONSULTS can assist you with obtaining the appropriate result-checking access. Contact us on WhatsApp to confirm availability and the current price before payment.`:`S.O.H CONSULTS sells examination result-checking scratch cards and assists with ${exam} result checking. Contact us on WhatsApp for the correct card or token and current price. You can then check your result through the examination body's official portal.`;
  return {answer:details,service:"Examination result-checking scratch cards and tokens"};
 }
 const services:[RegExp,string,string][]=[
  [/\b(o.?level|ssce).{0,30}(upload|jamb)|upload.{0,30}(o.?level|result)/i,"O'Level result upload on JAMB","S.O.H CONSULTS assists with uploading O'Level results on JAMB. Contact us on WhatsApp for the requirements and current service fee."],
  [/\b(post.?utme|post.?ume|direct entry|\bde\b).{0,40}(register|registration|apply|application|screening)|(?:register|registration|apply|application).{0,40}(post.?utme|direct entry)/i,"Post-UTME and Direct Entry registration assistance","S.O.H CONSULTS assists with Post-UTME, Direct Entry and screening registrations. Tell us your institution and programme on WhatsApp so we can check the applicable requirements and current registration window."],
  [/\b(waec).{0,30}(digital certificate|digicert|original certificate|certificate)|(?:digital certificate|digicert).{0,30}waec/i,"WAEC certificate assistance","S.O.H CONSULTS assists candidates with WAEC Digital Certificate access and original-certificate guidance. Contact us on WhatsApp with your examination type and year for the appropriate process."],
  [/\b(jamb|utme).{0,30}(admission letter|original result|result slip)|(?:print|printing).{0,30}(admission letter|jamb result)/i,"JAMB document printing","S.O.H CONSULTS assists with printing JAMB admission letters and original UTME result slips. Contact us on WhatsApp for requirements and current charges."],
  [/\b(acceptance fee|school fees|school fee).{0,30}(pay|payment|assist|help)|(?:pay|payment).{0,30}(acceptance fee|school fees)/i,"School fee payment guidance","S.O.H CONSULTS provides guidance and assistance with school and acceptance fee processes. Contact us on WhatsApp with your institution; payment details must be confirmed on the official school portal."],
 ];
 const match=services.find(([pattern])=>pattern.test(q));return match?{answer:match[2],service:match[1]}:null;
}

async function handleSearch(request:NextRequest,body?:{question?:string;context?:string;history?:ChatTurn[]}){

  const rate=await checkRateLimit(request,"ask-soh-search",30,60*60);
  if(!rate.allowed)return NextResponse.json({error:"Search limit reached. Please try again later.",results:[]},{status:429,headers:{"Retry-After":String(rate.retryAfter)}});
  const rawQuestion=body?.question??request.nextUrl.searchParams.get("q");
  const question=typeof rawQuestion==="string"?rawQuestion.trim():null;
  const rawContext=body?.context??request.nextUrl.searchParams.get("context");
  const context=typeof rawContext==="string"?rawContext.trim().slice(0,500):undefined;
  const history=Array.isArray(body?.history)?body!.history!.filter(turn=>turn&&(turn.role==="user"||turn.role==="assistant")&&typeof turn.content==="string").slice(-6):[];
  if(!question||question.length<3)return NextResponse.json({error:"Please enter a valid question."},{status:400});
  const safeQuestion=question.slice(0,220);
  const resolvedQuestion=context && !safeQuestion.toLowerCase().includes(context.toLowerCase()) ? `${safeQuestion}. Context subject: ${context}`.slice(0,360) : safeQuestion;
  const startedAt=Date.now();
  const resolved=resolveQuestion(safeQuestion,context);
  const tokenNeed=/\b(token|scratch.?card|e.?pin)\b/i.test(safeQuestion)&&/\b(don.t have|do not have|no|need|buy|purchase|get|obtain|where|without)\b/i.test(safeQuestion);
  if(tokenNeed){
    const service=businessServiceAnswer(safeQuestion,context||"");
    if(service){void recordQuestion({question:safeQuestion,institutionKey:resolved.institutionKey,intent:resolved.intent,confidence:"high",answered:true,sourceType:"internal",latencyMs:Date.now()-startedAt});return NextResponse.json({query:safeQuestion,results:[{title:"S.O.H CONSULTS services",url:"https://sohconsults.com.ng",snippet:service.service,official:false,internal:true}],answer:service.answer,confidence:"high",needsHuman:false,serviceLead:true,serviceName:service.service,sourceType:"internal",currentSensitive:false});}
  }
  const resultGuidance=examinationResultGuidance(safeQuestion,context||"");
  if(resultGuidance){void recordQuestion({question:safeQuestion,institutionKey:resolved.institutionKey,intent:resolved.intent,confidence:"high",answered:true,sourceType:"hybrid_service",latencyMs:Date.now()-startedAt});return NextResponse.json({query:safeQuestion,results:[{title:resultGuidance.exam+" official result checker",url:resultGuidance.exam==="WAEC"?"https://www.waecdirect.org/Default.aspx":"https://results.neco.gov.ng/",snippet:"Official examination result-checking portal",official:true,internal:false}],answer:resultGuidance.answer,confidence:"high",needsHuman:false,serviceLead:true,serviceName:resultGuidance.exam+" result checking and scratch cards",sourceType:"hybrid_service",currentSensitive:false});}
  const statusQuestion=resolved.intent==="status"||/\b(still open|ongoing|closed|closing date|deadline|when.{0,15}close|has.{0,15}started)\b/i.test(safeQuestion);
  const serviceAnswer=statusQuestion?null:businessServiceAnswer(safeQuestion,context||"");
  if(serviceAnswer){void recordQuestion({question:safeQuestion,institutionKey:resolved.institutionKey,intent:resolved.intent,confidence:"high",answered:true,sourceType:"internal",latencyMs:Date.now()-startedAt});return NextResponse.json({query:safeQuestion,results:[{title:"S.O.H CONSULTS services",url:"https://sohconsults.com.ng",snippet:serviceAnswer.service,official:false,internal:true}],answer:serviceAnswer.answer,confidence:"high",needsHuman:false,serviceLead:true,serviceName:serviceAnswer.service,sourceType:"internal",currentSensitive:false});}

  const institution=await getInstitution(resolved.institutionKey);
  const [facts,internalResults,discovery]=await Promise.all([
    findVerifiedFacts(resolved,safeQuestion).catch(()=>[]),
    searchSOH(resolvedQuestion),
    institution?discoverOfficialSources(institution,safeQuestion,resolved.academicSession):Promise.resolve({documents:[],gaps:[],cacheHit:false})
  ]);
  const semanticMatches=!facts.length&&!resolved.currentSensitive?await semanticKnowledgeSearch(safeQuestion,resolved).catch(()=>[]):[];
  const knowledgeFacts=facts.length?facts:semanticMatches;
  const fact=knowledgeFacts[0];
  const knowledgeConflict=!!fact&&knowledgeFacts.some(f=>f.topic===fact.topic&&f.value_text.trim()!==fact.value_text.trim());
  // Stable facts can be served from the reviewed registry. Time-sensitive facts are
  // candidates, never a substitute for discovering newer notices and extensions.
  if(fact&&!resolved.currentSensitive&&!knowledgeConflict){
    const answer=formatAnswer(resolved.answerMode,fact.value_text,fact.answer_text);
    void recordQuestion({question:safeQuestion,institutionKey:resolved.institutionKey,intent:resolved.intent,confidence:"high",answered:true,sourceType:"verified_knowledge",latencyMs:Date.now()-startedAt});
    return NextResponse.json({query:safeQuestion,results:[{title:fact.source_name,url:fact.source_url,snippet:fact.evidence_text||answer,official:true,internal:true}],answer,confidence:"high",needsHuman:false,verifiedFact:true,sourceType:facts.length?"verified_knowledge":"verified_semantic",verifiedAt:fact.verified_at});
  }
  const registryDocuments:SourceDocument[]=knowledgeFacts.map(f=>({title:[f.source_name,f.topic,f.academic_session||""].join(" "),url:f.source_url,snippet:f.evidence_text||"",official:true,verified:true,kind:"article",publishedAt:f.source_published_at||null,fetchedAt:f.verified_at||undefined,adapter:"verified-registry"}));
  let documents=[...registryDocuments,...discovery.documents];
  let decision=verifyAnswer(safeQuestion,resolved,documents);
  // Provider failure does not discard directly discovered evidence. Search URLs
  // are refetched and verified before they enter the answer pipeline.
  const provider=decision.confidence!=="high"&&institution?await searchProviderSources(resolvedQuestion,institution):{documents:[],gaps:[]};
  documents=rankDocuments([...documents,...provider.documents],safeQuestion,resolved);
  decision=verifyAnswer(safeQuestion,resolved,documents);
  if(resolved.answerMode==="name"&&!fact){decision={...decision,answer:"I could not verify the exact name from a reviewed fact. Please contact S.O.H CONSULTS for confirmation.",confidence:"low",needsHuman:true,reason:"Exact name lacks reviewed registry evidence"};}
  if(knowledgeConflict){decision={...decision,answer:"The verified knowledge registry contains conflicting facts for this topic. Please contact S.O.H CONSULTS for confirmation.",confidence:"low",needsHuman:true,contradiction:true,reason:"Conflicting registry facts"};}
  // Never ask a model to convert a failed verification into a confident answer.
  const generated=decision.confidence!=="low"&&!decision.needsHuman&&!decision.contradiction&&resolved.intent==="general"?await generateGroundedAnswer(safeQuestion,history,decision.citations,decision.answer,resolved.currentSensitive):null;
  const results=[...decision.citations,...documents,...internalResults].filter((d,i,all)=>all.findIndex(x=>x.url===d.url)===i).slice(0,7);
  const sourceType=decision.citations.length?"official_live":internalResults.length?"internal":"none";
  void recordQuestion({question:safeQuestion,institutionKey:resolved.institutionKey,intent:resolved.intent,confidence:decision.confidence,answered:!decision.needsHuman,sourceType,latencyMs:Date.now()-startedAt});
  return NextResponse.json({query:safeQuestion,results,answer:generated||decision.answer,confidence:decision.confidence,needsHuman:decision.needsHuman,contradiction:decision.contradiction,generative:Boolean(generated),sourceType,intent:resolved.intent,answerMode:resolved.answerMode,currentSensitive:resolved.currentSensitive,searchedAt:new Date().toISOString(),verificationReason:decision.reason,coverageGaps:[...discovery.gaps,...provider.gaps],discoveryCacheHit:discovery.cacheHit,knowledgeMatches:knowledgeFacts.length});
}

export async function GET(request:NextRequest){return handleSearch(request);}
export async function POST(request:NextRequest){
  try{
    const body=await request.json() as {question?:string;context?:string;history?:ChatTurn[]};
    return await handleSearch(request,body);
  }catch{return NextResponse.json({error:"Invalid request.",results:[]},{status:400});}
}
