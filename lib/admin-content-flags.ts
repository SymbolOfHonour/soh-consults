import type { QueuedStory } from "./news-queue";
const FEATURED="[SOH:FEATURED]";const BREAKING="[SOH:BREAKING]";
export function isFeatured(story:Pick<QueuedStory,"details">){return (story.details||"").includes(FEATURED)}
export function isBreaking(story:Pick<QueuedStory,"details">){return (story.details||"").includes(BREAKING)}
export function stripContentFlags(details:string){return details.replaceAll(FEATURED,"").replaceAll(BREAKING,"").trim()}
export function applyContentFlags(details:string,featured:boolean,breaking:boolean){const clean=stripContentFlags(details);return [featured?FEATURED:"",breaking?BREAKING:"",clean].filter(Boolean).join("\n")}
function normalise(value:string){return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim()}
const GENERIC=new Set(["the","and","for","with","from","into","now","online","academic","session","admission","admissions","candidate","candidates","result","results","release","releases","released","application","applications","form","forms","screening","update","updates","2024","2025","2026","2027","2028"]);
function meaningfulWords(value:string){return new Set(normalise(value).split(" ").filter(w=>w.length>2&&!GENERIC.has(w)))}
function academicSession(value:string){const match=normalise(value).match(/\b(20\d{2})\s+(20\d{2})\b/);return match?`${match[1]}/${match[2]}`:""}
const TOPICS:[string,string[]][]=[
 ["top up",["top up","topup"]],
 ["post utme",["post utme","postutme"]],
 ["direct entry",["direct entry"]],
 ["screening result",["screening result","screening results"]],
 ["cut off mark",["cut off mark","cutoff mark","cut off marks","cutoff marks"]],
 ["admission list",["admission list","admission lists"]],
 ["admission form",["admission form","admission forms"]],
 ["postgraduate form",["postgraduate form","postgraduate admission"]],
 ["part time form",["part time form","part time admission"]],
 ["pre degree form",["pre degree form","pre degree admission"]],
 ["sandwich form",["sandwich form","sandwich admission"]]
];
function topicKey(value:string){const text=" "+normalise(value)+" ";for(const[key,aliases]of TOPICS)if(aliases.some(alias=>text.includes(" "+normalise(alias)+" ")))return key;return""}
const INSTITUTION_ALIASES:[string,string[]][]=[
 ["uniosun",["uniosun","osun state university"]],
 ["futa",["futa","federal university of technology akure"]],
 ["lasu",["lasu","lagos state university"]],
 ["lasustech",["lasustech","lagos state university of science and technology"]],
 ["fuoye",["fuoye","federal university oye ekiti"]]
];
function institutionFromText(value:string){const text=" "+normalise(value)+" ";for(const[key,aliases]of INSTITUTION_ALIASES)if(aliases.some(alias=>text.includes(" "+normalise(alias)+" ")))return key;return""}
function institutionKey(story:QueuedStory){const institution=normalise(story.institution||"");return institution&&institution!=="to be confirmed"?institutionFromText(institution)||institution:institutionFromText(story.title||"")}
export function duplicateCandidates(title:string,stories:QueuedStory[],excludeId?:string,_sourceUrl?:string|null,_institution?:string|null){
 const q=normalise(title);
 if(q.length<8)return[];
 return stories
  .filter(s=>s.id!==excludeId)
  .map(s=>{const exact=normalise(s.title)===q;return{story:s,score:exact?1:0,sameSource:false,exact,fuzzy:false};})
  .filter(x=>x.exact)
  .slice(0,5);
}
