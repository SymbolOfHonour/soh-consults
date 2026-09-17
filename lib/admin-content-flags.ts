import type { QueuedStory } from "./news-queue";
const FEATURED="[SOH:FEATURED]";const BREAKING="[SOH:BREAKING]";
export function isFeatured(story:Pick<QueuedStory,"details">){return (story.details||"").includes(FEATURED)}
export function isBreaking(story:Pick<QueuedStory,"details">){return (story.details||"").includes(BREAKING)}
export function stripContentFlags(details:string){return details.replaceAll(FEATURED,"").replaceAll(BREAKING,"").trim()}
export function applyContentFlags(details:string,featured:boolean,breaking:boolean){const clean=stripContentFlags(details);return [featured?FEATURED:"",breaking?BREAKING:"",clean].filter(Boolean).join("\n")}
function normalise(value:string){return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim()}
export function duplicateCandidates(title:string,stories:QueuedStory[],excludeId?:string,sourceUrl?:string|null){const q=normalise(title),source=(sourceUrl||"").trim().replace(/\/$/,"");if(q.length<8&&!source)return[];const words=new Set(q.split(" ").filter(w=>w.length>2));return stories.filter(s=>s.id!==excludeId).map(s=>{const t=normalise(s.title);const other=new Set(t.split(" ").filter(w=>w.length>2));const overlap=[...words].filter(w=>other.has(w)).length;const titleScore=words.size?overlap/Math.max(words.size,other.size):0;const sameSource=Boolean(source&&s.official_source_url?.trim().replace(/\/$/,"")===source);return{story:s,score:sameSource?1:titleScore,sameSource};}).filter(x=>x.sameSource||normalise(x.story.title)===q||x.score>=0.72).sort((a,b)=>b.score-a.score).slice(0,5)}
