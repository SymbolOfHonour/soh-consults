"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import type {QueuedStory} from "../../lib/news-queue";
export default function LinkedUpdateActions({story}:{story:QueuedStory}){
 const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 async function archive(){if(!window.confirm(`Archive ${story.title}? This removes it from the public site and all linked modules.`))return;setBusy(true);setError("");try{const response=await fetch("/api/admin/stories/status",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:story.id,status:"archived"})});const result=await response.json();if(!response.ok)throw Error(result.error||"Unable to archive");router.refresh();}catch(e){setError(e instanceof Error?e.message:"Unable to archive");}finally{setBusy(false);}}
 return <div className="flex flex-wrap gap-2"><a href={`/admin/updates/edit/${encodeURIComponent(story.id)}`} className="rounded-lg border px-3 py-2 text-xs font-bold text-gray-800">Edit linked update</a><button type="button" disabled={busy} onClick={()=>void archive()} className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-bold text-amber-900 disabled:opacity-50">{busy?"Archiving...":"Archive"}</button>{error&&<span role="alert" className="w-full text-xs text-red-700">{error}</span>}</div>;
}
