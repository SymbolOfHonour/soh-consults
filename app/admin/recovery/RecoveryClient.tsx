"use client";
import { useEffect,useState } from "react";
import type { QueuedStory } from "../../../lib/news-queue";
import type { AuditEntry,HistoryEntry } from "../../../lib/admin-recovery";
type Data={trash:QueuedStory[];history:HistoryEntry[];audit:AuditEntry[]};
type Tab="trash"|"history"|"audit";
export default function RecoveryClient(){
 const[data,setData]=useState<Data>({trash:[],history:[],audit:[]});
 const[tab,setTab]=useState<Tab>("trash");
 const[selected,setSelected]=useState<string[]>([]);
 const[busy,setBusy]=useState(false);
 const[msg,setMsg]=useState("");
 const[progress,setProgress]=useState("");
 async function load(){try{const r=await fetch("/api/admin/recovery",{cache:"no-store"});const j=await r.json();if(!r.ok)throw Error(j.error||"Unable to load recovery data.");setData(j);setSelected(previous=>previous.filter(id=>(j.trash as QueuedStory[]).some(story=>story.id===id)));}catch(error){setMsg(error instanceof Error?error.message:"Unable to load recovery data.");}}
 useEffect(()=>{void load();},[]);
 async function request(action:string,id:string,confirmText?:string){const r=await fetch("/api/admin/recovery",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,id,confirm:confirmText})});const j=await r.json();if(!r.ok||!j.success)throw Error(j.error||"Action failed.");}
 async function act(action:string,id:string,confirmText?:string){if(busy)return;setBusy(true);setMsg("");try{await request(action,id,confirmText);setMsg("Action completed.");await load();}catch(error){setMsg(error instanceof Error?error.message:"Action failed.");}finally{setBusy(false);}}
 function permanent(id:string){if(!window.confirm("Permanently delete this trashed update and its S.O.H-hosted files? This cannot be undone."))return;const confirmation=window.prompt("Type PERMANENTLY DELETE to confirm.");if(confirmation==="PERMANENTLY DELETE")void act("permanent-delete",id,confirmation);}
 function toggle(id:string,checked:boolean){setSelected(previous=>checked?[...previous.filter(value=>value!==id),id]:previous.filter(value=>value!==id));}
 async function bulk(action:"restore"|"permanent-delete"){
  if(busy)return;
  const ids=selected.filter(id=>data.trash.some(story=>story.id===id));
  if(!ids.length)return;
  let confirmation: string|undefined;
  if(action==="permanent-delete"){
   if(!window.confirm(`Permanently delete ${ids.length} selected update(s) and their S.O.H-hosted files? This cannot be undone.`))return;
   confirmation=window.prompt(`Type PERMANENTLY DELETE to delete all ${ids.length} selected updates.`)||undefined;
   if(confirmation!=="PERMANENTLY DELETE")return;
  }else if(!window.confirm(`Restore ${ids.length} selected update(s) to their previous statuses?`))return;
  setBusy(true);setMsg("");let succeeded=0;const failed:string[]=[];
  try{
   for(const [index,id] of ids.entries()){
    setProgress(`${action==="restore"?"Restoring":"Deleting"} ${index+1} of ${ids.length}...`);
    try{await request(action,id,confirmation);succeeded++;}catch(error){const title=data.trash.find(story=>story.id===id)?.title||id;failed.push(`${title}: ${error instanceof Error?error.message:"Action failed"}`);}
   }
   await load();
   setSelected(failed.length?ids.filter(id=>data.trash.some(story=>story.id===id)&&failed.some(entry=>entry.startsWith(`${data.trash.find(story=>story.id===id)?.title||id}:`))):[]);
   setMsg(`${succeeded} of ${ids.length} update(s) ${action==="restore"?"restored":"permanently deleted"}.${failed.length?` Failed: ${failed.join("; ")}`:""}`);
  }catch(error){setMsg(error instanceof Error?error.message:"Unable to refresh recovery data.");}
  finally{setProgress("");setBusy(false);}
 }
 const allSelected=data.trash.length>0&&data.trash.every(story=>selected.includes(story.id));
 return <div>
  <div className="mb-5 flex flex-wrap gap-2">{(["trash","history","audit"] as const).map(t=><button type="button" key={t} onClick={()=>setTab(t)} disabled={busy} aria-pressed={tab===t} className={`rounded-xl px-4 py-2 text-sm font-black ${tab===t?"bg-green-700 text-white":"border bg-white text-gray-800"}`}>{t==="trash"?`Trash (${data.trash.length})`:t==="history"?`Version History (${data.history.length})`:`Audit Log (${data.audit.length})`}</button>)}</div>
  {msg&&<p role="status" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900">{msg}</p>}{progress&&<p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm font-bold text-green-900">{progress}</p>}
  {tab==="trash"&&<div className="space-y-3">
   <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-white p-3" aria-label="Trash bulk actions"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={allSelected} disabled={busy||!data.trash.length} onChange={event=>setSelected(event.target.checked?data.trash.map(story=>story.id):[])} aria-label="Select all trashed updates"/>Select all</label><button type="button" disabled={busy||!data.trash.length} onClick={()=>setSelected(data.trash.map(story=>story.id))} className="rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-40">Select all</button><button type="button" disabled={busy||!selected.length} onClick={()=>setSelected([])} className="rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-40">Unselect all</button><span className="text-sm font-bold text-gray-600" aria-live="polite">{selected.length} selected</span><button type="button" disabled={busy||!selected.length} onClick={()=>void bulk("restore")} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-black text-white disabled:opacity-40">Restore selected</button><button type="button" disabled={busy||!selected.length} onClick={()=>void bulk("permanent-delete")} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-black text-white disabled:opacity-40">Delete selected forever</button></div>
   {data.trash.length?data.trash.map(s=>{const days=Math.max(0,30-Math.floor((Date.now()-+new Date(s.updated_at))/86400000));return <article key={s.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex min-w-0 flex-1 items-start gap-3"><input type="checkbox" aria-label={`Select ${s.title}`} checked={selected.includes(s.id)} disabled={busy} onChange={event=>toggle(s.id,event.target.checked)} className="mt-1 h-5 w-5 shrink-0"/><div className="min-w-0"><h3 className="break-words font-black">{s.title}</h3><p className="mt-1 text-xs font-bold text-gray-500">Moved {new Date(s.updated_at).toLocaleString("en-NG")} · Recovery window: {days} day{days===1?"":"s"} remaining</p></div></div><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>void act("restore",s.id)} className="rounded-xl bg-green-700 px-4 py-2 text-sm font-black text-white disabled:opacity-40">Restore</button><button type="button" disabled={busy} onClick={()=>permanent(s.id)} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white disabled:opacity-40">Delete Forever</button></div></div></article>}):<p className="rounded-2xl border bg-white p-6 text-sm text-gray-500">Trash is empty.</p>}
  </div>}
  {tab==="history"&&<div className="space-y-3">{data.history.length?data.history.map(h=><article key={h.id} className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black">{h.title}</h3><p className="mt-1 text-xs font-bold text-gray-500">{h.action.replaceAll("_"," ")} · {new Date(h.created_at).toLocaleString("en-NG")}</p><p className="mt-2 text-sm text-gray-600">Snapshot status: <b>{h.snapshot.status}</b> · {h.snapshot.category}</p></div><button type="button" disabled={busy} onClick={()=>{if(window.confirm("Restore this previous version? The current version will be saved first."))void act("restore-version",h.id);}} className="rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-sm font-black text-green-900 disabled:opacity-40">Restore Version</button></div></article>):<p className="rounded-2xl border bg-white p-6 text-sm text-gray-500">No version history yet. New edits will automatically create snapshots.</p>}</div>}
  {tab==="audit"&&<div className="space-y-3">{data.audit.length?data.audit.map(a=><article key={a.id} className="rounded-2xl border bg-white p-4"><p className="font-black">{a.action}</p><p className="mt-1 text-sm font-bold text-gray-700">{a.title}</p><p className="mt-1 text-xs text-gray-500">{new Date(a.created_at).toLocaleString("en-NG")}{a.details?` · ${a.details}`:""}</p></article>):<p className="rounded-2xl border bg-white p-6 text-sm text-gray-500">No audit activity recorded yet.</p>}</div>}
 </div>;
}
