import { ResolvedQuestion } from './question-resolver';
import { SourceDocument, sessionsIn } from './source-discovery';
import { isOfficialInstitutionUrl } from './institution-registry';
export type VerifiedAnswer={answer:string;confidence:'high'|'medium'|'low';needsHuman:boolean;contradiction:boolean;citations:SourceDocument[];reason:string};
const MONTHS='january february march april may june july august september october november december'.split(' ');
export function parseCalendarDate(raw:string):string|null{
 const text=raw.trim().replace(/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*,?\s*/i,'');
 let m=text.match(/^(\d{1,2})(?:st|nd|rd|th)?[\s/-]+([a-z]+|\d{1,2})[\s,/-]+(20\d{2})\b/i);
 if(!m){const first=text.match(/^([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(20\d{2})\b/i);if(first)m=[first[0],first[2],first[1],first[3]] as RegExpMatchArray;}
 if(!m){const iso=text.match(/^(20\d{2})-(\d{2})-(\d{2})\b/);if(iso)m=[iso[0],iso[3],iso[2],iso[1]] as RegExpMatchArray;}
 if(!m)return null;const month=/^\d+$/.test(m[2])?Number(m[2])-1:MONTHS.indexOf(m[2].toLowerCase()),day=Number(m[1]),year=Number(m[3]);const d=new Date(Date.UTC(year,month,day));return month>=0&&month<12&&d.getUTCDate()===day&&d.getUTCFullYear()===year?d.toISOString().slice(0,10):null;
}
function fresh(d:SourceDocument,now:number){const observed=Date.parse(d.fetchedAt||'');return Number.isFinite(observed)&&now-observed<=86400000&&now>=observed-60000;}
export function applicableDocument(d:SourceDocument,q:ResolvedQuestion,now=Date.now()){
 if(!d.official||!d.verified||!isOfficialInstitutionUrl(d.url,q.institutionKey))return false;
 if(q.currentSensitive&&!fresh(d,now))return false;
 if(d.publishedAt&&(!Number.isFinite(Date.parse(d.publishedAt))||Date.parse(d.publishedAt)>now+60000))return false;
 const sessions=sessionsIn(d.title+' '+d.snippet);if(q.academicSession)return sessions.length===1&&sessions[0]===q.academicSession;
 // Session-dependent information needs an explicit request, never guess the latest year.
 if(['deadline','status','cutoff','requirements'].includes(q.intent)&&sessions.length)return false;
 return true;
}
export function rankDocuments(documents:SourceDocument[],question:string,q:ResolvedQuestion){const terms=question.toLowerCase().split(/[^a-z0-9]+/).filter(t=>t.length>3);return [...new Map(documents.map(d=>[d.url,d])).values()].map(d=>({d,score:terms.reduce((n,t)=>n+(d.title.toLowerCase().includes(t)?8:d.snippet.toLowerCase().includes(t)?2:0),0)+(d.official?15:0)+(d.kind==='article'||d.kind==='pdf'?12:0)+(q.academicSession&&sessionsIn(d.title+' '+d.snippet).includes(q.academicSession)?25:0)-(d.kind==='homepage'?25:0)-(d.kind==='search'?40:0)})).sort((a,b)=>b.score-a.score).map(x=>x.d);}
const uncertain=(reason:string,contradiction=false,citations:SourceDocument[]=[]):VerifiedAnswer=>({answer:contradiction?'The official evidence contains conflicting information. I cannot confirm a single answer until the notices are reconciled. Please contact S.O.H CONSULTS for verification.':'I could not verify this from directly relevant official evidence. '+reason+' Please check the official portal or contact S.O.H CONSULTS for confirmation.',confidence:'low',needsHuman:true,contradiction,citations,reason});
export function verifyAnswer(question:string,q:ResolvedQuestion,documents:SourceDocument[],now=Date.now()):VerifiedAnswer{
 if(['deadline','status','cutoff','requirements'].includes(q.intent)&&!q.academicSession)return uncertain('Which academic session do you mean?');
 const applicable=rankDocuments(documents.filter(d=>applicableDocument(d,q,now)),question,q);
 if(!applicable.length)return uncertain('No fresh, session-specific evidence was available.');
 if(q.intent==='deadline'||q.intent==='status'){
  const dates:{date:string;extension:boolean;d:SourceDocument}[]=[];
  for(const d of applicable){if(d.kind==='homepage'||d.kind==='search'||!/registration|application|screening|post.?utme|admission|examination/i.test(d.title+' '+d.snippet))continue;
   const lead=/(?:closing date|registration closes?|registration deadline(?:\s*\([^)]{0,30}\))?|application deadline|deadline for (?:registration|application)|new closing date|revised deadline|(?:registration|application|screening)[^.]{0,65}?extended (?:to|until)|deadline[^.]{0,50}?extended (?:to|until)|portal[^.]{0,50}?will (?:officially )?close)\s*(?:is|:|-|on|by|will be)?\s*/ig;
   for(const marker of d.snippet.matchAll(lead)){const date=parseCalendarDate(d.snippet.slice(marker.index!+marker[0].length,marker.index!+marker[0].length+70));if(date)dates.push({date,extension:/extended|new closing|revised/.test(marker[0].toLowerCase())||/extension|extended/i.test(d.title),d});}
  }
  if(!dates.length)return uncertain('An accessible portal does not establish its registration deadline.',false,applicable.slice(0,3));
  const unique=[...new Set(dates.map(x=>x.date))];let selected=dates[0];
  if(unique.length>1){const extensions=dates.filter(x=>x.extension);const newest=[...dates].sort((a,b)=>b.date.localeCompare(a.date))[0];
   // Supersession requires a published extension after the original, not merely the largest date.
   const publishedExtensions=extensions.filter(x=>x.date===newest.date&&Number.isFinite(Date.parse(x.d.publishedAt||''))&&dates.filter(old=>old.date!==x.date).every(old=>Number.isFinite(Date.parse(old.d.publishedAt||''))&&(x.d.url===old.d.url||Date.parse(x.d.publishedAt!)>Date.parse(old.d.publishedAt!))));
   if(new Set(extensions.map(x=>x.date)).size!==1||!publishedExtensions.length)return uncertain('Different official deadlines require review.',true,dates.map(x=>x.d));selected=publishedExtensions[0];
  }
  const formatted=new Date(selected.date+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  const passed=Date.parse(selected.date+'T23:59:59+01:00')<now;
  return {answer:`The official ${q.academicSession} notice lists ${formatted} as the ${selected.extension?'extended ':''}registration deadline. ${passed?'That date has passed. A later extension or reopening must be confirmed from a newer official notice.':'That date has not passed; confirm the portal is accepting applications before paying.'}`,confidence:selected.d.publishedAt?'high':'medium',needsHuman:!selected.d.publishedAt,contradiction:false,citations:[selected.d],reason:selected.d.publishedAt?'Dated official notice':'Official deadline without source publication date'};
 }
 if(q.intent==='cutoff'){
  const values:{value:string;d:SourceDocument}[]=[];
  for(const d of applicable){if(d.kind==='homepage'||d.kind==='search')continue;for(const m of d.snippet.matchAll(/(?:minimum\s+(?:utme\s+|jamb\s+)?score(?:\s+of)?|cut.?off\s+mark(?:\s+of)?|minimum\s+(?:utme|jamb)(?:\s+score)?)\s*[:=-]?\s*(\d{3})\b/gi)){const n=Number(m[1]);if(n>=100&&n<=400)values.push({value:m[1],d});}}
  if(new Set(values.map(v=>v.value)).size>1)return uncertain('Official minimum scores differ or depend on programme.',true,values.map(v=>v.d));
  if(!values.length)return uncertain('No explicit minimum score matched the requested session.');
  return {answer:values[0].value,confidence:'high',needsHuman:false,contradiction:false,citations:[values[0].d],reason:'Explicit session-bound official minimum score'};
 }
 if(q.answerMode==='name')return uncertain('An exact name requires a reviewed knowledge fact.');
 const terms=question.toLowerCase().split(/[^a-z0-9]+/).filter(t=>t.length>3&&!['what','when','where','which','tell','about','please'].includes(t));
 const extracts=applicable.filter(d=>d.kind!=='homepage'&&d.kind!=='search').flatMap(d=>d.snippet.split(/(?<=[.!?])\s+/).filter(s=>s.length>=35&&s.length<=700&&terms.filter(t=>!/^20\d{2}$/.test(t)&&t!==q.institutionKey).some(t=>s.toLowerCase().includes(t))&&(q.intent!=='requirements'||/require|eligib|qualification|credit|subject|document/i.test(s))&&(!/direct entry|\bde\b/i.test(question)||/direct entry|\bDE\b/.test(s))).slice(0,3).map(text=>({text,d})));
 if(!extracts.length)return uncertain('Retrieved pages do not state the answer clearly enough.',false,applicable.slice(0,3));
 // Extractive evidence is grounded, but not an assertion that a complete checklist is verified.
 return {answer:'The official source states: '+extracts.slice(0,3).map(x=>x.text).join(' '),confidence:'medium',needsHuman:q.intent==='requirements',contradiction:false,citations:[...new Map(extracts.map(x=>[x.d.url,x.d])).values()].slice(0,3),reason:'Direct relevant official excerpts; completeness needs review'};
}
