"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { updates } from "../data/updates";
import { opportunities } from "../data/opportunities";

const WHATSAPP_NUMBER = "2348182141088";

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function Home() {
  const [opportunitySearch, setOpportunitySearch] = useState("");
  const [opportunityCategory, setOpportunityCategory] = useState("All");
  const [opportunityStatus, setOpportunityStatus] = useState("All");
  const [updateCategory, setUpdateCategory] = useState("All");

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      const search = opportunitySearch.toLowerCase();

      const matchesSearch =
        item.institution.toLowerCase().includes(search) ||
        item.programme.toLowerCase().includes(search);

      const matchesCategory =
        opportunityCategory === "All" ||
        item.category === opportunityCategory;

      const matchesStatus =
        opportunityStatus === "All" ||
        item.status === opportunityStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [opportunitySearch, opportunityCategory, opportunityStatus]);

  const filteredUpdates = useMemo(() => {
    return updates.filter(
      (item) =>
        updateCategory === "All" ||
        item.category === updateCategory
    );
  }, [updateCategory]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-green-700 text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">

          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="S.O.H CONSULTS"
              className="h-12 w-12 rounded-full bg-white object-contain p-1"
            />

            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                S.O.H CONSULTS
              </h1>

              <p className="text-xs text-green-100">
                Your Guide. Your Success.
              </p>
            </div>
          </Link>

          <a
            href={whatsappLink(
              "Hello S.O.H CONSULTS, I need assistance."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-50"
          >
            WhatsApp Us
          </a>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-green-700 px-4 pb-16 pt-12 text-white sm:px-6 lg:pb-20 lg:pt-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">

          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-green-200">
              Your Guide. Your Success.
            </p>

            <h2 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
              Your trusted guide for admissions and educational opportunities.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-green-50 sm:text-lg">
              Get reliable admission guidance, registration support,
              educational updates and consultation from S.O.H CONSULTS.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

              <a
                href="#opportunities"
                className="rounded-xl bg-white px-6 py-3 text-center text-sm font-bold text-green-700 hover:bg-green-50"
              >
                Explore Opportunities
              </a>

              <Link
                href="/lasu-calculator"
                className="rounded-xl bg-white px-6 py-3 text-center text-sm font-bold text-green-700 hover:bg-green-50"
              >
                LASU Aggregate Calculator
              </Link>

              <a
                href={whatsappLink(
                  "Hello S.O.H CONSULTS, I need admission guidance."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border-2 border-white px-6 py-3 text-center text-sm font-bold text-white hover:bg-white hover:text-green-700"
              >
                Get Guidance
              </a>

            </div>
          </div>

          <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-sm">
            <div className="rounded-2xl bg-white p-6 text-gray-900 shadow-xl">

              <h3 className="text-xl font-bold">
                Need admission assistance?
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                From registration to admission guidance, we help you
                understand the process and take the right steps.
              </p>

              <a
                href={whatsappLink(
                  "Hello S.O.H CONSULTS, I need help with my admission."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block rounded-xl bg-green-700 px-5 py-3 text-center text-sm font-bold text-white hover:bg-green-800"
              >
                Chat with S.O.H CONSULTS
              </a>

            </div>
          </div>

        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">

          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Our Services
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            How We Can Help
          </h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {[
              {
                title: "Admission Registration",
                text: "Get assistance with Post-UTME, admission forms and other applications.",
              },
              {
                title: "JAMB Services",
                text: "Support with JAMB-related services, CAPS and admission processes.",
              },
              {
                title: "Admission Guidance",
                text: "Understand your options and make informed admission decisions.",
              },
              {
                title: "Educational Consultation",
                text: "Get guidance on programmes, institutions and educational opportunities.",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
              >
                <h3 className="text-lg font-bold">
                  {service.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {service.text}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ADMISSION OPPORTUNITIES */}
      <section
        id="opportunities"
        className="bg-white px-4 py-14 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">

          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Admission Opportunities
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            Available Opportunities
          </h2>

          <p className="mt-3 max-w-2xl text-gray-600">
            Explore current admission opportunities from universities,
            polytechnics, colleges and other institutions.
          </p>

          {/* FILTERS */}
          <div className="mb-8 mt-8 grid gap-4 md:grid-cols-3">

            <input
              type="text"
              placeholder="Search institution or programme..."
              value={opportunitySearch}
              onChange={(e) =>
                setOpportunitySearch(e.target.value)
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <select
              value={opportunityCategory}
              onChange={(e) =>
                setOpportunityCategory(e.target.value)
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="All">All Categories</option>
              <option value="University">Universities</option>
              <option value="Polytechnic">Polytechnics</option>
              <option value="College">Colleges</option>
              <option value="Other">Other Opportunities</option>
            </select>

            <select
              value={opportunityStatus}
              onChange={(e) =>
                setOpportunityStatus(e.target.value)
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="All">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="CLOSING SOON">Closing Soon</option>
              <option value="EXTENDED">Extended</option>
              <option value="COMING SOON">Coming Soon</option>
              <option value="CLOSED">Closed</option>
            </select>

          </div>

          {/* OPPORTUNITY CARDS */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {filteredOpportunities.length > 0 ? (
              filteredOpportunities.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col rounded-2xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-200"
                >

                  <div className="flex items-start justify-between gap-3">

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                      {item.category}
                    </span>

                    <span className="rounded-full bg-green-700 px-3 py-1 text-xs font-bold text-white">
                      {item.status}
                    </span>

                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    {item.institution}
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-green-700">
                    {item.programme}
                  </p>

                  <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>

                  <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-gray-200">

                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Deadline
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {item.deadline || "Check official portal"}
                    </p>

                  </div>

                  <div className="mt-5 flex flex-col gap-3">

                    <Link
                      href={`/opportunities/${item.id}`}
                      className="rounded-xl bg-green-700 px-5 py-3 text-center text-sm font-bold text-white hover:bg-green-800"
                    >
                      View Opportunity
                    </Link>

                    <a
                      href={whatsappLink(
                        `Hello S.O.H CONSULTS, I need guidance about ${item.institution} - ${item.programme}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border-2 border-green-700 px-5 py-3 text-center text-sm font-bold text-green-700 hover:bg-green-50"
                    >
                      Get Guidance
                    </a>

                    {item.applicationUrl && (
                      <a
                        href={item.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center text-sm font-bold text-green-700 hover:text-green-900"
                      >
                        Official Application / Source →
                      </a>
                    )}

                  </div>

                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl bg-gray-50 p-10 text-center ring-1 ring-gray-200">

                <h3 className="text-lg font-bold">
                  No opportunities found
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  Try changing your search or filter options.
                </p>

              </div>
            )}

          </div>

        </div>
      </section>

      {/* LATEST UPDATES */}
      <section id="updates" className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">

          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                Latest Updates
              </p>

              <h2 className="mt-2 text-3xl font-extrabold">
                Stay Informed
              </h2>

              <p className="mt-3 max-w-2xl text-gray-600">
                Follow the latest admission, JAMB and school updates.
              </p>
            </div>

            <Link
              href="/update"
              className="rounded-xl bg-green-700 px-5 py-3 text-center text-sm font-bold text-white hover:bg-green-800"
            >
              View All Updates
            </Link>

          </div>

          {/* UPDATE FILTERS */}
          <div className="mb-8 flex flex-wrap gap-2">

            {[
              "All",
              "JAMB",
              "Admission List",
              "Admission",
              "School News",
              "Deadline",
            ].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setUpdateCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  updateCategory === category
                    ? "bg-green-700 text-white"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                {category}
              </button>
            ))}

          </div>

          {/* UPDATE CARDS */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {filteredUpdates.slice(0, 6).map((item) => (
              <article
                key={item.id}
                className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
              >

                <div className="flex items-center justify-between gap-3">

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-800">
                    {item.category}
                  </span>

                  <span className="text-xs text-gray-500">
                    {item.date}
                  </span>

                </div>

                <h3 className="mt-5 text-xl font-bold leading-7">
                  {item.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
                  {item.summary}
                </p>

                <Link
                  href={`/update/${item.id}`}
                  className="mt-5 rounded-lg bg-green-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-green-800"
                >
                  Read Full Update →
                </Link>

              </article>
            ))}

          </div>

        </div>
      </section>

      {/* WHY US */}
      <section className="bg-green-50 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">

          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Why S.O.H CONSULTS
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            Guidance You Can Trust
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">

            {[
              {
                title: "Reliable Information",
                text: "We help you stay informed with relevant admission and educational updates.",
              },
              {
                title: "Practical Guidance",
                text: "Get clear guidance on registration, admission processes and next steps.",
              },
              {
                title: "Student Focused",
                text: "Our goal is to make educational processes easier to understand and navigate.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-green-100"
              >

                <h3 className="text-lg font-bold">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {item.text}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            About S.O.H CONSULTS
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            Your Guide. Your Success.
          </h2>

          <p className="mt-5 leading-8 text-gray-600">
            S.O.H CONSULTS provides admission guidance, educational
            consultation, registration support and useful updates to help
            applicants and students make informed decisions throughout
            their educational journey.
          </p>

        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="bg-green-700 px-4 py-14 text-white sm:px-6"
      >
        <div className="mx-auto max-w-5xl text-center">

          <p className="text-sm font-bold uppercase tracking-wide text-green-200">
            Need Help?
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            Speak With S.O.H CONSULTS
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-green-50">
            Need help with admission registration, school forms,
            JAMB services or educational guidance?
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

            <a
              href={whatsappLink(
                "Hello S.O.H CONSULTS, I need assistance."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-green-700 hover:bg-green-50"
            >
              WhatsApp: 0818 214 1088
            </a>

            <a
              href="mailto:Oluyepeadetayo@gmail.com"
              className="rounded-xl border-2 border-white px-6 py-3 text-sm font-bold text-white hover:bg-white hover:text-green-700"
            >
              Email Us
            </a>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-900 px-4 py-8 text-center text-sm text-green-100">

        <p className="font-semibold text-white">
          S.O.H CONSULTS
        </p>

        <p className="mt-1">
          Your Guide. Your Success.
        </p>

        <p className="mt-4">
          WhatsApp: 0818 214 1088
        </p>

        <p className="mt-1">
          Email: Oluyepeadetayo@gmail.com
        </p>

        <p className="mt-4">
          © {new Date().getFullYear()} S.O.H CONSULTS. All rights reserved.
        </p>

      </footer>

    </main>
  );
}