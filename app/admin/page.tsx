import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "../../lib/admin-auth";
import { listStories } from "../../lib/news-queue";

function Stat({ label, value, note, tone = "green" }: { label: string; value: number; note: string; tone?: "green" | "amber" | "blue" | "gray" }) {
  const toneClass = { green: "border-green-200 bg-green-50", amber: "border-amber-200 bg-amber-50", blue: "border-blue-200 bg-blue-50", gray: "border-gray-200 bg-white" }[tone];
  return <div className={`rounded-2xl border p-5 shadow-sm ${toneClass}`}><p className="text-xs font-black uppercase tracking-[.16em] text-gray-600">{label}</p><p className="mt-2 text-4xl font-black">{value}</p><p className="mt-1 text-sm font-bold text-gray-500">{note}</p></div>;
}

function deadlineText(iso: string) {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/updates");
  const stories = await listStories().catch(() => []);
  const now = Date.now();
  const counts = { total: stories.length, draft: stories.filter(s => s.status === "draft").length, approved: stories.filter(s => s.status === "approved").length, published: stories.filter(s => s.status === "published").length, archived: stories.filter(s => s.status === "archived").length, rejected: stories.filter(s => s.status === "rejected").length };
  const recent = [...stories].sort((a,b) => +new Date(b.updated_at) - +new Date(a.updated_at)).slice(0,5);
  const upcoming = stories.filter(s => s.deadline_iso && +new Date(s.deadline_iso) >= now).sort((a,b) => +new Date(a.deadline_iso!) - +new Date(b.deadline_iso!)).slice(0,5);
  const expiredLive = stories.filter(s => s.status === "published" && s.deadline_iso && +new Date(s.deadline_iso) < now);
  const urgent = stories.filter(s => s.deadline_iso && +new Date(s.deadline_iso) >= now && +new Date(s.deadline_iso) <= now + 7*86400000);
  const thisWeek = stories.filter(s => s.status === "published" && +new Date(s.published_at || s.updated_at) >= now - 7*86400000).length;
  const thisMonth = stories.filter(s => s.status === "published" && +new Date(s.published_at || s.updated_at) >= now - 30*86400000).length;
  const categories = Object.entries(stories.filter(s => s.status === "published").reduce<Record<string,number>>((acc,s) => { acc[s.category || "Other"] = (acc[s.category || "Other"] || 0) + 1; return acc; }, {})).sort((a,b) => b[1]-a[1]).slice(0,6);
  const attention = counts.draft + counts.approved + expiredLive.length + urgent.length;

  return <main className="min-h-screen bg-gray-50 text-gray-950">
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-[1450px] flex-wrap items-center justify-between gap-4 px-5 py-4"><div><p className="text-[11px] font-black uppercase tracking-[.22em] text-green-700">S.O.H CONSULTS · PRIVATE</p><h1 className="text-2xl font-black">Admin Control Centre</h1></div><nav className="flex flex-wrap items-center gap-2"><Link href="/admin" className="rounded-xl bg-green-50 px-4 py-2 text-sm font-black text-green-800">Dashboard</Link><Link href="/admin/updates" className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-black">Updates</Link><Link href="/admin/updates?new=1" className="rounded-xl bg-green-700 px-4 py-2 text-sm font-black text-white">+ New Update</Link><Link href="/" className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-black">Website</Link></nav></div></header>

    <section className="mx-auto max-w-[1450px] px-5 py-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-black">Today at S.O.H</h2><p className="text-sm text-gray-500">{attention ? `${attention} item${attention === 1 ? "" : "s"} may need your attention.` : "Everything looks tidy. No immediate content action is waiting."}</p></div><Link href="/admin/updates" className="rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white">Check Sources / Manage Content</Link></div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Published" value={counts.published} note={`${thisWeek} published in last 7 days`} /><Stat label="Drafts" value={counts.draft} note="Waiting for review" tone="amber" /><Stat label="Approved" value={counts.approved} note="Ready to publish" tone="blue" /><Stat label="Total Updates" value={counts.total} note={`${counts.archived} archived · ${counts.rejected} rejected`} tone="gray" /></div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-red-700">Attention needed</p><h3 className="text-xl font-black">Content requiring action</h3></div><span className="rounded-full bg-red-50 px-3 py-1 text-sm font-black text-red-700">{attention}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><Link href="/admin/updates" className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-2xl font-black">{counts.draft}</p><p className="font-black">Drafts awaiting review</p></Link><Link href="/admin/updates" className="rounded-xl border border-blue-200 bg-blue-50 p-4"><p className="text-2xl font-black">{counts.approved}</p><p className="font-black">Approved and ready</p></Link><Link href="/admin/updates" className="rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-2xl font-black">{expiredLive.length}</p><p className="font-black">Published deadlines expired</p></Link><div className="rounded-xl border border-orange-200 bg-orange-50 p-4"><p className="text-2xl font-black">{urgent.length}</p><p className="font-black">Deadlines within 7 days</p></div></div></section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-green-700">Activity</p><h3 className="text-xl font-black">Recently updated</h3></div><Link href="/admin/updates" className="text-sm font-black text-green-700">View all</Link></div><div className="mt-3 divide-y divide-gray-100">{recent.map(s => <div key={s.id} className="flex items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="truncate font-black">{s.title}</p><p className="mt-1 text-xs font-bold text-gray-500"><span className="uppercase">{s.status}</span> · {s.category} · {new Date(s.updated_at).toLocaleString("en-NG", {dateStyle:"medium",timeStyle:"short"})}</p></div><Link href="/admin/updates" className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs font-black">Manage</Link></div>)}</div></section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-green-800 bg-green-950 p-5 text-white shadow-sm"><p className="text-xs font-black uppercase tracking-[.16em] text-green-300">System status</p><h3 className="mt-1 text-xl font-black">Website health</h3><div className="mt-4 space-y-2 text-sm font-bold"><div className="flex justify-between rounded-xl bg-green-900 p-3"><span>Website</span><span className="text-green-300">● Online</span></div><div className="flex justify-between rounded-xl bg-green-900 p-3"><span>Content database</span><span className="text-green-300">● Connected</span></div><div className="flex justify-between rounded-xl bg-green-900 p-3"><span>Published content</span><span>{counts.published} live</span></div></div></section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[.16em] text-green-700">Publishing snapshot</p><div className="mt-3 grid grid-cols-2 gap-3"><div className="rounded-xl bg-gray-50 p-3"><p className="text-2xl font-black">{thisWeek}</p><p className="text-xs font-bold text-gray-500">Last 7 days</p></div><div className="rounded-xl bg-gray-50 p-3"><p className="text-2xl font-black">{thisMonth}</p><p className="text-xs font-bold text-gray-500">Last 30 days</p></div></div><h4 className="mt-5 font-black">Content breakdown</h4><div className="mt-2 space-y-2">{categories.map(([name,count]) => <div key={name} className="flex justify-between text-sm"><span className="font-bold text-gray-600">{name}</span><span className="font-black">{count}</span></div>)}</div></section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[.16em] text-green-700">Deadline intelligence</p><h3 className="text-xl font-black">Upcoming</h3><div className="mt-3 divide-y divide-gray-100">{upcoming.length ? upcoming.map(s => <div key={s.id} className="py-3"><p className="text-sm font-black leading-snug">{s.title}</p><div className="mt-1 flex flex-wrap gap-2 text-xs font-bold"><span className="text-green-700">{s.deadline || new Date(s.deadline_iso!).toLocaleDateString("en-NG")}</span><span className="text-gray-500">· {deadlineText(s.deadline_iso!)}</span></div></div>) : <p className="py-4 text-sm text-gray-500">No upcoming deadlines.</p>}</div></section>
        </aside>
      </div>
    </section>
  </main>;
}
