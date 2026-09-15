"use client";

import { useEffect, useState } from "react";

export default function AdminUpdateSearch() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const apply = () => {
      const normalized = query.trim().toLowerCase();
      document.querySelectorAll<HTMLElement>("main article").forEach((card) => {
        const matches = !normalized || (card.textContent || "").toLowerCase().includes(normalized);
        card.style.display = matches ? "" : "none";
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    const main = document.querySelector("main");
    if (main) observer.observe(main, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [query]);

  return (
    <div className="fixed bottom-5 left-5 z-40 w-[min(420px,calc(100vw-2.5rem))] rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
      <label className="block text-xs font-black uppercase tracking-wider text-green-700">
        Search dashboard updates
        <div className="mt-2 flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Headline, institution, category..."
            className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium normal-case tracking-normal text-gray-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="rounded-xl border border-gray-300 px-3 text-sm font-black text-gray-700 hover:bg-gray-50">Clear</button>
          )}
        </div>
      </label>
    </div>
  );
}
