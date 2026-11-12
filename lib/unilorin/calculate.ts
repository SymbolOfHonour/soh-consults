import catalogue from './programmes.json';
import labels from './subjects.json';
export const programmes=catalogue;
export type Programme=(typeof programmes)[number];
export type Result={subject:string;grade:string;sitting:1|2};
export const subjectLabels:Record<string,string>=labels;
export const gradePoints:Record<string,number>={A1:6,B2:5,B3:4,C4:3,C5:2,C6:1,D7:0,E8:0,F9:0};
export const subjects=Object.values(labels).sort();
const codeByLabel=new Map(Object.entries(labels).map(([code,label])=>[label,code]));
function assign(slots:string[][],available:string[]):boolean {
 if(!slots.length)return available.length===0;
 const ordered=[...slots].sort((a,b)=>a.length-b.length),[slot,...rest]=ordered;
 return available.some((c,i)=>slot.includes(c)&&assign(rest,available.filter((_,j)=>j!==i)));
}
export function describeSlots(slots:string[][]){
 return slots.map(slot=>slot.length>20?'one other relevant subject':slot.map(c=>subjectLabels[c]).join(' or ')).join('; ');
}
export function assessUtme(p:Programme,electives:string[]){
 if(electives.length!==3||electives.some(x=>!x))return 'incomplete';
 const entered=['ENG',...electives];
 if(new Set(entered).size!==4||entered.some(x=>!subjectLabels[x]))return 'incorrect';
 if(!assign(p.utmeSlots,entered))return 'incorrect';
 return p.reviewRequired?'pending':'matched';
}
export function bestFive(p:Programme,rows:Result[],sittings:1|2):Result[]{
 if(p.oneSitting){
  const options=([1,2] as const).filter(s=>s<=sittings).map(s=>bestFive({...p,oneSitting:false},rows.filter(r=>r.sitting===s),sittings)).filter(r=>r.length===5);
  if(options.length)return options.sort((a,b)=>b.reduce((n,r)=>n+gradePoints[r.grade],0)-a.reduce((n,r)=>n+gradePoints[r.grade],0))[0];
 }
 const best=new Map<string,Result>();
 for(const r of rows){if(r.sitting>sittings||!codeByLabel.has(r.subject)||!(gradePoints[r.grade]>0))continue;const previous=best.get(r.subject);if(!previous||gradePoints[r.grade]>gradePoints[previous.grade])best.set(r.subject,r);}
 const available=[...best.values()];
 if(p.manual&&available.length!==5)return [];
 let winner:Result[]=[];let highest=-1;
 function visit(start:number,chosen:Result[]){
  if(chosen.length===5){const pts=chosen.reduce((sum,r)=>sum+gradePoints[r.grade],0);if(pts>highest&&assign(p.slots,chosen.map(r=>codeByLabel.get(r.subject)!))){highest=pts;winner=[...chosen];}return;}
  for(let i=start;i<available.length;i++)visit(i+1,[...chosen,available[i]]);
 }
 visit(0,[]);return winner;
}
export function validScore(value:string,max:number,integer=false){const n=Number(value);return value.trim()!==''&&Number.isFinite(n)&&n>=0&&n<=max&&(!integer||Number.isInteger(n));}
export function calculate(p:Programme,score:string,postScore:string,rows:Result[],electives:string[],sittings:1|2){
 const selected=bestFive(p,rows,sittings),scoreValid=validScore(score,400,true),postValid=validScore(postScore,100);
 const utme=scoreValid?Number(score)/8:null,post=postValid?Number(postScore)*.3:null;
 const oLevel=selected.length===5?selected.reduce((sum,r)=>sum+gradePoints[r.grade],0)/30*20:null;
 // Check sittings used by the selected credits, not merely whether the user opened sitting 2.
 const sittingsUsed=new Set(selected.map(r=>r.sitting)).size;
 const sittingMet=!p.oneSitting||sittingsUsed<=1;
 const physicsPassMet=!p.extraPhysicsPass||rows.some(r=>r.subject==='Physics'&&r.sitting<=sittings&&Object.hasOwn(gradePoints,r.grade)&&r.grade!=='F9');
 const biologyPassMet=!p.extraBiologyPassIfAgr||!selected.some(r=>r.subject==='Agricultural Science')||rows.some(r=>r.subject==='Biology'&&r.sitting<=sittings&&Object.hasOwn(gradePoints,r.grade)&&r.grade!=='F9');
 const extraPassMet=physicsPassMet&&biologyPassMet;
 return {selected,scoreValid,postValid,utme,post,oLevel,total:utme!==null&&post!==null&&oLevel!==null?utme+post+oLevel:null,creditsMet:selected.length===5,sittingMet,extraPassMet,sittingReview:p.sittingReview&&sittingsUsed>1,utmeStatus:assessUtme(p,electives)};
}
export function targetScores(target:string,utme:number|null,post:number|null,oLevel:number|null){
 if(!validScore(target,100)||oLevel===null)return null;
 const t=Number(target);
 const requiredPost=utme===null?null:Math.max(0,Math.ceil(((t-utme-oLevel)/.3-1e-9)*100)/100);
 const requiredUtme=post===null?null:Math.max(0,Math.ceil((t-post-oLevel)*8-1e-9));
 return {requiredPost,requiredUtme,postPossible:requiredPost!==null&&requiredPost<=100,utmePossible:requiredUtme!==null&&requiredUtme<=400};
}
