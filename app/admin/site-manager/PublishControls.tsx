"use client";
import{useState}from"react";

export default function PublishControls(){
 const[publishing,setPublishing]=useState(false),[message,setMessage]=useState("");
 async function publish(){
  if(!confirm("Publish the saved CMS draft to the live S.O.H CONSULTS website?"))return;
  setPublishing(true);setMessage("");
  try{const r=await fetch("/api/admin/site-manager/publish",{method:"POST"});const j=await r.json();if(!r.ok)throw new Error(j.error||"Could not publish");setMessage(`Published successfully. Live version ${j.publishedVersion}.`);window.setTimeout(()=>window.location.reload(),900)}
  catch(e){setMessage(e instanceof Error?e.message:"Could not publish")}
  finally{setPublishing(false)}
 }
 return <div className="fixed bottom-4 right-4 z-[100] flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2 rounded-2xl border bg-white p-3 shadow-xl">
  {message&&<span className="text-xs font-bold text-[#075738]">{message}</span>}
  <a href="/admin/site-manager/preview" target="_blank" className="rounded-lg border px-3 py-2 text-xs font-black">Preview draft</a>
  <button onClick={publish} disabled={publishing} className="rounded-lg bg-green-700 px-4 py-2 text-xs font-black text-white disabled:opacity-50">{publishing?"Publishing...":"Publish changes"}</button>
 </div>
}
