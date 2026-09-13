"use client";

import { updates, opportunities } from "../../data/updates";
import SiteContact from "../components/SiteContact";

const WHATSAPP_NUMBER = "2348182141088";
const whatsappLink = (message: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

function parseDeadline(value: string) {
  const match = value.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i);
  if (!match) return null;
  const date = new Date(`${match[2]} ${match[1]}, ${match[3]} 23:59:59`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function deadlineState(value: string) {
  const deadline = parseDeadline(value);
  if (!deadline) return { label: "VERIFY DEADLINE", days: null as number | null, closed: false };
  const diff = deadline.getTime() - Date.now();
  const days = Math.max(0, Math.ceil(diff / 86400000));
  if (diff < 0) return { label: "CLOSED", days: 0, closed: true };
  return { label: "OPEN", days, closed: false };
}

export default function DeadlinesPage() {
  const updateItems = updates.filter(item => item.isOpportunity).map(item => ({
    institution: item.institution,
    programme: item.opportunityProgramme || item.title,
    deadline: item.opportunityDeadline || item.deadline || "Check latest deadline",
    updateId: item.id as number | null,
  }));
  const baseItems = opportunities.map(item => ({ ...item, updateId: null as number | null }));
  const items = [...updateItems, ...baseItems];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/"><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-16 w-auto object-contain" /></a>
          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
            <a href="/">Home</a><a href="/updates">Latest Updates</a><a href="/opportunities">Opportunities</a><a href="/deadlines" className="text-green-700">Deadlines</a><a href="/guides">Guides</a>
          </nav>
          <a href={whatsappLink("Hello S.O.H CONSULTS, I need admission guidance about an application deadline.")} target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white" style={{color:"#fff"}}>Get Guidance</a>
        </div>
      </header>
      <section className="bg-gradient-to-br from-green-950 via-green-900 to-green-700 py-16 text-white">
        <div className="mx-auto max-w-5xl px-5 text-center"><p className="font-bold uppercase tracking-widest text-green-300">S.O.H CONSULTS</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Admission Deadline Tracker</h1><p className="mx-auto mt-5 max-w-2xl leading-8 text-green-50">Track known application deadlines and quickly identify opportunities that need your attention.</p></div>
      </section>
      <section className="py-14"><div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">Deadlines marked <b>VERIFY DEADLINE</b> do not yet have a confirmed date in our current data. Always confirm before making payment or submitting an application.</div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => { const state = deadlineState(item.deadline); return (
          <article key={`${item.institution}-${item.programme}-${index}`} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3"><p className="font-black text-green-700">{item.institution}</p><span className={`rounded-full px-3 py-1 text-xs font-black ${state.closed ? "bg-red-100 text-red-800" : state.label === "OPEN" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"}`}>{state.label}</span></div>
            <h2 className="mt-3 text-lg font-black">{item.programme}</h2><p className="mt-5 text-xs font-bold uppercase tracking-wide text-gray-500">Deadline</p><p className="mt-1 font-bold">{item.deadline}</p>
            {state.days !== null && !state.closed && <p className="mt-2 text-sm font-black text-green-700">{state.days === 0 ? "Closes today" : `${state.days} day${state.days === 1 ? "" : "s"} remaining`}</p>}
            <div className="mt-5 flex gap-3">{item.updateId && <a href={`/updates/${item.updateId}`} className="flex-1 rounded-xl border border-green-700 px-4 py-3 text-center text-sm font-black text-green-700">View Details</a>}<a href={whatsappLink(`Hello S.O.H CONSULTS, I need guidance about the deadline for ${item.institution} ${item.programme}.`)} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl bg-green-700 px-4 py-3 text-center text-sm font-black text-white" style={{color:"#fff"}}>Ask Us</a></div>
          </article>); })}</div>
      </div></section><SiteContact />
    </main>
  );
}
