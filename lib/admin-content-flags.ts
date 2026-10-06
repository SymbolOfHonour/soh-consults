import type { QueuedStory } from "./news-queue";
const FEATURED="[SOH:FEATURED]";const BREAKING="[SOH:BREAKING]";
export function isFeatured(story:Pick<QueuedStory,"details">){return (story.details||"").includes(FEATURED)}
export function isBreaking(story:Pick<QueuedStory,"details">){return (story.details||"").includes(BREAKING)}
export function stripContentFlags(details:string){return details.replaceAll(FEATURED,"").replaceAll(BREAKING,"").trim()}
export function applyContentFlags(details:string,featured:boolean,breaking:boolean){const clean=stripContentFlags(details);return [featured?FEATURED:"",breaking?BREAKING:"",clean].filter(Boolean).join("\n")}
function normalise(value:string){return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim()}
const GENERIC=new Set(["the","and","for","with","from","into","now","online","academic","session","admission","admissions","candidate","candidates","result","results","release","releases","released","application","applications","form","forms","screening","update","updates","2024","2025","2026","2027","2028"]);
function meaningfulWords(value:string){return new Set(normalise(value).split(" ").filter(w=>w.length>2&&!GENERIC.has(w)))}
function institutionKey(story:QueuedStory){const institution=normalise(story.institution||"");return institution&&institution!=="to be confirmed"?institution:""}
export function duplicateCandidates(title:string,stories:QueuedStory[],excludeId?:string,sourceUrl?:string|null,institution?:string|null){
 const q=normalise(title),source=(sourceUrl||"").trim().replace(/\/$/,""),candidateInstitution=normalise(institution||"");if(q.length<8&&!source)return[];
 const words=meaningfulWords(title);
 return stories.filter(s=>s.id!==excludeId).map(s=>{
  const t=normalise(s.title);const other=meaningfulWords(s.title);
  const overlap=[...words].filter(w=>other.has(w)).length;
  const union=new Set([...words,...other]).size;
  const titleScore=union?overlap/union:0;
  const exact=t===q;
  const otherInstitution=institutionKey(s);
  const differentKnownInstitution=Boolean(candidateInstitution&&candidateInstitution!=="to be confirmed"&&otherInstitution&&candidateInstitution!==otherInstitution);
  const fuzzy=!differentKnownInstitution&&overlap>=2&&titleScore>=0.72;
  return{story:s,score:exact?1:titleScore,sameSource:false,exact,fuzzy};
 }).filter(x=>x.exact||x.fuzzy).sort((a,b)=>b.score-a.score).slice(0,5)
}
