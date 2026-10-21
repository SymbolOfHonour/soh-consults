"use client";
import { useState } from "react";
export default function ForgotPassword() {
  const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
  async function reset(form:FormData){setBusy(true);setMessage("");try{const r=await fetch("/api/admin/writer/recovery",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:form.get("email")})});const d=await r.json();if(!r.ok)throw Error(d.error);setMessage(d.message);}catch(e){setMessage(e instanceof Error?e.message:"Please try again later.");}finally{setBusy(false);}}
  return <details className="mx-auto max-w-md rounded-2xl border bg-white p-5"><summary className="cursor-pointer font-bold text-green-800">Forgot your password?</summary><form action={reset} className="mt-3 space-y-3"><label className="block">Team email<input name="email" type="email" maxLength={254} autoComplete="email" required disabled={busy} className="mt-1 w-full rounded-xl border p-3"/></label><button disabled={busy} className="rounded-xl border px-4 py-2">{busy?"Requesting…":"Email me a reset link"}</button></form>{message&&<p role="status" className="mt-3 text-sm">{message}</p>}</details>;
}
