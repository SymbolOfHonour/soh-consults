import { rankContent } from "../../lib/ranking-engine";
import { deadlineDate, normaliseText } from "../../lib/discovery-text";
import type { DiscoveryItem } from "../../lib/algorithm-phase2";

export default function DiscoveryHighlights({ items }: { items: DiscoveryItem[] }) {
  const now = new Date();
  const seen = new Set<string>();
  const selected = rankContent(items.filter(item => {
    const deadline = deadlineDate(item.deadline);
    return deadline && +deadline >= +now && +deadline - +now <= 30 * 86_400_000 && item.status !== "CLOSED" && item.status !== "COMING SOON";
  }), { now }).filter(({ item }) => {
    const key = normaliseText(item.title);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).slice(0, 3);
  if (!selected.length) return null;
  return <section aria-label="Upcoming application deadlines" className="border-b border-[#e2e5dc] bg-[#faf8f2]">
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black text-green-950">Deadlines to check</h2><p className="mt-1 text-sm text-gray-600">Applications with a listed deadline in the next 30 days. Confirm the current notice before applying.</p></div><a href="/deadlines" className="py-2 text-sm font-bold text-green-800">All deadlines →</a></div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">{selected.map(({ item }) => <article key={item.id} className="min-w-0 rounded-xl border border-[#e2e5dc] bg-white p-4">
        <p className="text-xs font-bold text-amber-800">Deadline: {deadlineDate(item.deadline)!.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "short", year: "numeric" })}</p>
        <h3 className="mt-2 break-words font-black leading-6"><a href={item.href} className="hover:underline">{item.title}</a></h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-green-800"><a href={item.href} className="py-2">View details →</a><a href={`https://wa.me/2348182141088?text=${encodeURIComponent(`Hello S.O.H CONSULTS, please help me confirm the deadline and requirements for ${item.title}.`)}`} target="_blank" rel="noopener noreferrer" className="py-2">WhatsApp help ↗</a></div>
      </article>)}</div>
    </div>
  </section>;
}
