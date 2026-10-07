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
export function duplicateCandidates(title:string,stories:QueuedStory[],excludeId?:string,sourceUrl?:string|null,institution?:string|null){
 const q=normalise(title),source=(sourceUrl||"").trim().replace(/\/$/,""),rawInstitution=normalise(institution||""),candidateInstitution=rawInstitution&&rawInstitution!=="to be confirmed"?institutionFromText(rawInstitution)||rawInstitution:institutionFromText(title);if(q.length<8&&!source)return[];
 const words=meaningfulWords(title);
 return stories.filter(s=>s.id!==excludeId).map(s=>{
  const t=normalise(s.title);const other=meaningfulWords(s.title);
  const overlap=[...words].filter(w=>other.has(w)).length;
  const union=new Set([...words,...other]).size;
  const titleScore=union?overlap/union:0;
  const exact=t===q;
  const otherInstitution=institutionKey(s);
  const differentKnownInstitution=Boolean(candidateInstitution&&candidateInstitution!=="to be confirmed"&&otherInstitution&&candidateInstitution!==otherInstitution);
  const candidateSession=academicSession(title),otherSession=academicSession(s.title||"");
  const differentKnownSession=Boolean(candidateSession&&otherSession&&candidateSession!==otherSession);
  const candidateTopic=topicKey(title),otherTopic=topicKey(s.title||"");
  const differentKnownTopic=Boolean(candidateTopic&&otherTopic&&candidateTopic!==otherTopic);
  const fuzzy=!differentKnownInstitution&&!differentKnownSession&&!differentKnownTopic&&overlap>=2&&titleScore>=0.72;
  return{story:s,score:exact?1:titleScore,sameSource:false,exact,fuzzy};
 }).filter(x=>x.exact||x.fuzzy).sort((a,b)=>b.score-a.score).slice(0,5)
}
