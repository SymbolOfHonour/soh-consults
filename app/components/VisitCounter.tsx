"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function VisitCounter() {
  const pathname = usePathname();
  const countedPaths = useRef(new Set<string>());
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    if (countedPaths.current.has(pathname)) return;
    countedPaths.current.add(pathname);
    fetch("/api/visits", { method: "POST", cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { if (data.success && Number.isFinite(data.visits)) setVisits(data.visits); })
      .catch(() => undefined);
  }, [pathname]);

  if (visits === null) return null;
  return (
    <div className="border-t border-green-900 bg-gray-950 px-5 py-3 text-center text-xs text-green-100">
      <span className="inline-flex items-center gap-2 rounded-full border border-green-800 bg-green-950 px-4 py-2 font-bold">
        <span aria-hidden="true">◉</span> Total Visits: {visits.toLocaleString("en-NG")}
      </span>
    </div>
  );
}
