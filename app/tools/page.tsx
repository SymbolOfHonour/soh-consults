import {withPublicSocial} from "../../lib/public-metadata";
import type {Metadata} from "next";

export const metadata:Metadata=withPublicSocial({title:"Student Tools",alternates:{canonical:"/tools"}, description:"Access S.O.H CONSULTS admission screening calculators and CGPA tools."});

const tools=[
 {href:"/screening-calculator",icon:"🎓",title:"Admission & Screening Calculators",description:"Check screening scores and eligibility with our available school calculators.",cta:"Open screening tools"},
 {href:"/cgpa-calculator",icon:"📊",title:"CGPA Calculator & Target Planner",description:"Calculate your GPA/CGPA and plan the grades you need to reach your target CGPA.",cta:"Open CGPA tools"},
];

export default function ToolsPage(){return <main className="min-h-screen bg-gray-50 pb-8 text-gray-900"><section className="bg-gradient-to-br from-green-950 to-green-700 px-4 py-8 text-white sm:py-12"><div className="mx-auto max-w-4xl"><a href="/" className="text-xs font-bold text-green-100">← Home</a><p className="mt-5 text-xs font-black uppercase tracking-[.18em] text-green-200">S.O.H CONSULTS</p><h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">Student Tools</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-green-50 sm:text-base">Choose the tool you need. Screening and CGPA tools are kept together here for quick mobile access.</p></div></section><section className="mx-auto grid max-w-4xl gap-4 px-4 py-5 sm:grid-cols-2 sm:py-8">{tools.map(tool=><a key={tool.href} href={tool.href} className="group flex min-h-48 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"><span className="text-3xl" aria-hidden="true">{tool.icon}</span><h2 className="mt-4 text-xl font-black leading-tight text-green-950">{tool.title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-gray-600">{tool.description}</p><span className="mt-5 inline-flex items-center font-black text-green-700">{tool.cta} →</span></a>)}</section></main>}
