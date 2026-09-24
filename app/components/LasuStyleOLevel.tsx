"use client";
import {useEffect,useState} from "react";

export type OLevelResultEntry={subject:string;grade:string;sitting:1|2};
type Props={
 subjects:string[]; grades:string[]; value:OLevelResultEntry[]; onChange:(v:OLevelResultEntry[])=>void;
 sittings:1|2; onSittingsChange:(v:1|2)=>void; maxPerSitting?:number; disabledTwo?:boolean; note?:string;
};
const blank=(s:1|2):OLevelResultEntry=>({subject:"",grade:"",sitting:s});
export default function LasuStyleOLevel({subjects,grades,value,onChange,sittings,onSittingsChange,maxPerSitting=9,disabledTwo=false,note}:Props){
 const rows=(sit:1|2)=>{const existing=value.filter(x=>x.sitting===sit);return [...existing,...Array.from({length:Math.max(0,maxPerSitting-existing.length)},()=>blank(sit))].slice(0,maxPerSitting)};
 const [first,setFirst]=useState<OLevelResultEntry[]>(()=>rows(1)); const [second,setSecond]=useState<OLevelResultEntry[]>(()=>rows(2));
 useEffect(()=>{onChange(sittings===1?first:[...first,...second])},[first,second,sittings]);
 const edit=(sit:1|2,i:number,key:"subject"|"grade",v:string)=>{const setter=sit===1?setFirst:setSecond;setter(old=>old.map((r,n)=>n===i?{...r,[key]:v}:r))};
 const section=(sit:1|2,list:OLevelResultEntry[])=><div className="mt-6"><h3 className="text-sm font-black tracking-wide text-green-800">{sit===1?"FIRST SITTING":"SECOND SITTING"}</h3><div className="mt-3 space-y-3">{list.map((r,i)=><div key={i} className="grid gap-3 sm:grid-cols-[1fr_145px]"><label className="text-xs font-bold text-slate-600">Subject {i+1}<select className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-normal" value={r.subject} onChange={e=>edit(sit,i,"subject",e.target.value)}><option value="">Select subject</option>{subjects.map(s=><option key={s} value={s} disabled={(sit===1?first:second).some((q)=>q!==r&&q.subject===s)}>{s}</option>)}</select></label><label className="text-xs font-bold text-slate-600">Grade<select className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-normal" value={r.grade} onChange={e=>edit(sit,i,"grade",e.target.value)}><option value="">Select grade</option>{grades.map(g=><option key={g}>{g}</option>)}</select></label></div>)}</div></div>;
 return <div className="mt-4"><div className="rounded-2xl bg-green-50 p-4"><label className="text-sm font-black">Number of O-Level Sittings<select className="mt-2 block w-full rounded-xl border border-green-300 bg-white p-3 font-normal" value={sittings} onChange={e=>onSittingsChange(Number(e.target.value) as 1|2)}><option value={1}>1 Sitting</option><option value={2} disabled={disabledTwo}>2 Sittings</option></select></label><p className="mt-2 text-xs text-slate-600">{note||"Select 2 Sittings if you want to combine valid O-Level subjects from two results."}</p></div>{section(1,first)}{sittings===2&&section(2,second)}</div>
}