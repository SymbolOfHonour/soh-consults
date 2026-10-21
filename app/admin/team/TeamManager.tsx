"use client";
import { useEffect, useState } from "react";
import type { TeamMember } from "../../../lib/editor-team";
import SubmissionReview from "../writer/SubmissionReview";
import type { EmailEvent } from "../../../lib/team-mail";
const input = "w-full rounded-xl border p-3";
export default function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [events,setEvents]=useState<EmailEvent[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() { const r = await fetch("/api/admin/team"); const d = await r.json(); if (!r.ok) throw Error(d.error); setMembers(d.members); setEvents(d.events||[]); }
  useEffect(() => { void load().catch(e => setMessage(e.message)); }, []);
  async function invite(form: FormData) {
    setBusy(true); setMessage("");
    try {
      const r = await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
      const d = await r.json(); if (!r.ok) throw Error(d.error);
      setMessage("Invitation email accepted for sending. Ask the writer to check their inbox and spam folder."); await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Invitation failed."); await load().catch(() => {}); } finally { setBusy(false); }
  }
  async function resend(member: TeamMember) {
    setBusy(true); setMessage("");
    try {
      const r = await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "resend", email: member.email, name: member.name }) });
      const d = await r.json(); if (!r.ok) throw Error(d.error);
      setMessage("Invitation email accepted for sending. Ask the writer to check their inbox and spam folder."); await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to resend invitation."); } finally { setBusy(false); }
  }
  async function reset(member: TeamMember) {
    setBusy(true);
    try { const r = await fetch("/api/admin/team", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({action:"reset",email:member.email,name:member.name}) }); const d=await r.json(); if(!r.ok)throw Error(d.error); setMessage("Password reset email accepted for sending."); await load(); }
    catch(e){setMessage(e instanceof Error?e.message:"Unable to reset account.");} finally{setBusy(false);}
  }
  async function access(member: TeamMember, change: Partial<TeamMember> & {action?:string}) {
    setBusy(true); setMessage("");
    try { const r = await fetch("/api/admin/team", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: member.id, ...change }) }); const d = await r.json(); if (!r.ok) throw Error(d.error); await load(); setMessage("Team access updated."); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Unable to update access."); } finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-gray-50 p-4 text-gray-950 sm:p-8"><div className="mx-auto max-w-6xl space-y-6">
    <a href="/admin" className="font-bold text-green-800">← Admin dashboard</a>
    <header><p className="text-sm font-bold text-green-800">S.O.H CONSULTS · PRIVATE</p><h1 className="text-3xl font-black">Team & submissions</h1><p className="mt-2">Writers can browse, edit and publish articles. Your owner login and website settings stay separate.</p></header>
    <form action={invite} className="space-y-4 rounded-2xl border bg-white p-5"><h2 className="text-xl font-bold">Invite a team member</h2><div className="grid gap-4 sm:grid-cols-3"><label>Public author name<input required name="name" maxLength={100} className={input} disabled={busy} /></label><label>Email<input required name="email" type="email" maxLength={254} className={input} disabled={busy} /></label><label>Role<select name="role" className={input} disabled={busy}><option value="writer">Writer — articles & publishing</option><option value="editor">Editor — review submissions</option></select></label></div><p className="text-sm text-gray-600">Writers and editors can publish and edit shared articles. Only you can unpublish, delete articles or manage team access. Editors can also review submissions.</p><button disabled={busy} className="rounded-xl bg-green-800 px-5 py-3 font-bold text-white disabled:opacity-50">Send invitation email</button></form>
    {message && <p role="status" className="rounded-xl border bg-white p-4">{message}</p>}

    <section className="rounded-2xl border bg-white p-5"><h2 className="text-xl font-bold">Team access</h2><div className="mt-3 divide-y">{members.map(m => <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><strong>{m.name}</strong><p className="text-sm">{m.email} · {!m.active ? m.invitation_cancelled_at ? "Invitation cancelled" : "Disabled" : m.activated_at ? "Active account" : "Invitation pending"}</p></div><div className="flex flex-wrap gap-2"><select aria-label={`Role for ${m.name}`} value={m.role} disabled={busy} onChange={e => void access(m, { role: e.target.value as TeamMember["role"] })} className="rounded-lg border p-2"><option value="writer">Writer</option><option value="editor">Editor</option></select><button disabled={busy||!m.active||!!m.activated_at} onClick={()=>void resend(m)} title={m.activated_at?"Already activated. Use Reset password for sign-in help.":!m.active?"Enable access before resending.":"Send a fresh invitation email"} className="rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:opacity-60">{m.activated_at?"Already activated":m.last_invited_at && Date.now()-Date.parse(m.last_invited_at)>3600000 ? "Replace expired invitation" : "Resend invitation"}</button>{!m.activated_at&&m.active&&<button disabled={busy} onClick={()=>void access(m,{action:"cancel"})} className="rounded-lg border px-3 py-2">Cancel invitation</button>}<button disabled={busy||!m.active} onClick={()=>void reset(m)} className="rounded-lg border px-3 py-2">Reset password</button><button disabled={busy} onClick={() => void access(m, { active: !m.active })} className="rounded-lg border px-3 py-2">{m.active ? "Disable access" : "Enable access"}</button></div></div>)}{!members.length && <p>No team members loaded.</p>}</div><a className="mt-4 inline-block font-bold text-green-800" href="/admin/writer">Open writer workspace →</a></section>
    <section className="rounded-2xl border bg-white p-5"><h2 className="text-xl font-bold">Email history</h2><p className="mt-2 text-sm text-gray-600">Latest 100 attempts recorded since this feature was enabled. Accepted means the mail service accepted the request; it does not confirm inbox delivery. Unconfirmed attempts may still have sent mail. This history does not create a copy in your mailbox’s Sent folder.</p><button disabled={busy} onClick={()=>void load().catch(e=>setMessage(e.message))} className="my-3 rounded-lg border px-3 py-2">Refresh history</button><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Recipient</th><th className="p-2">Message</th><th className="p-2">Status</th><th className="p-2">Time</th></tr></thead><tbody>{events.map(e=><tr key={e.id} className="border-t"><td className="p-2">{e.recipient}</td><td className="p-2">{e.kind=== "recovery"?"Password reset":e.kind=== "resend"?"Invitation resent":"Invitation"}</td><td className="p-2">{e.status==="accepted"?"Accepted for sending":e.status==="failed"?"Sending failed / unconfirmed":"Unconfirmed"}</td><td className="p-2">{new Date(e.created_at).toLocaleString("en-NG")}</td></tr>)}</tbody></table>{!events.length&&<p className="py-3">No email attempts recorded yet.</p>}</div></section>
    <SubmissionReview owner />
  </div></main>;
}
