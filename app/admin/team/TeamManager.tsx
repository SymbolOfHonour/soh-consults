"use client";
import { useEffect, useState } from "react";
import type { TeamMember } from "../../../lib/editor-team";
import SubmissionReview from "../writer/SubmissionReview";
const input = "w-full rounded-xl border p-3";
export default function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [message, setMessage] = useState("");
  const [invitation, setInvitation] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() { const r = await fetch("/api/admin/team"); const d = await r.json(); if (!r.ok) throw Error(d.error); setMembers(d.members); }
  useEffect(() => { void load().catch(e => setMessage(e.message)); }, []);
  async function invite(form: FormData) {
    setBusy(true); setMessage(""); setInvitation("");
    try {
      const r = await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
      const d = await r.json(); if (!r.ok) throw Error(d.error);
      setInvitation(new URL(d.invitation, window.location.origin).href);
      setMessage("Invitation generated. Copy and share it privately with this writer. No email has been sent."); await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Invitation failed."); } finally { setBusy(false); }
  }
  async function reset(member: TeamMember) {
    setBusy(true); setInvitation("");
    try { const r = await fetch("/api/admin/team", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({action:"reset",email:member.email,name:member.name}) }); const d=await r.json(); if(!r.ok)throw Error(d.error); setInvitation(new URL(d.invitation,window.location.origin).href); setMessage("Password reset link generated. Share privately with this team member. No email was sent."); }
    catch(e){setMessage(e instanceof Error?e.message:"Unable to reset account.");} finally{setBusy(false);}
  }
  async function access(member: TeamMember, change: Partial<TeamMember>) {
    setBusy(true); setMessage("");
    try { const r = await fetch("/api/admin/team", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: member.id, ...change }) }); const d = await r.json(); if (!r.ok) throw Error(d.error); await load(); setMessage("Team access updated."); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Unable to update access."); } finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-gray-50 p-4 text-gray-950 sm:p-8"><div className="mx-auto max-w-6xl space-y-6">
    <a href="/admin" className="font-bold text-green-800">← Admin dashboard</a>
    <header><p className="text-sm font-bold text-green-800">S.O.H CONSULTS · PRIVATE</p><h1 className="text-3xl font-black">Team & submissions</h1><p className="mt-2">Writers submit articles for review. Your owner login and publishing controls stay separate.</p></header>
    <form action={invite} className="space-y-4 rounded-2xl border bg-white p-5"><h2 className="text-xl font-bold">Invite a team member</h2><div className="grid gap-4 sm:grid-cols-3"><label>Public author name<input required name="name" maxLength={100} className={input} disabled={busy} /></label><label>Email<input required name="email" type="email" maxLength={254} className={input} disabled={busy} /></label><label>Role<select name="role" className={input} disabled={busy}><option value="writer">Writer — own drafts</option><option value="editor">Editor — review submissions</option></select></label></div><p className="text-sm text-gray-600">Editors can review and request changes. Only you can move submissions into the owner editor and publish.</p><button disabled={busy} className="rounded-xl bg-green-800 px-5 py-3 font-bold text-white disabled:opacity-50">Generate invitation link</button></form>
    {message && <p role="status" className="rounded-xl border bg-white p-4">{message}</p>}
    {invitation && <div className="space-y-2 rounded-xl border border-green-300 bg-green-50 p-4"><label className="block font-bold">Private, single-use invitation<input readOnly value={invitation} onFocus={e => e.target.select()} className={input} /></label><button className="rounded-lg border bg-white px-4 py-2" onClick={() => { void navigator.clipboard.writeText(invitation).then(() => setMessage("Invitation copied.")).catch(() => setMessage("Select and copy the link above.")); }}>Copy invitation</button><p className="text-sm">This link lets its recipient activate the account. Share it only with the named writer.</p></div>}
    <section className="rounded-2xl border bg-white p-5"><h2 className="text-xl font-bold">Team access</h2><div className="mt-3 divide-y">{members.map(m => <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><strong>{m.name}</strong><p className="text-sm">{m.email} · {m.active ? "Enabled" : "Disabled"}</p></div><div className="flex flex-wrap gap-2"><select aria-label={`Role for ${m.name}`} value={m.role} disabled={busy} onChange={e => void access(m, { role: e.target.value as TeamMember["role"] })} className="rounded-lg border p-2"><option value="writer">Writer</option><option value="editor">Editor</option></select><button disabled={busy||!m.active} onClick={()=>void reset(m)} className="rounded-lg border px-3 py-2">Reset password</button><button disabled={busy} onClick={() => void access(m, { active: !m.active })} className="rounded-lg border px-3 py-2">{m.active ? "Disable access" : "Enable access"}</button></div></div>)}{!members.length && <p>No team members loaded.</p>}</div><a className="mt-4 inline-block font-bold text-green-800" href="/admin/writer">Open writer workspace →</a></section>
    <SubmissionReview owner />
  </div></main>;
}
