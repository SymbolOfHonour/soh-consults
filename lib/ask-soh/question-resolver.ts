import {resolveInstitution} from "./institution-registry";
export type AnswerMode="numeric"|"name"|"boolean"|"short"|"structured"|"reasoned";
export type ResolvedQuestion={institutionKey:string|null;intent:string;answerMode:AnswerMode;currentSensitive:boolean;academicSession:string|null;academicYear?:string|null;explicitInstitution:boolean;course?:string|null;admissionRoute?:string|null};
const CURRENT=/(latest|current|currently|today|now|deadline|closing|still open|ongoing|available|this year|2026|2027|form|registration|screening)/i;
export function resolveQuestion(question:string,context?:string):ResolvedQuestion{
 const explicit=resolveInstitution(question); const inherited=!explicit&&context?resolveInstitution(context):null; const q=question.toLowerCase();
 const cutoff=/(cut.?of{1,2}|minimum.{0,15}(utme|jamb|score)|jamb.{0,15}minimum)/i.test(q);
 const vc=/(vice[- ]?chancellor|\bvc\b)/i.test(q);
 const deadline=/(deadline|closing date|when.{0,12}close)/i.test(q);
 const status=/(still open|ongoing|has .* started|is .* open|available now)/i.test(q);
 const requirements=/(requirement|eligib|what do i need|documents?|subject.{0,25}combin|utme subjects|what subjects)/i.test(q);
 const localIntent=cutoff?"cutoff":vc?"vice_chancellor":deadline?"deadline":status?"status":requirements?"requirements":"general";
 const contextQ=(!explicit||inherited||resolveInstitution(context||"")?.key===explicit.key?context||"":"").toLowerCase(); const inheritedIntent=/(cut.?of{1,2}|minimum.{0,15}(utme|jamb|score))/i.test(contextQ)?"cutoff":/(vice[- ]?chancellor|\bvc\b)/i.test(contextQ)?"vice_chancellor":/(deadline|closing date)/i.test(contextQ)?"deadline":/(requirement|eligib)/i.test(contextQ)?"requirements":"general";
 const intent=localIntent==="general"&&!!contextQ?inheritedIntent:localIntent;
 const answerMode:AnswerMode=intent==="cutoff"?"numeric":intent==="vice_chancellor"?"name":status?"boolean":intent==="requirements"?"structured":"short";
 const session=(question+" "+contextQ).match(/20\d{2}\s*[\/_-]\s*20\d{2}/)?.[0]?.replace(/\s/g,"").replace(/[_-]/g,"/")||null;
 const scopeText=question+" "+contextQ;
 const course=scopeText.match(/(?:for|study)\s+([a-z][a-z '&-]{1,65}?)\s+(?:at|in)\s+/i)?.[1]?.trim().toLowerCase()||null;
 const localRoute=/direct entry|\bde\b/i.test(question)?"direct-entry":/\butme\b/i.test(question)?"utme":null;
 const admissionRoute=localRoute||(/direct entry|\bde\b/i.test(contextQ)?"direct-entry":/\butme\b/i.test(contextQ)?"utme":null);
 return {course,admissionRoute,institutionKey:(explicit||inherited)?.key||null,intent,answerMode,currentSensitive:cutoff||CURRENT.test(question)||deadline||status||vc||["cutoff","deadline","status","requirements","vice_chancellor"].includes(intent)||/\b(fee|fees|price|cost|tuition|admission status|admitted|offered admission)\b/i.test(question),academicSession:session,academicYear:!session&&["jamb","waec","neco"].includes((explicit||inherited)?.key||"")?question.match(/\b20\d{2}\b/)?.[0]||null:null,explicitInstitution:!!explicit};
}
export function formatAnswer(mode:AnswerMode,value:string,answerText?:string|null){if(mode==="numeric"||mode==="name")return value.trim();if(mode==="boolean")return (answerText||value).trim();return (answerText||value).trim();}
