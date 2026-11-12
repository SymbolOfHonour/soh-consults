import catalogue from './programmes.json';
import labels from './subjects.json';
export const programmes=catalogue;
export type Programme=(typeof programmes)[number];
export type Result={subject:string;grade:string;sitting:1|2};
export const subjectLabels:Record<string,string>=labels;
export const gradePoints:Record<string,number>={A1:8,B2:7,B3:6,C4:5,C5:4,C6:3,D7:2,E8:1,F9:0};
export const subjects=Object.values(labels).sort();
const codeByLabel=new Map(Object.entries(labels).map(([c,l])=>[l,c]));
const arts=['ARA','CRS','IRS','FRE','YOR','HAU','IGB','HIS','LIT','ART','MUS'];
const social=['ECO','GOV','GEO','COM','ACC'];
const science=['BIO','AGR','PHY','CHE','MAT','FMA','CST'];
export function explain(raw:string){return raw.replace(/\b[A-Z]{3}\b/g,c=>subjectLabels[c]||c);}
function assign(slots:string[][],available:string[]):boolean {
 if(!slots.length)return true;
 const [slot,...rest]=slots;
 return available.some((c,i)=>slot.includes(c)&&assign(rest,available.filter((_,j)=>j!==i)));
}
export function assessUtme(p:Programme,electives:string[]):'matched'|'incorrect'|'pending'|'incomplete' {
 const entered=['ENG',...electives];
 if(electives.some(x=>!x))return 'incomplete';
 if(new Set(entered).size!==4||entered.some(x=>!subjectLabels[x]))return 'incorrect';
 if(p.note.includes('UTME')||p.note.includes('four-subject'))return 'pending';
 const text=p.utme.replace(/ENG\./g,'ENG,');
 const base=text.split('(')[0].split(',').map(x=>x.trim()).filter(Boolean);
 const slots=base.map(x=>x.split('/').map(y=>y.trim()));
 for(const m of text.matchAll(/\(\+\s*(\d+)\s*([^)]*)\)/g)){
  const tail=m[2];let allowed:string[];
  if(/R\.S|R\.R|\bS\./.test(tail))return 'pending';
  if(/Social Science|Arts/.test(tail))allowed=[...arts,...social];
  else if(/S\.S/.test(tail)&&/A\.[SR]/.test(tail))allowed=[...arts,...social];
  else if(/A\.S/.test(tail))allowed=arts;
  else if(/SC\.S/.test(tail))allowed=science;
  else if(/S\.S/.test(tail))allowed=social;
  else allowed=[...tail.matchAll(/\b[A-Z]{3}\b/g)].map(x=>x[0]);
  if(!allowed.length)return 'pending';
  for(let i=0;i<Number(m[1]);i++)slots.push(allowed);
 }
 if(slots.length!==4||slots.flat().some(c=>!subjectLabels[c]))return 'pending';
 return assign(slots,entered)?'matched':'incorrect';
}
export function bestFive(p:Programme,rows:Result[],sittings:1|2){
 const best=new Map<string,Result>();
 for(const r of rows){if(r.sitting>sittings||!codeByLabel.has(r.subject)||!(gradePoints[r.grade]>=3))continue;const previous=best.get(r.subject);if(!previous||gradePoints[r.grade]>gradePoints[previous.grade])best.set(r.subject,r);}
 const available=[...best.values()];let winner:Result[]=[];let highest=-1;
 function visit(start:number,chosen:Result[]){
  if(chosen.length===5){const codes=chosen.map(r=>codeByLabel.get(r.subject)!);const pts=chosen.reduce((sum,r)=>sum+gradePoints[r.grade],0);if(pts>highest&&assign(p.slots,codes)){highest=pts;winner=[...chosen];}return;}
  for(let i=start;i<available.length;i++)visit(i+1,[...chosen,available[i]]);
 }
 visit(0,[]);return winner;
}
export function calculate(p:Programme,score:string,rows:Result[],electives:string[],sittings:1|2){
 const numeric=Number(score);const scoreValid=score.trim()!==''&&Number.isInteger(numeric)&&numeric>=0&&numeric<=400;
 const selected=bestFive(p,rows,sittings),creditsMet=selected.length===5;
 const utme=scoreValid?numeric*.15:null;
 const oLevel=creditsMet?selected.reduce((sum,r)=>sum+gradePoints[r.grade],0):null;
 return {selected,scoreValid,minimumMet:scoreValid&&numeric>=p.minimum,utme,oLevel,total:utme!==null&&oLevel!==null?utme+oLevel:null,creditsMet,utmeStatus:assessUtme(p,electives)};
}
