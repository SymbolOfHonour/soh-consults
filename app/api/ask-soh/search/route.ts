import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { contentCatalogue } from "../../../../lib/content-catalogue";
import { listPublishedStories } from "../../../../lib/news-queue";
import { rankContent } from "../../../../lib/ranking-engine";

type SearchResult={title:string;url:string;snippet:string;official:boolean;internal?:boolean};
const OFFICIAL_HOSTS=["jamb.gov.ng","lasu.edu.ng","lidc.lasu.edu.ng","services.lidc.lasu.edu.ng","education.gov.ng","nbte.gov.ng","nysc.gov.ng","waec.org","neco.gov.ng"];
function cleanText(value:string){return value.replace(/\s+/g," ").replace(/^[-–—•]+\s*/,"").trim();}
function isOfficial(url:string){try{const host=new URL(url).hostname.toLowerCase().replace(/^www\./,"");return OFFICIAL_HOSTS.some(a=>host===a||host.endsWith(`.${a}`));}catch{return false;}}
function parseGoogleMarkdown(markdown:string):SearchResult[]{const lines=markdown.split("\n"),results:SearchResult[]=[];for(let i=0;i<lines.length;i++){const line=lines[i].trim(),match=line.match(/^\[(.+?)\]\((https?:\/\/[^)]+)\)$/);if(!match)continue;const title=cleanText(match[1]);let url=match[2];try{const parsed=new URL(url);if(parsed.hostname.includes("google.")&&parsed.pathname==="/url"){const target=parsed.searchParams.get("q")||parsed.searchParams.get("url");if(target)url=target;}}catch{continue;}if(!title||title.toLowerCase().includes("google")||url.includes("google.com/search")||url.includes("accounts.google")||url.includes("support.google"))continue;const parts:string[]=[];for(let j=i+1;j<Math.min(lines.length,i+7);j++){const c=cleanText(lines[j]);if(!c)continue;if(/^\[.+?\]\(https?:\/\//.test(c))break;if(c.startsWith("http"))continue;if(c.length>20)parts.push(c);if(parts.join(" ").length>320)break;}const snippet=cleanText(parts.join(" ")).slice(0,360);if(!snippet)continue;if(!results.some(x=>x.url===url))results.push({title,url,snippet,official:isOfficial(url)});if(results.length>=5)break;}return results.sort((a,b)=>Number(b.official)-Number(a.official));}

async function searchSOH(question:string):Promise<SearchResult[]>{
  try{
    const stories=await listPublishedStories();
    return rankContent(contentCatalogue(stories),{query:question})
      .filter(({breakdown})=>breakdown.relevance>0)
      .slice(0,4)
      .map(({item})=>({title:item.title,url:item.href,snippet:cleanText(item.summary||item.body||"Relevant S.O.H CONSULTS resource.").slice(0,360),official:false,internal:true}));
  }catch{return [];}
}

export async function GET(request:NextRequest){
  const rate=await checkRateLimit(request,"ask-soh-search",30,60*60);
  if(!rate.allowed)return NextResponse.json({error:"Search limit reached. Please try again later.",results:[]},{status:429,headers:{"Retry-After":String(rate.retryAfter)}});
  const question=request.nextUrl.searchParams.get("q")?.trim();
  const context=request.nextUrl.searchParams.get("context")?.trim().slice(0,180);
  if(!question||question.length<3)return NextResponse.json({error:"Please enter a valid question."},{status:400});
  const safeQuestion=question.slice(0,220);
  const resolvedQuestion=context && !safeQuestion.toLowerCase().includes(context.toLowerCase()) ? `${context}. ${safeQuestion}`.slice(0,360) : safeQuestion;
  const currentSensitive=/(latest|current|today|deadline|closing|close|open|fee|price|cost|date|2026|2027|form|cut.?off|registration)/i.test(resolvedQuestion);
  const googleQuery=`${resolvedQuestion} Nigeria admission JAMB`;
  const googleUrl=`https://www.google.com/search?q=${encodeURIComponent(googleQuery)}&num=8&hl=en`;
  const internalResults=await searchSOH(resolvedQuestion);
  const readerUrl=`https://r.jina.ai/http://www.google.com/search?q=${encodeURIComponent(googleQuery)}&num=8&hl=en`;
  try{
    const response=await fetch(readerUrl,{headers:{Accept:"text/plain","X-Return-Format":"markdown"},next:{revalidate:300}});
    if(!response.ok)throw new Error(`Search service returned ${response.status}`);
    const webResults=parseGoogleMarkdown(await response.text());
    return NextResponse.json({query:safeQuestion,googleUrl,results:[...internalResults,...webResults].slice(0,7),searchedAt:new Date().toISOString(),knowledgeMatches:internalResults.length,currentSensitive});
  }catch(error){
    return NextResponse.json({query:safeQuestion,googleUrl,results:internalResults,searchedAt:new Date().toISOString(),knowledgeMatches:internalResults.length,currentSensitive,error:error instanceof Error?error.message:"Live search temporarily unavailable."},{status:200});
  }
}
