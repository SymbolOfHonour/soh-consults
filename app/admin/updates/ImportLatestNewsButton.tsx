"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportLatestNewsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function runImport() {
    if (loading) return;
    setLoading(true);
    setMessage("Checking fresh education updates…");
    try {
      const response = await fetch("/api/admin/import", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Import failed.");
      const discovered = Number(data?.discovered || 0);
      const added = Number(data?.added || 0);
      setMessage(
        added > 0
          ? `Import complete: ${added} new draft${added === 1 ? "" : "s"} added from ${discovered} fresh article${discovered === 1 ? "" : "s"}.`
          : `Import complete: no new drafts added (${discovered} fresh article${discovered === 1 ? "" : "s"} found).`
      );
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-1 sm:w-auto">
      <button
        type="button"
        onClick={runImport}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-xl bg-green-700 px-5 py-4 text-center text-base font-black text-white shadow-sm transition hover:bg-green-800 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Importing latest news…" : "↻ Import Latest News"}
      </button>
      {message ? <p className="max-w-sm text-xs font-semibold text-green-900" aria-live="polite">{message}</p> : null}
    </div>
  );
}
