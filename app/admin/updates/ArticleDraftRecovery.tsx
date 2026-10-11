"use client";
import {useEffect,useRef,useState} from "react";
type Props<T extends object>={storageKey:string;snapshot:T;onRestore:(snapshot:T)=>void;saveToken?:number};
type Saved<T>={savedAt:number;snapshot:T};
/** Browser-local crash recovery; not a substitute for an authenticated server draft. */
export default function ArticleDraftRecovery<T extends object>({storageKey,snapshot,onRestore,saveToken=0}:Props<T>){
 const [pending,setPending]=useState<Saved<T>|null>(null);
 const [ready,setReady]=useState(false);
 const [enabled,setEnabled]=useState(false);
 const previousSave=useRef(saveToken);
 const baseline=useRef("");
 const serialized=JSON.stringify(snapshot);
 useEffect(()=>{
  setReady(false);setEnabled(false);setPending(null);
  baseline.current=serialized;
  try {
   const raw=localStorage.getItem(storageKey);
   if(raw){
    const parsed=JSON.parse(raw) as Saved<T>;
    if(parsed&&typeof parsed.savedAt==="number"&&parsed.snapshot&&JSON.stringify(parsed.snapshot)!==serialized)setPending(parsed);
    else {localStorage.removeItem(storageKey);setEnabled(true);}
   }else setEnabled(true);
  }catch{setEnabled(true);}
  setReady(true);
  // The key changes only when switching drafts. Initial snapshot is supplied by the parent.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[storageKey]);
 useEffect(()=>{
  if(!ready||!enabled||serialized===baseline.current)return;
  const id=setTimeout(()=>{try{localStorage.setItem(storageKey,JSON.stringify({savedAt:Date.now(),snapshot}));}catch{/* Storage may be blocked or full. */}},1200);
  return()=>clearTimeout(id);
 },[ready,enabled,serialized,snapshot,storageKey]);
 useEffect(()=>{
  if(previousSave.current===saveToken)return;
  previousSave.current=saveToken;baseline.current=serialized;
  try{localStorage.removeItem(storageKey);}catch{/* private browsing */}
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[saveToken,storageKey]);
 useEffect(()=>{if(!ready||!enabled||serialized===baseline.current)return;function warn(event:BeforeUnloadEvent){event.preventDefault();event.returnValue="";}window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[ready,enabled,serialized]);
 function recover(){if(!pending)return;onRestore(pending.snapshot);setPending(null);setEnabled(true);}
 function discard(){try{localStorage.removeItem(storageKey);}catch{}baseline.current=serialized;setPending(null);setEnabled(true);}
 return <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm" aria-label="Draft recovery">
  {pending?<div className="space-y-2"><strong>Unsaved browser draft found</strong>
   <p>Saved {new Date(pending.savedAt).toLocaleString()}. Restore it or keep the currently loaded article.</p>
   <div className="flex flex-wrap gap-2"><button type="button" className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white" onClick={recover}>Restore browser draft</button><button type="button" className="rounded-lg border px-4 py-2" onClick={discard}>Discard browser draft</button></div>
  </div>:<p className="text-gray-600">{ready?"Browser recovery is available while you edit. Use Save Draft to save to the website.":"Checking for an unsaved browser draft..."}</p>}
 </div>;
}
