"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { QueuedStory, QueueStatus } from "../../../lib/news-queue";

const statuses: QueueStatus[] = ["draft", "approved", "published", "rejected"];

export default function AdminUpdatesClient() {
  const [stories, setStories] = useState<QueuedStory[]>([]);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<QueueStatus | "all">("draft");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/stories", { cache: "no-store" });
    if (response.status === 401) { setAuthenticated(false); return; }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load queue.");
    setStories(data.stories);
    setAuthenticated(true);
  }, []);

  useEffect(() => {
    // Loading the server-owned session and queue is the external synchronization performed here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load().catch(error => { setMessage(error.message); setAuthenticated(false); });
  }, [load]);

  async function login(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await response.json();
    if (!response.ok) setMessage(data.error || "Login failed."); else { setPassword(""); await load(); }
    setBusy(false);
  }

  async function importNow() {
    setBusy(true); setMessage("Checking both sources...");
    const response = await fetch("/api/admin/import", { method: "POST" });
    const data = await response.json();
    setMessage(response.ok ? `${data.added} new draft${data.added === 1 ? "" : "s"} added. ${data.discovered} relevant links checked.${data.failures?.length ? ` ${data.failures.join(" ")}` : ""}` : data.error);
    if (response.ok) await load();
    setBusy(false);
  }

  function change(id: string, key: keyof QueuedStory, value: string) {
    setStories(current => current.map(story => story.id === id ? { ...story, [key]: value } : story));
  }

  async function save(story: QueuedStory, status?: QueueStatus) {
    setBusy(true); setMessage("");
    const response = await fetch("/api/admin/stories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...story, status: status || story.status }) });
    const data = await response.json();
    if (!response.ok) setMessage(data.error || "Unable to save."); else { setMessage(`Saved: ${story.title}`); await load(); }
    setBusy(false);
  }

  const shown = useMemo(() => filter === "all" ? stories : stories.filter(story => story.status === filter), [stories, filter]);

  if (authenticated === null) return <main className="grid min-h-screen place-items-center bg-gray-50 text-gray-900"><p className="font-bold text-green-800">Loading approval queue...</p></main>;
  if (!authenticated) return <main className="grid min-h-screen place-items-center bg-gray-50 p-5 text-gray-900"><form onSubmit={login} className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-gray-900 shadow-xl"><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="mx-auto h-20 w-auto" /><h1 className="mt-6 text-center text-2xl font-black text-gray-950">Private Update Dashboard</h1><p className="mt-2 text-center text-sm text-gray-700">Enter the admin password to review imported stories.</p><input type="password" value={password} onChange={event => setPassword(event.target.value)} required className="mt-6 w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-gray-950 placeholder:text-gray-500 outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100" placeholder="Admin password" /><button disabled={busy} className="mt-4 w-full rounded-xl bg-green-700 px-5 py-3 font-black text-white disabled:opacity-60">{busy ? "Checking..." : "Open Dashboard"}</button>{message && <p className="mt-4 text-center text-sm font-bold text-red-700">{message}</p>}</form></main>;

  return <main className="min-h-screen bg-gray-50 text-gray-900"><header className="border-b bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5"><div className="flex items-center gap-3"><img src="/soh-logo.jpg" alt="" className="h-14 w-auto" /><div><p className="text-xs font-black uppercase tracking-widest text-green-700">Private dashboard</p><h1 className="text-xl font-black">Update Approval Queue</h1></div></div><button onClick={importNow} disabled={busy} className="rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white disabled:opacity-60">{busy ? "Please wait..." : "Check Sources Now"}</button></div></header><section className="mx-auto max-w-7xl px-5 py-8"><div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950"><b>Approval safety:</b> Drafts and approved stories remain hidden from visitors. A story only becomes public after you deliberately select Published.</div>{message && <p className="mt-4 rounded-xl bg-white p-4 text-sm font-bold shadow-sm">{message}</p>}<div className="my-6 flex flex-wrap gap-2">{(["all", ...statuses] as const).map(status => <button key={status} onClick={() => setFilter(status)} className={`rounded-full px-4 py-2 text-sm font-black capitalize ${filter === status ? "bg-green-700 text-white" : "border bg-white"}`}>{status} ({status === "all" ? stories.length : stories.filter(item => item.status === status).length})</button>)}</div><div className="space-y-6">{shown.map(story => <article key={story.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-black text-green-700">{story.source_name}</p><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black uppercase">{story.status}</span></div><a href={story.source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex break-all text-sm font-bold text-blue-700 underline">Open original source</a><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-sm font-bold md:col-span-2">Headline<input value={story.title} onChange={event => change(story.id, "title", event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-bold">Institution<input value={story.institution} onChange={event => change(story.id, "institution", event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-bold">Category<select value={story.category} onChange={event => change(story.id, "category", event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal"><option>Admission</option><option>Admission List</option><option>JAMB</option><option>O&apos;Level</option><option>Scholarship</option><option>Opportunity</option><option>NYSC</option><option>LASU Updates</option></select></label><label className="text-sm font-bold md:col-span-2">S.O.H summary<textarea rows={3} value={story.summary} onChange={event => change(story.id, "summary", event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-bold md:col-span-2">Full update<textarea rows={8} value={story.details} onChange={event => change(story.id, "details", event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-bold">Deadline text<input value={story.deadline || ""} onChange={event => change(story.id, "deadline", event.target.value)} placeholder="e.g. 30 September 2026" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-bold">Deadline date<input type="date" value={story.deadline_iso || ""} onChange={event => change(story.id, "deadline_iso", event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label></div><div className="mt-5 flex flex-wrap gap-3"><button disabled={busy} onClick={() => save(story)} className="rounded-xl border border-green-700 px-4 py-2 text-sm font-black text-green-700">Save Changes</button><button disabled={busy} onClick={() => save(story, "approved")} className="rounded-xl bg-green-700 px-4 py-2 text-sm font-black text-white">Approve</button><button disabled={busy} onClick={() => save(story, "published")} className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-black text-white">Publish</button><button disabled={busy} onClick={() => save(story, "rejected")} className="rounded-xl bg-red-100 px-4 py-2 text-sm font-black text-red-800">Reject</button></div></article>)}{!shown.length && <div className="rounded-3xl border border-dashed bg-white p-10 text-center font-bold text-gray-500">No stories in this section.</div>}</div></section></main>;
}
