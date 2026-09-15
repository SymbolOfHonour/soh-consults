import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "../../../lib/admin-auth";

const modules = [
  { title: "Opportunities Manager", note: "Scholarships, internships, jobs, NYSC, grants and fellowships.", href: "/opportunities", state: "Live content" },
  { title: "Forms Manager", note: "Control admission forms and open/closed programme status from one place.", href: "/admin/updates", state: "Foundation ready" },
  { title: "LASU Calculator Control", note: "Protect the working calculator while preparing admin-managed notices and rules.", href: "/lasu-calculator", state: "Calculator live" },
  { title: "Media Library", note: "Central management point for update images, flyers and PDF attachments.", href: "/admin/updates", state: "Uploads live" },
  { title: "Content Calendar", note: "Use deadline intelligence to plan admission, scholarship and registration content.", href: "/deadlines", state: "Deadline view live" },
  { title: "SEO Control", note: "Review public content structure, titles and discoverability from the content workflow.", href: "/admin/updates", state: "Content workflow" },
  { title: "Enquiries & Leads", note: "Future home for website enquiries and WhatsApp source tracking.", href: "/admin", state: "Planned" },
  { title: "Analytics", note: "Future visitor, CTA, search and Ask S.O.H reporting centre.", href: "/admin", state: "Planned" },
  { title: "System Settings", note: "Future control for business contact details and global website settings.", href: "/admin", state: "Planned" },
];

export default async function AdminModulesPage() {
  if (!(await isAdmin())) redirect("/admin/updates");
  return <main className="min-h-screen bg-gray-50 text-gray-950">
    <header className="border-b border-gray-200 bg-white"><div className="mx-auto flex max-w-[1450px] flex-wrap items-center justify-between gap-4 px-5 py-5"><div><p className="text-[11px] font-black uppercase tracking-[.22em] text-green-700">S.O.H CONSULTS · PRIVATE</p><h1 className="text-2xl font-black">Operations Modules</h1><p className="mt-1 text-sm text-gray-500">The control-centre map for routine S.O.H CONSULTS operations.</p></div><div className="flex gap-2"><Link href="/admin" className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-black">Dashboard</Link><Link href="/admin/updates" className="rounded-xl bg-green-700 px-4 py-2 text-sm font-black text-white">Manage Updates</Link></div></div></header>
    <section className="mx-auto max-w-[1450px] px-5 py-7"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{modules.map(m => <Link key={m.title} href={m.href} className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"><div className="flex items-start justify-between gap-3"><h2 className="text-lg font-black group-hover:text-green-800">{m.title}</h2><span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-black uppercase text-green-700">{m.state}</span></div><p className="mt-3 text-sm font-medium leading-6 text-gray-600">{m.note}</p><p className="mt-5 text-sm font-black text-green-700">Open →</p></Link>)}</div><div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5"><p className="text-xs font-black uppercase tracking-[.16em] text-green-700">Protected rollout</p><h2 className="mt-1 text-xl font-black">Existing production tools remain the source of truth</h2><p className="mt-2 max-w-4xl text-sm leading-6 text-gray-700">Modules marked Planned or Foundation ready are intentionally not pretending to be active controls. They will be connected only when their storage and permissions are production-safe. The live LASU calculator and published updates remain untouched.</p></div></section>
  </main>;
}
