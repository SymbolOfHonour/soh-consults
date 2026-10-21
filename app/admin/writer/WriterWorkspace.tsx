"use client";
import { useEffect, useRef, useState } from "react";
import type { Submission, TeamMember, WriterSnapshot } from "../../../lib/editor-team";
import ArticleBlockEditor from "../updates/ArticleBlockEditor";
import ArticleLivePreview from "../updates/ArticleLivePreview";
import ArticleDraftRecovery from "../updates/ArticleDraftRecovery";
import ArticleTemplates from "../updates/ArticleTemplates";
import SubmissionReview from "./SubmissionReview";
import WriterProfile from "./WriterProfile";
import ForgotPassword from "./ForgotPassword";
const blank = (): WriterSnapshot => ({ title: "", institution: "", category: "Admission", summary: "", official_source_name: "", official_source_url: "", blocks: [{ type: "paragraph", text: "" }] });
const field = "mt-1 w-full rounded-xl border p-3 text-gray-950";
export default function WriterWorkspace() {
  const [member, setMember] = useState<TeamMember | null>(null), [ready, setReady] = useState(false), [invite, setInvite] = useState("");
  const [rows, setRows] = useState<Submission[]>([]), [current, setCurrent] = useState<Submission | null>(null), [snapshot, setSnapshot] = useState<WriterSnapshot>(blank);
  const [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false), [message, setMessage] = useState(""), [saved, setSaved] = useState(""), [conflict, setConflict] = useState(false);
  const [recovery,setRecovery] = useState(false);
  const [saveToken,setSaveToken] = useState(0);
  const [autoPaused,setAutoPaused]=useState(false);
  const [autosaving,setAutosaving]=useState(false);
  const saving=useRef(false);
  const latest=useRef(snapshot);
  useEffect(()=>{latest.current=snapshot;},[snapshot]);
  const baseline = useRef(JSON.stringify(snapshot));
  const locked = busy || uploading || conflict || !!current && !["draft", "changes_requested"].includes(current.status);
  async function loadRows() { const r = await fetch("/api/admin/writer/submissions"); const d = await r.json(); if (!r.ok) throw Error(d.error); setRows(d.submissions); }
  useEffect(() => {
    const params=new URLSearchParams(window.location.hash.slice(1));
    setInvite(params.get("invite")||params.get("recovery")||"");setRecovery(params.has("recovery"));
    // The invitation stays in memory, not browser history or referrer URLs.
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
    void fetch("/api/admin/writer/session").then(async r => { const d = await r.json(); if (!r.ok) throw Error(d.error); if (!params.has("invite")&&!params.has("recovery")) { setMember(d.member); if (d.member) await loadRows(); } }).catch(e => setMessage(e.message)).finally(() => setReady(true));
  }, []);
  async function signIn(form: FormData) {
    setBusy(true); setMessage("");
    try { const r = await fetch("/api/admin/writer/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(form), invite, recovery }) }); const d = await r.json(); if (!r.ok) throw Error(d.error); setMember(d.member); setInvite(""); await loadRows(); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Sign-in failed."); } finally { setBusy(false); }
  }
  function open(row: Submission | null) {
    const next = row?.snapshot || blank(); setCurrent(row); setSnapshot(next); baseline.current = JSON.stringify(next); setSaved(""); setMessage(""); setConflict(false);setAutoPaused(false);
  }
  async function save(submit: boolean, automatic = false) {
    if (!member || locked || saving.current) return;
    saving.current=true; if(automatic)setAutosaving(true);else setBusy(true); if (!automatic) setMessage(""); setSaved(automatic ? "Saving draft…" : "");
    const serialized = JSON.stringify(snapshot);
    try {
      const r = await fetch("/api/admin/writer/submissions", { method: current ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: current?.id, expected_updated_at: current?.updated_at, snapshot, submit }) });
      const d = await r.json(); if (!r.ok) { if (r.status === 409) setConflict(true); throw Error(d.error); }
      if (!current) { try { localStorage.removeItem(`soh-writer-${member.id}-new`); } catch {} }
      setAutoPaused(false);setCurrent(d.submission); baseline.current = serialized; if(JSON.stringify(latest.current)===serialized)setSaveToken(t=>t+1);
      setSaved(submit ? "Submitted for review. Your article is not published." : `Saved to your workspace at ${new Date().toLocaleTimeString("en-NG")}`);
      await loadRows();
    } catch (e) { setAutoPaused(true);setSaved("Autosave paused. Use Save draft to retry. Draft was not saved to the server."); setMessage(e instanceof Error ? e.message : "Save failed."); } finally { saving.current=false;setBusy(false);setAutosaving(false); }
  }
  useEffect(() => {
    if (!member || locked || autosaving || autoPaused || JSON.stringify(snapshot) === baseline.current || !snapshot.title.trim()) return;
    const timer = setTimeout(() => void save(false, true), 5000);
    return () => clearTimeout(timer);
    // The save uses this render's snapshot and revision; a new edit resets the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot, current, member, locked, autosaving, autoPaused]);
  const own = member ? rows.filter(r => r.author_id === member.id) : [];
  return <main className="min-h-screen bg-gray-50 p-4 text-gray-950 sm:p-8"><div className="mx-auto max-w-6xl space-y-5"><header><p className="font-bold text-green-800">S.O.H CONSULTS · PRIVATE</p><h1 className="text-3xl font-black">Writer workspace</h1><p className="mt-2">Write, preview and submit articles for review.</p></header>
    {message && <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4">{message}</p>}
    {!ready ? <p>Checking your session…</p> : !member ? <><form action={signIn} className="mx-auto max-w-md space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">{invite ? recovery ? "Reset your password" : "Accept your invitation" : "Writer sign-in"}</h2>{!invite && <label className="block">Team email<input name="email" type="email" autoComplete="username" required className={field} disabled={busy} /></label>}<label className="block">{invite ? "Choose a password (8–128 characters)" : "Password"}<input name="password" type="password" minLength={8} maxLength={128} autoComplete={invite ? "new-password" : "current-password"} required className={field} disabled={busy} /></label><button disabled={busy} className="rounded-xl bg-green-800 px-5 py-3 font-bold text-white">{busy ? "Signing in…" : invite ? recovery ? "Save new password" : "Activate account" : "Sign in"}</button><p className="text-sm text-gray-600">Access is invitation-only. For help, contact support@sohconsults.com.ng.</p></form>{!invite&&<ForgotPassword/>}</> : <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"><p><strong>{member.name}</strong> · {member.role}</p><button disabled={busy} className="rounded-lg border px-4 py-2" onClick={async () => { await fetch("/api/admin/writer/session", { method: "DELETE" }); window.location.reload(); }}>Sign out</button></div>
      <WriterProfile member={member} onChange={setMember}/>
      <section className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl font-bold">My articles</h2><button disabled={busy || uploading || autosaving} onClick={() => open(null)} className="rounded-lg border px-4 py-2">+ New article</button><button disabled={busy || uploading || autosaving} onClick={() => void loadRows().catch(e => setMessage(e.message))} className="rounded-lg border px-4 py-2">Refresh list</button></div><div className="mt-3 flex flex-wrap gap-2">{own.map(row => <button key={row.id} disabled={busy || uploading || autosaving} className="rounded-xl border px-3 py-2 text-left" onClick={() => open(row)}><strong>{row.snapshot.title || "Untitled"}</strong><span className="block text-sm">{row.status.replaceAll("_", " ")}</span></button>)}{!own.length && <p>No articles yet. Start writing below.</p>}</div></section>
      {current?.feedback && <p className="rounded-xl border border-amber-300 bg-amber-50 p-4"><strong>Reviewer feedback:</strong> {current.feedback}</p>}
      {current && ["submitted", "imported"].includes(current.status) && <p className="rounded-xl bg-green-50 p-4">This article is {current.status === "submitted" ? "awaiting review" : "in the owner publishing editor"}. It is read-only here.</p>}
      <section className="grid gap-4 rounded-2xl border bg-white p-5 sm:grid-cols-2">{([['title','Headline'],['institution','Institution'],['category','Category'],['summary','Summary'],['official_source_name','Official source name'],['official_source_url','Official source link']] as const).map(([key,label]) => <label key={key} className="font-bold">{label}<input value={snapshot[key]} type={key === "official_source_url" ? "url" : "text"} disabled={locked} className={field} onChange={e => setSnapshot(s => ({ ...s, [key]: e.target.value }))} /></label>)}</section>
      <ArticleTemplates blocks={snapshot.blocks} disabled={locked} onChange={blocks => setSnapshot(s => ({ ...s, blocks }))} />
      <ArticleDraftRecovery saveToken={saveToken} storageKey={`soh-writer-${member.id}-${current?.id || "new"}`} snapshot={snapshot} onRestore={setSnapshot} />
      <ArticleBlockEditor value={snapshot.blocks} onChange={blocks => setSnapshot(s => ({ ...s, blocks }))} disabled={locked} onUploadingChange={setUploading} />
      <ArticleLivePreview blocks={snapshot.blocks} title={snapshot.title} summary={snapshot.summary} featured="" publisherName={member.name} />
      <p role="status">{saved || "Drafts save automatically after five seconds once you enter a headline."}</p><div className="flex flex-wrap gap-3"><button disabled={locked||autosaving} onClick={() => void save(false)} className="rounded-xl border px-5 py-3 disabled:opacity-50">Save draft</button><button disabled={locked||autosaving} onClick={() => void save(true)} className="rounded-xl bg-green-800 px-5 py-3 font-bold text-white disabled:opacity-50">Submit for review</button></div>
      {member.role === "editor" && <SubmissionReview />}
    </>}
  </div></main>;
}
