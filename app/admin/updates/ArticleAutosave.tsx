"use client";
import {useEffect,useRef,useState} from 'react';
/** Only private drafts are saved automatically; live changes always require an explicit save. */
export default function ArticleAutosave({snapshot,savedSnapshot,enabled,onSave}:{snapshot:string;savedSnapshot:string;enabled:boolean;onSave:()=>Promise<boolean>}){
 const [paused,setPaused]=useState(false),[saving,setSaving]=useState(false);
 useEffect(()=>{setPaused(false);},[savedSnapshot]);
 const save=useRef(onSave);useEffect(()=>{save.current=onSave;},[onSave]);
 useEffect(()=>{if(!enabled||paused||saving||snapshot===savedSnapshot)return;const timer=setTimeout(()=>{setSaving(true);void save.current().then(ok=>{if(!ok)setPaused(true);}).catch(()=>setPaused(true)).finally(()=>setSaving(false));},5000);return()=>clearTimeout(timer);},[snapshot,savedSnapshot,enabled,paused,saving]);
 return <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm" role="status">{paused?'Automatic saving paused after an error. Your browser recovery copy remains available.':saving?'Saving draft to the website…':snapshot===savedSnapshot?'No unsaved changes.':enabled?'Unsaved changes · saving after five seconds.':'Browser recovery keeps your edits. Use Save changes for a live article, or Save draft when ready.'}{paused&&<button type="button" onClick={()=>setPaused(false)} className="ml-3 rounded-lg border border-green-800 px-3 py-1 font-bold">Retry autosave</button>}</div>;
}
