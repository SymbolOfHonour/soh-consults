import type { DiscoveryItem } from "../../lib/algorithm-phase2";
import { deadlineDate } from "../../lib/discovery-text";
import { rankContent } from "../../lib/ranking-engine";

type Props = { items: DiscoveryItem[]; compact?: boolean };
const priority = /admission|jamb|caps|screening|result|scholarship|resumption|waec|neco/i;
function active(item: DiscoveryItem, now: Date) {
  const deadline = deadlineDate(item.deadline);
  return item.status !== "CLOSED" && item.status !== "COMING SOON" && (!deadline || +deadline >= +now);
}
function validHref(item: DiscoveryItem) { return item.href.startsWith("/") && !item.href.startsWith("//"); }
export default function EducationDiscoveryPanels({ items, compact = false }: Props) {
  const now = new Date();
  const unique = (input: DiscoveryItem[], count: number) => {
    const seen = new Set<string>();
    return input.filter(item => { if (!validHref(item) || seen.has(item.href)) return false; seen.add(item.href); return true; }).slice(0, count);
  };
  const stories = items.filter(item => item.kind === "update" && item.publishedAt);
  // Editorially relevant recent stories, not fabricated page-view rankings.
  const trending = unique(rankContent(stories, { now }).map(result => result.item), 4);
  const urgent = unique(stories.filter(item => priority.test(item.title) && active(item, now) && item.publishedAt && now.getTime() - Date.parse(String(item.publishedAt)) < 7 * 86400000).sort((a,b) => Date.parse(String(b.publishedAt)) - Date.parse(String(a.publishedAt))), 3);
  const deadlines = unique(items.filter(item => (item.kind === "deadline" || item.kind === "opportunity" || item.kind === "update") && active(item, now) && deadlineDate(item.deadline) && +deadlineDate(item.deadline)! - +now <= 30 * 86400000).sort((a,b) => +deadlineDate(a.deadline)! - +deadlineDate(b.deadline)!), 4);
  if (!trending.length && !deadlines.length && !urgent.length) return null;
  return <section aria-label="Discover education updates" className={compact ? "mt-6 space-y-5" : "border-b bg-white py-7"}>
    <div className={compact ? "space-y-5" : "mx-auto max-w-7xl space-y-5 px-4 lg:px-8"}>
      {urgent.length > 0 && <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm"><span className="shrink-0 rounded bg-amber-600 px-2 py-1 text-xs font-black uppercase text-white">Breaking updates</span><div className="flex min-w-0 flex-1 flex-wrap gap-x-4 gap-y-1">{urgent.map(item => <a key={item.href} href={item.href} className="font-semibold text-amber-950 underline-offset-2 hover:underline">{item.title} →</a>)}</div></div>}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]">
        {trending.length > 0 && <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5"><div className="mb-4 flex items-center justify-between gap-2"><div><h2 className="text-xl font-black text-green-950">Trending updates</h2><p className="mt-1 text-xs text-gray-500">Relevant recent stories selected by our discovery ranking</p></div><a href="/updates" className="shrink-0 text-sm font-bold text-green-800">All updates →</a></div><div className="grid gap-3 sm:grid-cols-2">{trending.map(item => <article key={item.href} className="min-w-0 rounded-xl bg-gray-50 p-4"><p className="text-xs font-semibold text-green-800">{item.category || "Education update"}</p><h3 className="mt-2 font-bold leading-snug"><a href={item.href} className="hover:underline">{item.title}</a></h3><p className="mt-2 line-clamp-2 text-sm text-gray-600">{item.summary}</p></article>)}</div></section>}
        <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5"><div className="mb-4 flex items-center justify-between gap-2"><h2 className="text-xl font-black text-green-950">Upcoming deadlines</h2><a href="/deadlines" className="shrink-0 text-sm font-bold text-green-800">View all →</a></div>{deadlines.length ? <div className="space-y-3">{deadlines.map(item => <article key={item.href} className="border-b border-gray-100 pb-3 last:border-0"><p className="text-xs font-bold text-amber-700">{deadlineDate(item.deadline)!.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"Africa/Lagos"})}</p><a href={item.href} className="mt-1 block text-sm font-semibold hover:text-green-800 hover:underline">{item.title}</a></article>)}</div> : <p className="text-sm text-gray-600">No verified upcoming deadlines available right now. Check the full deadline tracker.</p>}</section>
      </div>
      {!compact && <nav aria-label="Quick discovery links" className="flex flex-wrap gap-2 text-sm font-semibold">{[["My School","/my-school"],["Opportunities","/opportunities"],["Admission calculators","/screening-calculator"],["CGPA tools","/cgpa-calculator"],["Guides","/guides"]].map(([name,href])=><a key={href} href={href} className="rounded-full border border-green-200 px-4 py-2 text-green-900 hover:bg-green-50">{name} →</a>)}</nav>}
    </div>
  </section>;
}
