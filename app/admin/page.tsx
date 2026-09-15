import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "../../lib/admin-auth";
import { listStories } from "../../lib/news-queue";

function StatCard({ label, value, href, note, tone = "green" }: { label: string; value: number; href: string; note: string; tone?: "green" | "blue" | "amber" | "gray" }) {
  const tones = {
    green: "border-green-200 bg-green-50 text-green-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    gray: "border-gray-200 bg-gray-50 text-gray-900",
  };
  return <Link href={href} className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tones[tone]}`}>
    <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">{label}</p>
    <p className="mt-2 text-4xl font-black">{value}</p>
    <p className="mt-2 text-sm font-bold opacity-70">{note}</p>
  </Link>;
}

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/updates");

  const stories = await listStories().catch(() => []);
  const counts = {
    total: stories.length,
    draft: stories.filter((story) => story.status === "draft").length,
    approved: stories.filter((story) => story.status === "approved").length,
    published: stories.filter((story) => story.status === "published").length,
    archived: stories.filter((story) => story.status === "archived").length,
    rejected: stories.filter((story) => story.status === "rejected").length,
  };
  const recent = [...stories].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 6);
  const upcoming = stories.filter((story) => story.deadline_iso && new Date(story.deadline_iso).getTime() >= Date.now()).sort((a, b) => new Date(a.deadline_iso!).getTime() - new Date(b.deadline_iso!).getTime()).slice(0, 5);

  return <main className="min-h-screen bg-gray-50 text-gray-950">
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-green-700">S.O.H CONSULTS · PRIVATE</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Admin Control Centre</h1>
          <p className="mt-1 text-sm text-gray-500">One place to monitor, create and manage S.O.H CONSULTS updates.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/updates" className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black hover:bg-gray-50">Manage Updates</Link>
          <Link href="/admin/updates?new=1" className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-black text-white hover:bg-green-800">+ New Update</Link>
        </div>
      </div>
    </header>

    <section className="mx-auto max-w-7xl px-5 py-7">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Published" value={counts.published} href="/admin/updates" note="Live website updates" tone="green" />
        <StatCard label="Drafts" value={counts.draft} href="/admin/updates" note="Waiting for review" tone="amber" />
        <StatCard label="Approved" value={counts.approved} href="/admin/updates" note="Ready to publish" tone="blue" />
        <StatCard label="Total Updates" value={counts.total} href="/admin/updates" note={`${counts.archived} archived · ${counts.rejected} rejected`} tone="gray" />
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">Activity</p><h2 className="mt-1 text-xl font-black">Recently updated</h2></div>
            <Link href="/admin/updates" className="text-sm font-black text-green-700 hover:underline">View all</Link>
          </div>
          <div className="mt-4 divide-y divide-gray-100">
            {recent.length ? recent.map((story) => <div key={story.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-black uppercase">{story.status}</span><span className="text-xs font-bold text-gray-500">{story.category}</span></div><p className="mt-1 truncate font-black">{story.title}</p><p className="mt-1 text-xs text-gray-500">Updated {new Date(story.updated_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p></div>
              <Link href="/admin/updates" className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-black hover:bg-gray-50">Manage</Link>
            </div>) : <p className="py-8 text-sm text-gray-500">No update activity yet.</p>}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-green-200 bg-green-950 p-5 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-green-300">Quick actions</p>
            <h2 className="mt-1 text-xl font-black">What do you want to do?</h2>
            <div className="mt-4 grid gap-2">
              <Link href="/admin/updates?new=1" className="rounded-xl bg-white px-4 py-3 text-sm font-black text-green-950">Create a new update</Link>
              <Link href="/admin/updates" className="rounded-xl border border-green-700 bg-green-900 px-4 py-3 text-sm font-black">Review and manage updates</Link>
              <Link href="/" className="rounded-xl border border-green-700 bg-green-900 px-4 py-3 text-sm font-black">View public website</Link>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">Deadlines</p>
            <h2 className="mt-1 text-xl font-black">Upcoming</h2>
            <div className="mt-3 divide-y divide-gray-100">
              {upcoming.length ? upcoming.map((story) => <div key={story.id} className="py-3"><p className="text-sm font-black leading-snug">{story.title}</p><p className="mt-1 text-xs font-bold text-green-700">{story.deadline || new Date(story.deadline_iso!).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p></div>) : <p className="py-5 text-sm text-gray-500">No upcoming deadlines recorded.</p>}
            </div>
          </section>
        </div>
      </div>
    </section>
  </main>;
}
