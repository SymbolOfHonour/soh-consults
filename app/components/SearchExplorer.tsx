"use client";
import { useDeferredValue, useMemo, useState } from "react";
import { unifiedSearch, type DiscoveryItem } from "../../lib/algorithm-phase2";
import { newestContent } from "../../lib/content-catalogue";
import { deadlineDate } from "../../lib/discovery-text";
import { useDiscoveryFilters } from "./useDiscoveryFilters";

const types = [["all", "Everything"], ["update", "Updates"], ["opportunity", "Opportunities"], ["deadline", "Deadlines"], ["guide", "Guides"], ["calculator", "Calculators"]];
const defaults = { q: "", type: "all", sort: "best", availability: "all" };
const choices = { type: types.map(([value]) => value), sort: ["best", "latest"], availability: ["all", "current"] };
const deadlinePassed = (item: DiscoveryItem) => item.status === "CLOSED" || Boolean(deadlineDate(item.deadline) && +deadlineDate(item.deadline)! < Date.now());

export default function SearchExplorer({ items, initialFilters = {} }: { items: DiscoveryItem[]; initialFilters?: Partial<typeof defaults> }) {
  const [{ q, type, sort, availability }, setFilters] = useDiscoveryFilters(defaults, initialFilters, choices);
  const query = useDeferredValue(q);
  const [limit, setLimit] = useState(12);
  const ranked = useMemo(() => unifiedSearch(items.filter(item => availability === "all" || !deadlinePassed(item)), query), [items, query, availability]);
  const results = useMemo(() => {
    const matches = ranked.filter(({ item }) => type === "all" || item.kind === type);
    return sort === "latest" ? newestContent(matches.map(({ item }) => item)).map(item => ({ item })) : matches;
  }, [ranked, type, sort]);
  const browsing = !query.trim();
  const browsingItems = browsing ? newestContent(items.filter(item => (type === "all" ? item.kind === "update" : item.kind === type) && (availability === "all" || !deadlinePassed(item)))) : [];
  const visible = (browsing ? browsingItems.map(item => ({ item })) : results).slice(0, limit);
  const total = browsing ? browsingItems.length : results.length;
  const counts = new Map(types.map(([value]) => [value, value === "all" ? ranked.length : ranked.filter(({ item }) => item.kind === value).length]));
  const update = (patch: Partial<typeof defaults>) => { setFilters(patch); setLimit(12); };

  return <section className="mx-auto max-w-5xl px-4 py-7" aria-busy={query !== q}>
    <form role="search" onSubmit={event => { event.preventDefault(); setLimit(12); }}>
      <label htmlFor="global-search" className="mb-2 block font-bold">Search S.O.H CONSULTS</label>
      <input id="global-search" type="search" value={q} onChange={event => update({ q: event.target.value })} placeholder="Search school, JAMB CAPS, scholarships, CGPA..." className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base outline-green-700" />
    </form>
    <div className="mt-4 flex flex-wrap gap-2" aria-label="Search result types">
      {types.map(([value, label]) => <button key={value} aria-pressed={type === value} onClick={() => update({ type: value })} className={`min-h-11 rounded-full px-4 py-2 text-sm font-bold ${type === value ? "bg-green-800 text-white" : "border bg-white text-gray-700"}`}>{label}{!browsing && <span className="ml-1 opacity-80">({counts.get(value)})</span>}</button>)}
    </div>
    <div className="mt-4 flex flex-wrap gap-3">
      {!browsing && <div><label htmlFor="search-sort" className="mb-1 block text-sm font-bold">Sort results</label><select id="search-sort" value={sort} onChange={event => update({ sort: event.target.value })} className="min-h-11 rounded-xl border bg-white px-3"><option value="best">Best match</option><option value="latest">Latest first</option></select></div>}
      <div><label htmlFor="search-availability" className="mb-1 block text-sm font-bold">Deadlines</label><select id="search-availability" value={availability} onChange={event => update({ availability: event.target.value })} className="min-h-11 rounded-xl border bg-white px-3"><option value="all">Include past deadlines</option><option value="current">Hide closed / expired</option></select></div>
      {(q || type !== "all" || availability !== "all" || sort !== "best") && <button onClick={() => update(defaults)} className="self-end rounded-xl border border-green-800 px-4 py-3 text-sm font-bold text-green-800">Clear search and filters</button>}
    </div>
    {browsing && type === "all" && <nav aria-label="Start exploring" className="mt-5 grid gap-3 sm:grid-cols-3">
      {[["/guides", "Understand admission", "Practical JAMB and admission guides"], ["/screening-calculator", "Check your screening score", "Choose the calculator for your school"], ["/cgpa-calculator", "Plan your grades", "Calculate CGPA and set a target"]].map(([href, title, summary]) => <a key={href} href={href} className="rounded-xl border border-green-200 bg-green-50 p-4"><span className="block font-bold text-green-950">{title} →</span><span className="mt-1 block text-sm text-gray-600">{summary}</span></a>)}
    </nav>}
    <p aria-live="polite" role="status" className="my-5 text-sm font-bold text-gray-600">{browsing ? `Explore ${type === "all" ? "the latest updates" : types.find(([value]) => value === type)?.[1].toLowerCase()} below.` : `${results.length} result${results.length === 1 ? "" : "s"} for “${query}” · ${sort === "latest" ? "Latest first" : "Best matches first"}`}</p>
    {visible.length ? <div className="grid gap-4 sm:grid-cols-2">{visible.map(({ item }) => {
      const expired = deadlinePassed(item), deadline = deadlineDate(item.deadline);
      const closingSoon = !expired && deadline && +deadline - Date.now() <= 7 * 86_400_000;
      return <article key={item.id} className="flex min-w-0 flex-col rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-green-100 px-3 py-1 uppercase text-green-800">{item.kind}</span>{item.publishedAt && <time dateTime={String(item.publishedAt)} className="py-1 text-gray-500">{new Date(item.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time>}{expired && <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">Deadline passed / closed</span>}{closingSoon && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">Closing soon</span>}</div>
        <h2 className="mt-3 break-words text-lg font-black leading-7"><a href={item.href} className="hover:underline">{item.title}</a></h2>
        {item.summary && <p className="mt-2 line-clamp-3 flex-1 text-sm leading-7 text-gray-600">{item.summary}</p>}
        <a href={item.href} className="mt-4 inline-block py-2 text-sm font-bold text-green-800">{item.kind === "calculator" ? "Open calculator" : item.kind === "guide" ? "Read guide" : "View details"} →</a>
      </article>;
    })}</div> : <div className="rounded-2xl border border-dashed bg-white p-7"><h2 className="text-xl font-black">No matches in this view</h2><p className="mt-2 leading-7 text-gray-600">Try a shorter phrase, or include other content types and past deadlines.</p><button onClick={() => update({ type: "all", availability: "all" })} className="mt-4 rounded-xl border border-green-800 px-4 py-3 font-bold text-green-800">Search all content</button></div>}
    {total > limit && <button onClick={() => setLimit(value => value + 12)} className="mt-6 w-full rounded-xl border border-green-800 bg-white px-4 py-3 font-bold text-green-800">Show more results ({total - limit} remaining)</button>}
    {q.trim() && <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-green-50 p-5"><div><h2 className="font-black text-green-950">Need help with your next step?</h2><p className="mt-1 text-sm text-gray-600">Send your question to S.O.H CONSULTS.</p></div><a href={`https://wa.me/2348182141088?text=${encodeURIComponent(`Hello S.O.H CONSULTS, I need guidance about ${q}. Please help me with the next step.`)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-800 px-4 py-3 font-bold text-white">Ask on WhatsApp →</a></div>}
    <nav aria-label="Explore more" className="mt-8 flex flex-wrap gap-3 border-t pt-5 text-sm font-bold text-green-800"><a href="/updates">All updates →</a><a href="/opportunities">Opportunities →</a><a href="/deadlines">Admission deadlines →</a><a href="/tools">Calculators & tools →</a></nav>
  </section>;
}
