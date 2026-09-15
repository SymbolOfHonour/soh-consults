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
    <div className="w-full sm:w-72 lg:w-80">
      <label className="sr-only" htmlFor="admin-update-search">Search dashboard updates</label>
      <div className="flex gap-2">
        <input
          id="admin-update-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search updates..."
          className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="rounded-xl border border-gray-300 px-3 text-sm font-black text-gray-700 hover:bg-gray-50">Clear</button>
        )}
      </div>
    </div>
  );
}
