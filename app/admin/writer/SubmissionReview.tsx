"use client";
import { useEffect, useState } from "react";
import type { Submission } from "../../../lib/editor-team";
import ArticleLivePreview from "../updates/ArticleLivePreview";
export default function SubmissionReview({ owner = false }: { owner?: boolean }) {
  const [rows, setRows] = useState<Submission[]>([]), [selected, setSelected] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState(""), [message, setMessage] = useState(""), [busy, setBusy] = useState(false);
  async function load() { const r = await fetch("/api/admin/writer/submissions"); const d = await r.json(); if (!r.ok) throw Error(d.error); setRows(d.submissions.filter((s: Submission) => ["submitted", "imported"].includes(s.status))); }
  useEffect(() => { void load().catch(e => setMessage(e.message)); }, []);
  async function review(action: "request_changes" | "import") {
    if (!selected) return; setBusy(true); setMessage("");
    try {
      const r = await fetch("/api/admin/writer/submissions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, expected_updated_at: selected.updated_at, action, feedback }) });
      const d = await r.json(); if (!r.ok) throw Error(d.error);
      setSelected(d.submission); setFeedback(""); await load();
      setMessage(action === "import" ? "Article moved to the owner editor as an unpublished draft." : "Article returned to its writer with your feedback.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Review failed."); } finally { setBusy(false); }
  }
  return <section className="space-y-4 rounded-2xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl font-bold">Submission review</h2><button disabled={busy} className="rounded-lg border px-3 py-2" onClick={() => void load().catch(e => setMessage(e.message))}>Refresh submissions</button></div>
    {message && <p role="status">{message}</p>}
    <div className="space-y-2">{rows.map(s => <button key={s.id} disabled={busy} onClick={() => { setSelected(s); setFeedback(""); }} className="block w-full rounded-xl border p-3 text-left"><strong>{s.snapshot.title || "Untitled"}</strong><p className="text-sm">{s.author_name} · {s.status.replaceAll("_", " ")}</p></button>)}{!rows.length && <p className="text-gray-600">No submitted articles loaded.</p>}</div>
    {selected && <div className="space-y-4"><h3 className="font-bold">Review: {selected.snapshot.title}</h3><p>Source: {selected.snapshot.official_source_name || "Not supplied"} {/^https:\/\//i.test(selected.snapshot.official_source_url) && <a href={selected.snapshot.official_source_url} target="_blank" rel="noopener noreferrer" className="underline">Open official source ↗</a>}</p><ArticleLivePreview title={selected.snapshot.title} summary={selected.snapshot.summary} blocks={selected.snapshot.blocks} featured="" publisherName={selected.author_name} />
      {selected.status === "submitted" && <><label className="block font-bold">Feedback for writer<textarea maxLength={3000} value={feedback} disabled={busy} onChange={e => setFeedback(e.target.value)} className="mt-2 w-full rounded-xl border p-3" /></label><div className="flex flex-wrap gap-3"><button disabled={busy || !feedback.trim()} onClick={() => void review("request_changes")} className="rounded-xl border px-4 py-3 disabled:opacity-50">Request changes</button>{owner && <button disabled={busy} onClick={() => void review("import")} className="rounded-xl bg-green-800 px-4 py-3 font-bold text-white">Move to owner editor as draft</button>}</div></>}
      {owner && selected.story_id && <a href={`/admin/updates/edit/${selected.story_id}`} className="inline-block rounded-xl bg-green-800 px-4 py-3 font-bold text-white">Open in owner editor →</a>}
    </div>}
  </section>;
}
