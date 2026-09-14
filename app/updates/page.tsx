"use client";

import { useState } from "react";
import { getUpdateImage, updates } from "../../data/updates";
import SiteContact from "../components/SiteContact";

const WHATSAPP_NUMBER = "2348182141088";

const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const updateCategories = ["All", "JAMB", "Admission List", "Admission"];

export default function UpdatesPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredUpdates =
    activeCategory === "All"
      ? updates
      : updates.filter((item) => item.category === activeCategory);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-16 w-auto object-contain" />
          </a>

          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
            <a href="/" className="transition hover:text-green-700">Home</a>
            <a href="/updates" className="text-green-700">Latest Updates</a>
            <a href="/opportunities" className="transition hover:text-green-700">Opportunities</a>
            <a href="/deadlines" className="transition hover:text-green-700">Deadlines</a>
            <a href="/guides" className="transition hover:text-green-700">Guides</a>
            <a href="/lasu-calculator" className="transition hover:text-green-700">LASU Calculator</a>
          </nav>

          <a
            href={whatsappLink("Hello S.O.H CONSULTS, I need assistance with an admission or educational service.")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
          >
            WhatsApp Us
          </a>
        </div>
      </header>

      <section className="bg-gradient-to-br from-green-950 via-green-900 to-green-700 py-16 text-white">
        <div className="mx-auto max-w-5xl px-5 text-center lg:px-8">
          <p className="font-bold uppercase tracking-widest text-green-300">S.O.H CONSULTS</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Latest Updates</h1>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-green-50">
            Important admission, JAMB and education updates simplified for students and applicants.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {updateCategories.map((category) => (
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

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {filteredUpdates.map((item) => (
              <article key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                {getUpdateImage(item) && (
                  <img src={getUpdateImage(item)} alt={item.title} className="h-52 w-full object-cover" />
                )}
                <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">{item.category}</span>
                  <span className="text-xs font-semibold text-gray-500">{item.date}</span>
                </div>

                <h2 className="mt-4 text-xl font-black">{item.title}</h2>
                <p className="mt-3 flex-1 leading-7 text-gray-600">{item.summary}</p>

                <a href={`/updates/${item.id}`} className="mt-6 inline-flex items-center font-black text-green-700 hover:text-green-900">
                  Read Full Update →
                </a>
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