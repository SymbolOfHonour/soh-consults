"use client";

import { updates, opportunities } from "../../data/updates";
import { admissionDeadlines } from "../../data/admission-deadlines";
import { rankContent } from "../../lib/ranking-engine";
import SiteContact from "./SiteContact";
import { deadlineDate } from "../../lib/discovery-text";
import { useDiscoveryFilters } from "./useDiscoveryFilters";
import DiscoveryHeader from "./DiscoveryHeader";

const WHATSAPP_NUMBER = "2348182141088";
const whatsappLink = (message: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

function parseDeadline(value: string) {
  return deadlineDate(value);
}

function deadlineState(value?: string, explicitStatus?: string) {
  if(explicitStatus==="CLOSED")return {label:"CLOSED",days:0,closed:true};
  const deadline = value ? parseDeadline(value) : null;
  if (!deadline) return { label: "VERIFY DEADLINE", days: null as number | null, closed: false };
  const diff = deadline.getTime() - Date.now();
  if (diff < 0) return { label: "CLOSED", days: 0, closed: true };
  const days = Math.max(0, Math.floor((deadline.getTime()+3_600_000)/86_400_000)-Math.floor((Date.now()+3_600_000)/86_400_000));
  if (explicitStatus === "REOPENED") return { label: "REOPENED", days, closed: false };
  if (days <= 3) return { label: "CLOSING SOON", days, closed: false };
  return { label: "OPEN", days, closed: false };
}

export type PublishedDeadline={institution:string;programme:string;deadline?:string;category:string;status?:string;updateId:number|null;publishedAt?:string;detailHref?:string;isOfficial?:boolean};
export default function DeadlinesExplorer({publishedItems=[],initialFilters={}}:{publishedItems?:PublishedDeadline[];initialFilters?:Partial<{q:string;category:string}>}) {
  const [{q:query,category},setFilters]=useDiscoveryFilters({q:"",category:"All"},initialFilters);
  const setQuery=(q:string)=>setFilters({q});
  const setCategory=(category:string)=>setFilters({category});
  const trackerItems = admissionDeadlines.map(item => ({ institution: item.shortName ? `${item.institution} (${item.shortName})` : item.institution, programme: item.programme, deadline: item.deadline, category: item.category, status: item.status, updateId: item.updateId, publishedAt: undefined as string | undefined }));
  const updateItems = updates.filter(item => item.isOpportunity).map(item => ({ institution: item.institution, programme: item.opportunityProgramme || item.title, deadline: item.opportunityDeadline || item.deadline || "Check latest deadline", category: item.opportunityCategory || "Other", status: item.opportunityStatus, updateId: item.id as number | null, publishedAt: item.date }));
  const baseItems = opportunities.map(item => ({ ...item, category: item.category, updateId: null as number | null, publishedAt: undefined as string | undefined }));
  const items:PublishedDeadline[] = [...publishedItems, ...trackerItems, ...updateItems, ...baseItems];
  const categories = ["All", "University", "Polytechnic", "College of Nursing Sciences", "Scholarships", "Other"];
  const filteredItems = (() => {
    const eligible = items.filter(item => {
      const itemCategory = item.category === "Universities" ? "University" : item.category === "Polytechnics" ? "Polytechnic" : item.category;
      return category === "All" || itemCategory === category;
    });
    return rankContent(eligible.map(item => ({ ...item, title: `${item.institution} ${item.programme}`, summary: `${item.programme} application deadline`, isOfficial: item.isOfficial===true })), { query, category: category === "All" ? undefined : category }).filter(result=>!query.trim()||result.breakdown.relevance>0).map(result => result.item);
  })();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <DiscoveryHeader/>
      <section className="bg-gradient-to-br from-green-950 via-green-900 to-green-700 py-16 text-white"><div className="mx-auto max-w-5xl px-5 text-center"><p className="font-bold uppercase tracking-widest text-green-300">S.O.H CONSULTS</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Admission Deadline Tracker</h1><p className="mx-auto mt-5 max-w-2xl leading-8 text-green-50">Track known application deadlines and quickly identify opportunities that need your attention.</p></div></section>
      <section className="py-14"><div className="mx-auto max-w-6xl px-5 lg:px-8"><div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">Deadlines marked <b>VERIFY DEADLINE</b> were announced as open without a confirmed closing date. Always confirm before making payment or submitting an application.</div><input aria-label="Search deadlines" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search school or programme..." className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100" /><div className="my-6 flex flex-wrap gap-2">{categories.map(item => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category===item} className={`min-h-11 rounded-full px-4 py-2 text-sm font-black ${category === item ? "bg-green-700 text-white" : "border border-gray-200 bg-white text-gray-700"}`}>{item}</button>)}</div><p className="mb-5 text-sm font-bold text-gray-500">{filteredItems.length} application{filteredItems.length === 1 ? "" : "s"} shown</p>
        {filteredItems.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filteredItems.map((item, index) => { const state = deadlineState(item.deadline, item.status); return <article key={`${item.institution}-${item.programme}-${index}`} className={`min-w-0 rounded-2xl border bg-white p-6 shadow-sm ${state.closed ? "border-gray-200 opacity-70" : state.label === "CLOSING SOON" ? "border-amber-300" : "border-gray-200"}`}><div className="flex flex-wrap items-start justify-between gap-3"><p className="break-words font-black text-green-700">{item.institution}</p><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${state.closed ? "bg-red-100 text-red-800" : state.label === "OPEN" ? "bg-green-100 text-green-800" : state.label === "REOPENED" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-900"}`}>{state.label}</span></div><h2 className="mt-3 break-words text-lg font-black">{item.programme}</h2><p className="mt-5 text-xs font-bold uppercase tracking-wide text-gray-500">Deadline</p><p className="mt-1 font-bold">{(item.deadline&&deadlineDate(item.deadline)?.toLocaleDateString("en-GB",{timeZone:"Africa/Lagos",day:"numeric",month:"long",year:"numeric"}))||item.deadline||"Confirm latest deadline"}</p>{state.days !== null && !state.closed && <p className="mt-2 text-sm font-black text-green-700">{state.days === 0 ? "Closes today" : `${state.days} day${state.days === 1 ? "" : "s"} remaining`}</p>}<div className="mt-5 flex gap-3">{(item.detailHref||item.updateId) && <a href={item.detailHref||`/updates/${item.updateId}`} className="flex-1 rounded-xl border border-green-700 px-4 py-3 text-center text-sm font-black text-green-700">View Details</a>}<a href={whatsappLink(`Hello S.O.H CONSULTS, I need guidance about the deadline for ${item.institution} ${item.programme}.`)} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl bg-green-700 px-4 py-3 text-center text-sm font-black text-white" style={{color:"#fff"}}>Ask Us</a></div></article>; })}</div> : <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center"><p className="text-lg font-black">No matching deadlines found</p><button type="button" onClick={() => { setQuery(""); setCategory("All"); }} className="mt-4 font-black text-green-700">Clear search and filters</button></div>}
      </div></section><SiteContact />
    </main>
  );
}
