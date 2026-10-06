import { rankContent, type RankableContent, type RankingContext } from "./ranking-engine";
import { normaliseText, searchableText, contentTopics, deadlineDate } from "./discovery-text";

export type DiscoveryKind = "update" | "opportunity" | "deadline" | "guide" | "calculator";
export type DiscoveryItem = RankableContent & { id: string; href: string; kind: DiscoveryKind; keywords?: string[] };
export type VisitorInterests = { institutions?: string[]; categories?: string[] };

const normalise=(v?:string)=>(v||"").trim().toLowerCase();

export function personalisedContext(base: RankingContext, interests?: VisitorInterests): RankingContext {
  if (!interests) return base;
  return {
    ...base,
    institution: base.institution || interests.institutions?.[0],
    category: base.category || interests.categories?.[0],
  };
}

export function unifiedSearch<T extends DiscoveryItem>(items:T[], query:string, context:RankingContext={}, interests?:VisitorInterests){
  const q=query.trim();
  if(!q) return rankContent(items, personalisedContext(context, interests));
  return rankContent(items, personalisedContext({...context,query:q}, interests)).filter(result=>result.breakdown.relevance>0);
}

export function relatedContent<T extends DiscoveryItem>(current:T, candidates:T[], limit=6, now=new Date()){
  const topics=contentTopics(`${current.title} ${current.summary||""} ${(current.keywords||[]).join(" ")}`);
  const affinity=(item:T)=>{
    const shared=contentTopics(`${item.title} ${item.summary||""} ${(item.keywords||[]).join(" ")}`).filter(t=>topics.includes(t)).length;
    const sameSchool=Boolean(current.institution&&(searchableText(item.institution||"").split(" ").includes(normaliseText(current.institution)) || normaliseText(current.institution)===normaliseText(item.institution)));
    const sameCategory=Boolean(current.category&&normaliseText(current.category)===normaliseText(item.category));
    return shared*12+(sameSchool?14:0)+(sameCategory?4:0);
  };
  const seen=new Set<string>();
  return rankContent(candidates.filter(item=>item.id!==current.id && item.href!==current.href && affinity(item)>0 && !(deadlineDate(item.deadline) && +deadlineDate(item.deadline)! < +now)),{institution:current.institution,category:current.category,now})
    .sort((a,b)=>affinity(b.item)-affinity(a.item)||b.score-a.score)
    .filter(({item})=>{if(seen.has(item.href))return false;seen.add(item.href);return true;}).slice(0,limit);
}

export function trendingContent<T extends DiscoveryItem>(items:T[], now=new Date(), limit=8){
  return rankContent(items.map(item=>{
    const published=item.publishedAt?new Date(item.publishedAt):null;
    const ageHours=published&&!Number.isNaN(published.getTime())?Math.max(1,(now.getTime()-published.getTime())/3_600_000):720;
    const velocity=((item.views||0)+(item.clicks||0)*3)/Math.max(12,ageHours);
    return {...item,clicks:(item.clicks||0)+Math.min(50,velocity*10)};
  }),{now}).slice(0,limit);
}

export function rankingReasons(item:RankableContent, context:RankingContext={}){
  const result=rankContent([item],context)[0];
  if(!result) return [];
  const b=result.breakdown;
  return [
    b.relevance>0&&"Matches the visitor's search",
    b.freshness>=12&&"Recently published",
    b.urgency>=11&&"Deadline is approaching",
    b.authority>=10&&"Official/authoritative source",
    b.importance>=6&&"High-value admission information",
    b.engagement>=4&&"Receiving meaningful engagement",
    b.context>=6&&"Matches visitor context",
    b.stalenessPenalty>0&&"Reduced for age or expiry",
  ].filter(Boolean) as string[];
}

export const SESSION_INTEREST_KEY="soh:visitor-interests:v1";
export function recordSessionInterest(institution?:string,category?:string){
  if(typeof window==="undefined")return;
  try{
    const previous=JSON.parse(sessionStorage.getItem(SESSION_INTEREST_KEY)||"{}") as VisitorInterests;
    const add=(values:string[]=[],value?:string)=>value?[value,...values.filter(v=>normalise(v)!==normalise(value))].slice(0,5):values;
    sessionStorage.setItem(SESSION_INTEREST_KEY,JSON.stringify({institutions:add(previous.institutions,institution),categories:add(previous.categories,category)}));
  }catch{}
}
export function readSessionInterests():VisitorInterests{
  if(typeof window==="undefined")return{};
  try{return JSON.parse(sessionStorage.getItem(SESSION_INTEREST_KEY)||"{}") as VisitorInterests;}catch{return{};}
}
