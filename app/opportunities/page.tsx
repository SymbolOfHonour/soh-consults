"use client";

import { useMemo, useState } from "react";
import { getUpdateSlug, opportunities, updates } from "../../data/updates";
import { rankContent } from "../../lib/ranking-engine";
import SiteContact from "../components/SiteContact";

const WHATSAPP_NUMBER = "2348182141088";
const whatsappLink = (message: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
const opportunityCategories = ["All", "Scholarships", "Universities", "Polytechnics", "Colleges", "Other"];
const datedDeadline=(value:string)=>{const cleaned=value.trim();const calendarDate=cleaned.match(/\b\d{1,2}\s+[a-z]+\s+20\d{2}\b|\b[a-z]+\s+\d{1,2},?\s+20\d{2}\b|\b20\d{2}-\d{2}-\d{2}\b/i)?.[0];if(!calendarDate)return null;const parsed=Date.parse(calendarDate+" UTC");return Number.isNaN(parsed)?null:new Date(parsed);};
const currentStatus=(status:string,deadline:string)=>{const date=datedDeadline(deadline);if(!date)return status;date.setUTCHours(22,59,59,999);return Date.now()>date.getTime()?"CLOSED":status;};

export default function OpportunitiesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  const updateOpportunities = updates.filter((item) => item.isOpportunity).map((item) => ({
    institution: item.institution,
    programme: item.opportunityProgramme || item.title,
    category: item.opportunityCategory || "Other",
    status: currentStatus(item.opportunityStatus || "OPEN",item.opportunityDeadline || "Check latest deadline"),
    deadline: item.opportunityDeadline || "Check latest deadline",
    description: item.summary,
    updateId: item.id,
    updateSlug: getUpdateSlug(item),
    applicationUrl: item.sourceUrl,
    publishedAt: item.date,
  }));
  const baseOpportunities = opportunities.map((item) => ({ ...item, status:currentStatus(item.status,item.deadline), updateId: null as number | null, updateSlug: null as string | null, applicationUrl: undefined as string | undefined, publishedAt: undefined as string | undefined }));
  const allOpportunities = [...updateOpportunities, ...baseOpportunities];

  const filteredOpportunities = useMemo(() => {
    const eligible = activeCategory === "All" ? allOpportunities : allOpportunities.filter((item) => item.category === activeCategory);
    return rankContent(eligible.map((item) => ({
      ...item,
      title: `${item.institution} ${item.programme}`,
      summary: item.description,
      deadline: item.deadline,
      isOfficial: Boolean(item.applicationUrl),
    })), { query, category: activeCategory === "All" ? undefined : activeCategory }).map((result) => result.item);
  }, [activeCategory, query]);

  return <main className="min-h-screen bg-gray-50 text-gray-900">
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><a href="/" className="flex items-center gap-3"><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-16 w-auto object-contain" /></a><nav className="hidden items-center gap-6 text-sm font-semibold md:flex"><a href="/" className="transition hover:text-green-700">Home</a><a href="/updates" className="transition hover:text-green-700">Latest Updates</a><a href="/opportunities" className="text-green-700">Opportunities</a><a href="/deadlines" className="transition hover:text-green-700">Deadlines</a><a href="/guides" className="transition hover:text-green-700">Guides</a><a href="/screening-calculator" className="transition hover:text-green-700">Screening Calculator</a></nav><a href={whatsappLink("Hello S.O.H CONSULTS, I need admission guidance. Please assist me.")} target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800">Get Guidance</a></div></header>
    <section className="bg-gradient-to-br from-green-950 via-green-900 to-green-700 py-16 text-white"><div className="mx-auto max-w-5xl px-5 text-center lg:px-8"><p className="font-bold uppercase tracking-widest text-green-300">S.O.H CONSULTS</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Admission Opportunities</h1><p className="mx-auto mt-5 max-w-2xl leading-8 text-green-50">Explore current admission opportunities across universities, polytechnics, colleges and other programmes.</p></div></section>
    <section className="py-16"><div className="mx-auto max-w-7xl px-5 lg:px-8">
      <div className="mx-auto max-w-2xl"><label htmlFor="opportunity-search" className="sr-only">Search opportunities</label><input id="opportunity-search" type="search" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search scholarships, schools or programmes..." className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-base shadow-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100" /></div>
      <div className="mt-7 flex flex-wrap justify-center gap-2">{opportunityCategories.map((category)=><button key={category} onClick={()=>setActiveCategory(category)} className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${activeCategory===category?"bg-green-700 text-white":"bg-white text-gray-700 shadow-sm hover:bg-green-50"}`}>{category}</button>)}</div>
      <p className="mt-7 text-sm font-semibold text-gray-500">{filteredOpportunities.length} opportunit{filteredOpportunities.length===1?"y":"ies"} found</p>
      {filteredOpportunities.length ? <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filteredOpportunities.map((item)=><article key={`${item.institution}-${item.programme}`} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="border-b border-gray-100 bg-white p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wide text-green-700">{item.category}</p><h2 className="mt-2 text-xl font-black">{item.institution}</h2></div><span className={`rounded-full px-3 py-1 text-xs font-black ${item.status==="CLOSED"?"bg-gray-200 text-gray-700":"bg-green-100 text-green-800"}`}>{item.status}</span></div></div><div className="p-6"><h3 className="font-black">{item.programme}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p><div className="mt-5 rounded-xl bg-gray-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Deadline</p><p className="mt-1 font-bold text-gray-900">{item.deadline}</p></div>{item.updateId&&<a href={`/updates/${item.updateSlug}`} className="mt-5 block rounded-xl border border-green-700 px-4 py-3 text-center text-sm font-black text-green-700 transition hover:bg-green-50">View Full Details</a>}<div className="mt-3 flex gap-3">{item.status!=="CLOSED"&&<a href={item.applicationUrl||whatsappLink(`Hello S.O.H CONSULTS, I am interested in the ${item.institution} ${item.programme} opportunity. Please guide me on the application process.`)} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl bg-green-700 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-green-800">Apply Now</a>}<a href={whatsappLink(`Hello S.O.H CONSULTS, I need guidance about the ${item.institution} ${item.programme} opportunity.`)} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-green-700 px-4 py-3 text-center text-sm font-bold text-green-700 transition hover:bg-green-50">Guidance</a></div></div></article>)}</div>:<div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center"><p className="text-xl font-black text-gray-900">No opportunity matches your search</p><button onClick={()=>{setQuery("");setActiveCategory("All");}} className="mt-4 font-black text-green-700">Clear search and filters</button></div>}
    </div></section><SiteContact />
  </main>;
}
