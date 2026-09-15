"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { QueuedStory } from "../../../lib/news-queue";

type CardTarget = { story: QueuedStory; host: HTMLElement };

export default function AdminBulkActions() {
  const [stories, setStories] = useState<QueuedStory[]>([]);
  const [targets, setTargets] = useState<CardTarget[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [toolbarHost, setToolbarHost] = useState<HTMLElement | null>(null);

  const loadStories = useCallback(async () => {
    const response = await fetch("/api/admin/stories", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setStories(data.stories || []);
  }, []);

  useEffect(() => { void loadStories(); }, [loadStories]);

  useEffect(() => {
    const scan = () => {
      const articles = Array.from(document.querySelectorAll<HTMLElement>("article"));
      const next: CardTarget[] = [];
      for (const article of articles) {
        const title = article.querySelector("h2")?.textContent?.trim();
        if (!title) continue;
        const story = stories.find((item) => item.title === title);
        const row = article.firstElementChild as HTMLElement | null;
        const actions = row?.lastElementChild as HTMLElement | null;
        if (story && actions) next.push({ story, host: actions });
      }
      setTargets(next);

      const tabBar = Array.from(document.querySelectorAll<HTMLElement>("section div")).find((element) => {
        const text = element.textContent || "";
        return text.includes("All (") && text.includes("Draft (") && text.includes("Published (") && element.querySelectorAll("button").length >= 5;
      });
      if (tabBar) {
        let host = document.getElementById("admin-bulk-actions-host");
        if (!host) {
          host = document.createElement("div");
          host.id = "admin-bulk-actions-host";
          tabBar.insertAdjacentElement("afterend", host);
        }
        setToolbarHost(host);
      }
    };
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [stories]);

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const visibleIds = targets.map(({ story }) => story.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  function selectAllVisible() {
    setSelected((current) => new Set([...current, ...visibleIds]));
  }

  function unselectAll() {
    setSelected(new Set());
  }

  async function changeStatus(status: "archived" | "rejected") {
    const chosen = stories.filter((story) => selected.has(story.id));
    const eligible = status === "rejected" ? chosen.filter((story) => story.status !== "published" && story.status !== "archived" && story.status !== "rejected") : chosen.filter((story) => story.status !== "archived");
    if (!eligible.length) { setMessage("No selected updates are eligible for this action."); return; }
    if (!confirm(`${status === "archived" ? "Archive" : "Reject"} ${eligible.length} selected update${eligible.length === 1 ? "" : "s"}?`)) return;
    setBusy(true); setMessage("");
    const results = await Promise.all(eligible.map((story) => fetch("/api/admin/stories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...story, status }) })));
    const failed = results.filter((result) => !result.ok).length;
    if (failed) { setMessage(`${eligible.length - failed} updated, ${failed} failed. Refresh and try the failed items again.`); setBusy(false); await loadStories(); return; }
    window.location.reload();
  }

  async function permanentDelete() {
    const chosen = stories.filter((story) => selected.has(story.id));
    if (!chosen.length) return;
    if (!confirm(`Permanently delete ${chosen.length} selected update${chosen.length === 1 ? "" : "s"} and their S.O.H-hosted uploaded files? This cannot be undone.`)) return;
    const confirmation = prompt("Type PERMANENTLY DELETE to confirm bulk deletion.");
    if (confirmation !== "PERMANENTLY DELETE") return;
    setBusy(true); setMessage("");
    const results = await Promise.all(chosen.map((story) => fetch("/api/admin/stories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: story.id, confirm: confirmation }) })));
    const failed = results.filter((result) => !result.ok).length;
    if (failed) { setMessage(`${chosen.length - failed} deleted, ${failed} failed. Refresh and try the failed items again.`); setBusy(false); await loadStories(); return; }
    window.location.reload();
  }

  const checkboxPortals = targets.map(({ story, host }) => createPortal(
    <label key={story.id} className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-black text-green-900" title="Select update for bulk action">
      <input type="checkbox" checked={selected.has(story.id)} onChange={() => toggle(story.id)} className="h-4 w-4 accent-green-700" /> Select
    </label>, host, story.id
  ));

  const toolbar = toolbarHost ? createPortal(
    <div className="mb-6 mt-3 rounded-2xl border border-green-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm font-black text-gray-900">{selected.size} selected</span>
        {selected.size > 0 ? <>
          <button type="button" disabled={busy || allVisibleSelected} onClick={selectAllVisible} className="rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-sm font-black text-green-900 disabled:opacity-50">Select All</button>
          <button type="button" disabled={busy} onClick={unselectAll} className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-black text-gray-800">Unselect All</button>
        </> : <button type="button" disabled={busy || !visibleIds.length} onClick={selectAllVisible} className="rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-sm font-black text-green-900 disabled:opacity-50">Select All</button>}
        <button type="button" disabled={busy || !selected.size} onClick={() => void changeStatus("archived")} className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-black text-gray-800 disabled:opacity-50">Archive Selected</button>
        <button type="button" disabled={busy || !selected.size} onClick={() => void changeStatus("rejected")} className="rounded-xl bg-orange-100 px-4 py-2 text-sm font-black text-orange-900 disabled:opacity-50">Reject Selected</button>
        <button type="button" disabled={busy || !selected.size} onClick={() => void permanentDelete()} className="rounded-xl bg-red-100 px-4 py-2 text-sm font-black text-red-800 disabled:opacity-50">Permanent Delete Selected</button>
      </div>
      {message && <p className="mt-3 text-sm font-bold text-red-700">{message}</p>}
    </div>, toolbarHost
  ) : null;

  return <>{checkboxPortals}{toolbar}</>;
}
