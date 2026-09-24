"use client";

import { useState } from "react";
import { getUpdateSlug, opportunities, updates } from "../../data/updates";
import SiteContact from "../components/SiteContact";

const WHATSAPP_NUMBER = "2348182141088";

const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const opportunityCategories = ["All", "Scholarships", "Universities", "Polytechnics", "Colleges", "Other"];

export default function OpportunitiesPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const updateOpportunities = updates
    .filter((item) => item.isOpportunity)
    .map((item) => ({
      institution: item.institution,
      programme: item.opportunityProgramme || item.title,
      category: item.opportunityCategory || "Other",
      status: item.opportunityStatus || "OPEN",
      deadline: item.opportunityDeadline || "Check latest deadline",
      description: item.summary,
      updateId: item.id,
      updateSlug: getUpdateSlug(item),
      applicationUrl: item.sourceUrl,
    }));

  const baseOpportunities = opportunities.map((item) => ({
    ...item,
    updateId: null as number | null,
    updateSlug: null as string | null,
    applicationUrl: undefined as string | undefined,
  }));

  const allOpportunities = [...updateOpportunities, ...baseOpportunities];

  const filteredOpportunities =
    activeCategory === "All"
      ? allOpportunities
      : allOpportunities.filter((item) => item.category === activeCategory);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-16 w-auto object-contain" />
          </a>

          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
            <a href="/" className="transition hover:text-green-700">Home</a>
            <a href="/updates" className="transition hover:text-green-700">Latest Updates</a>
            <a href="/opportunities" className="text-green-700">Opportunities</a>
            <a href="/deadlines" className="transition hover:text-green-700">Deadlines</a>
            <a href="/guides" className="transition hover:text-green-700">Guides</a>
            <a href="/screening-calculator" className="transition hover:text-green-700">Screening Calculator</a>
          </nav>

          <a
            href={whatsappLink("Hello S.O.H CONSULTS, I need admission guidance. Please assist me.")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
          >
            Get Guidance
          </a>
        </div>
      </header>

      <section className="bg-gradient-to-br from-green-950 via-green-900 to-green-700 py-16 text-white">
        <div className="mx-auto max-w-5xl px-5 text-center lg:px-8">
          <p className="font-bold uppercase tracking-widest text-green-300">S.O.H CONSULTS</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Admission Opportunities</h1>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-green-50">
            Explore current admission opportunities across universities, polytechnics, colleges and other programmes.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {opportunityCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  activeCategory === category
                    ? "bg-green-700 text-white"
                    : "bg-white text-gray-700 shadow-sm hover:bg-green-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOpportunities.map((item) => (
              <article key={`${item.institution}-${item.programme}`} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="border-b border-gray-100 bg-white p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-green-700">{item.category}</p>
                      <h2 className="mt-2 text-xl font-black">{item.institution}</h2>
                    </div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">{item.status}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-black">{item.programme}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>

                  <div className="mt-5 rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Deadline</p>
                    <p className="mt-1 font-bold text-gray-900">{item.deadline}</p>
                  </div>

                  {item.updateId && (
                    <a href={`/updates/${item.updateSlug}`} className="mt-5 block rounded-xl border border-green-700 px-4 py-3 text-center text-sm font-black text-green-700 transition hover:bg-green-50">
                      View Full Details
                    </a>
                  )}

                  <div className="mt-3 flex gap-3">
                    <a
                      href={item.applicationUrl || whatsappLink(`Hello S.O.H CONSULTS, I am interested in the ${item.institution} ${item.programme} opportunity. Please guide me on the application process.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-xl bg-green-700 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-green-800"
                    >
                      Apply Now
                    </a>

                    <a
                      href={whatsappLink(`Hello S.O.H CONSULTS, I need guidance about the ${item.institution} ${item.programme} opportunity.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-green-700 px-4 py-3 text-center text-sm font-bold text-green-700 transition hover:bg-green-50"
                    >
                      Guidance
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    <SiteContact />

    </main>
  );
}
