"use client";
import { useState } from "react";
import type { TeamMember } from "../../../lib/editor-team";
export default function WriterProfile({member,onChange}:{member:TeamMember;onChange:(member:TeamMember)=>void}) {
  const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
  async function update(body:FormData|Record<string,unknown>,method:"POST"|"PATCH") {
    setBusy(true);setMessage("");
    try {
      const r=await fetch("/api/admin/writer/profile",{method,...(body instanceof FormData?{body}:{headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})});
      const d=await r.json();if(!r.ok)throw Error(d.error);onChange(d.member);setMessage("Your profile has been saved.");
    } catch(e){setMessage(e instanceof Error?e.message:"Unable to save your profile.");}finally{setBusy(false);}
  }
  return <details className="rounded-2xl border bg-white p-5"><summary className="cursor-pointer text-xl font-bold">My writer profile</summary><div className="mt-4 grid gap-5 sm:grid-cols-[160px_1fr]">
    <div>{member.picture_url ? <img src={member.picture_url} alt={`${member.name}'s picture`} width={120} height={120} className="h-28 w-28 rounded-full object-cover"/>:<div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-100 text-3xl font-bold">{member.name.slice(0,1)}</div>}<label className="mt-3 block text-sm font-bold">Change picture<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="mt-2 block w-full text-sm" onChange={e=>{const file=e.target.files?.[0];if(file){if(file.size>2*1024*1024){setMessage("Choose a picture up to 2 MB.");return;}const data=new FormData();data.set("file",file);void update(data,"POST");}e.target.value="";}}/></label><p className="mt-2 text-xs">JPG, PNG or WebP · up to 2 MB</p></div>
    <form action={form=>update({name:form.get("name"),about:form.get("about"),remove_picture:form.get("remove_picture")==="on"},"PATCH")} className="space-y-3"><label className="block font-bold">Author name<input name="name" defaultValue={member.name} required maxLength={100} disabled={busy} className="mt-1 w-full rounded-xl border p-3"/></label><label className="block font-bold">About you<textarea name="about" defaultValue={member.about||""} maxLength={1000} rows={4} disabled={busy} className="mt-1 w-full rounded-xl border p-3"/></label>{member.picture_url&&<label className="block"><input name="remove_picture" type="checkbox" disabled={busy}/> Remove my picture</label>}<p className="text-sm text-gray-600">Your name, picture and About appear on articles linked to your writer account. Your email and team role are managed by the site owner.</p><button disabled={busy} className="rounded-xl bg-green-800 px-5 py-3 font-bold text-white disabled:opacity-50">{busy?"Saving…":"Save profile"}</button></form>
  </div>{message&&<p role="status" className="mt-3">{message}</p>}<a href="/writers" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-bold text-green-800 underline underline-offset-4">Browse public publisher profiles ↗</a></details>;
}
