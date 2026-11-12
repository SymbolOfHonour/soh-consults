"use client";
import { useState } from "react";
import Image from "next/image";
import PublicPageLink from "../components/PublicPageLink";
const schools = [
  {short:"UNILORIN",name:"University of Ilorin",type:"Post-UTME Examination",location:"Kwara",href:"/unilorin-calculator"},
  {short:"EKSU",name:"Ekiti State University, Ado-Ekiti",type:"Online Screening",location:"Ekiti",href:"/eksu-calculator"},
  {short:"OAU",name:"Obafemi Awolowo University, Ile-Ife",type:"Post-UTME Examination",location:"Osun",href:"/oau-calculator"},
  {short:"FUSTECH",name:"Federal University of Science and Technology, Epe",type:"Online Screening",location:"Lagos",href:"/fustech-calculator"},
  {short:"LASU",name:"Lagos State University",type:"Online Screening",location:"Lagos",href:"/lasu-calculator"},
  {short:"FUOYE",name:"Federal University Oye-Ekiti",type:"Online Screening",location:"Ekiti",href:"/fuoye-calculator"},
  {short:"OOU",name:"Olabisi Onabanjo University",type:"Post-UTME Examination",location:"Ogun",href:"/oou-calculator"},
  {short:"FUADSI",name:"Federal University of Agriculture and Development Studies, Iragbiji",type:"Online Screening",location:"Osun",href:"/fuadsi-calculator"},
  {short:"UNIOSUN",name:"Osun State University",type:"Online Screening",location:"Osun",href:"/uniosun-calculator"},
  {short:"LASUSTECH",name:"Lagos State University of Science and Technology",type:"Online Screening",location:"Lagos",href:"/lasustech-calculator"},
  {short:"LASUED",name:"Lagos State University of Education",type:"Online Screening",location:"Lagos",href:"/lasued-calculator"},
  {short:"YABATECH",name:"Yaba College of Technology",type:"Post-UTME Screening",location:"Lagos",href:"/yabatech-calculator"},
].sort((a,b)=>a.short==="LASU"?-1:b.short==="LASU"?1:a.short.localeCompare(b.short));
const filters = ["All schools","Online screening","Post-UTME"] as const;
export default function InstitutionPicker() {
 const [query,setQuery] = useState("");
 const [filter,setFilter] = useState<(typeof filters)[number]>("All schools");
 const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 const visible = schools.filter(s=>words.every(word=>(s.short+" "+s.name+" "+s.location).toLowerCase().includes(word)) && (filter==="All schools" || (filter==="Online screening" ? s.type==="Online Screening" : s.type!=="Online Screening")));
 return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
  <div className="mx-auto max-w-6xl">
   <header className="rounded-2xl bg-gradient-to-r from-green-900 via-green-800 to-emerald-600 p-4 text-white shadow-sm sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
     <PublicPageLink href="/" className="inline-flex items-center rounded-full border border-white/30 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10">← Home</PublicPageLink>
     <span className="text-xs font-semibold text-green-100">{schools.length} school calculators · Free to use</span>
    </div>
    <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl">Find your school. Calculate your score.</h1>
    <p className="mt-2 text-sm leading-5 text-green-50">Choose your school to check your screening score and course requirements.</p>
   </header>
   <section className="mt-5" aria-labelledby="school-picker-title">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
     <div><p className="text-xs font-bold uppercase tracking-widest text-green-700">YOUR ADMISSION JOURNEY</p><h2 id="school-picker-title" className="mt-2 text-2xl font-black tracking-tight">Choose your institution</h2><p className="mt-2 text-sm text-slate-600">Choose a school to get started. More schools are on the way.</p></div>
     <div className="w-full sm:max-w-sm">
      <label htmlFor="school-search" className="mb-2 block text-xs font-bold text-slate-600">Search schools</label>
      <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 shadow-sm focus-within:ring-2 focus-within:ring-green-600">
       <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-green-700" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg>
       <input id="school-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="School name, abbreviation or state" className="min-w-0 w-full bg-transparent py-3 text-sm outline-none" autoComplete="off" />
      </div>
     </div>
    </div>
    <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter calculators">
     {filters.map(item=><button key={item} type="button" aria-pressed={filter===item} onClick={()=>setFilter(item)} className={"rounded-full border px-4 py-2 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 "+(filter===item?"border-green-700 bg-green-700 text-white":"border-slate-200 bg-white text-slate-600 hover:border-green-600 hover:text-green-700")}>{item}</button>)}
     {(query || filter!=="All schools") && <button type="button" onClick={()=>{setQuery("");setFilter("All schools")}} className="px-2 py-2 text-xs font-bold text-green-700 underline">Clear filters</button>}
    </div>
    <p role="status" className="mt-4 text-xs text-slate-500">{visible.length} {visible.length===1?"school":"schools"} {query || filter!=="All schools"?"found":"to explore"}</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
     {visible.map(s=><PublicPageLink key={s.short} href={s.href} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-green-500 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-600 motion-safe:hover:-translate-y-1">
      <div className="h-1 bg-gradient-to-r from-green-800 to-emerald-500" />
      <div className="flex flex-1 flex-col p-5">
       <div className="flex items-center justify-between gap-3"><span className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-slate-100"><Image src={"/school-logos/"+s.short.toLowerCase()+".png"} alt={s.short+" emblem"} width={96} height={80} className="h-full w-full object-contain" /></span><span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">{s.location}</span></div>
       <h3 className="mt-4 text-xl font-black tracking-tight text-slate-900">{s.short}</h3>
       <p className="mt-1 flex-1 text-sm leading-5 text-slate-600">{s.name}</p>
       <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-green-700"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-green-600"/>{s.type}</p>
       <span className="mt-5 flex items-center justify-between rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition group-hover:bg-green-800">Calculate My Score <span aria-hidden="true">→</span></span>
      </div>
     </PublicPageLink>)}
    </div>
    {visible.length===0 && <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><h3 className="text-lg font-bold">No schools found</h3><p className="mt-2 text-sm text-slate-600">Try the school&apos;s abbreviation or clear your filters to see all calculators.</p></div>}
    <div className="mt-6 flex flex-col justify-between gap-3 rounded-2xl bg-green-50 p-5 text-sm text-green-900 sm:flex-row sm:items-center"><p>Looking for information about another school?</p><PublicPageLink href="/schools" className="shrink-0 font-bold underline underline-offset-4">Browse the school directory →</PublicPageLink></div>
    <p className="mt-5 text-xs leading-5 text-slate-500">Scores are estimates for guidance. Each school sets its own screening rules and makes the final admission decision.</p>
   </section>
  </div>
 </main>;
}

