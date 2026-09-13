"use client";

import { useParams } from "next/navigation";
import { updates } from "../../../data/updates";
import SiteContact from "../../components/SiteContact";

const WHATSAPP_NUMBER = "2348182141088";

const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export default function UpdateDetailsPage() {
  const params = useParams();
  const id = Number(params.id);

  const update = updates.find((item) => item.id === id);

  if (!update) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
            <a href="/" className="flex items-center gap-3">
              <img
                src="/soh-logo.jpg"
                alt="S.O.H CONSULTS"
                className="h-16 w-auto object-contain"
              />
            </a>

            <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
              <a href="/" className="transition hover:text-green-700">
                Home
              </a>
              <a href="/updates" className="text-green-700">
                Latest Updates
              </a>
              <a
                href="/opportunities"
                className="transition hover:text-green-700"
              >
                Opportunities
              </a>
              <a
                href="/lasu-calculator"
                className="transition hover:text-green-700"
              >
                LASU Calculator
              </a>
            </nav>

            <a
              href={whatsappLink(
                "Hello S.O.H CONSULTS, I need assistance with an admission or educational service."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
              style={{ color: "#ffffff" }}
            >
              WhatsApp Us
            </a>
          </div>
        </header>

        <section className="py-24">
          <div className="mx-auto max-w-3xl px-5 text-center lg:px-8">
            <p className="text-sm font-black uppercase tracking-widest text-green-700">
              S.O.H CONSULTS
            </p>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl">
              Update Not Found
            </h1>
            <p className="mt-4 leading-7 text-gray-600">
              The update you are looking for may have been moved or is no longer
              available.
            </p>

            <a
              href="/updates"
              className="mt-8 inline-flex rounded-xl bg-green-700 px-6 py-3 font-black text-white transition hover:bg-green-800"
              style={{ color: "#ffffff" }}
            >
              Back to Latest Updates
            </a>
          </div>
        </section>

        <SiteContact />
      </main>
    );
  }

  const detailSections = update.details
    .split("\n\n")
    .map((section) => section.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/soh-logo.jpg"
              alt="S.O.H CONSULTS"
              className="h-16 w-auto object-contain"
            />
          </a>

          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
            <a href="/" className="transition hover:text-green-700">
              Home
            </a>
            <a href="/updates" className="text-green-700">
              Latest Updates
            </a>
            <a
              href="/opportunities"
              className="transition hover:text-green-700"
            >
              Opportunities
            </a>
            <a
              href="/lasu-calculator"
              className="transition hover:text-green-700"
            >
              LASU Calculator
            </a>
          </nav>

          <a
            href={whatsappLink(
              "Hello S.O.H CONSULTS, I need assistance with an admission or educational service."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
            style={{ color: "#ffffff" }}
          >
            WhatsApp Us
          </a>
        </div>
      </header>

      <section className="bg-gradient-to-br from-green-950 via-green-900 to-green-700 py-14 text-white sm:py-16">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <a
            href="/updates"
            className="inline-flex items-center text-sm font-bold text-green-100 transition hover:text-white"
            style={{ color: "#dcfce7" }}
          >
            ← Back to Latest Updates
          </a>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white">
              {update.category}
            </span>
            <span className="text-sm font-semibold text-green-100">
              {update.institution}
            </span>
            <span className="text-sm font-semibold text-green-100">
              {update.date}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            {update.title}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-green-50 sm:text-lg">
            {update.summary}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="space-y-5">
              {detailSections.map((section, index) => {
                const isHeading =
                  section === section.toUpperCase() &&
                  section.length <= 80 &&
                  !section.includes("“") &&
                  !section.includes('"');

                if (isHeading) {
                  return (
                    <h2
                      key={index}
                      className="pt-3 text-xl font-black text-gray-900 sm:text-2xl"
                    >
                      {section}
                    </h2>
                  );
                }

                return (
                  <p
                    key={index}
                    className="whitespace-pre-line text-[15px] leading-8 text-gray-700 sm:text-base"
                  >
                    {section}
                  </p>
                );
              })}
            </div>

            {(update.source || update.sourceUrl) && (
              <div className="mt-10 border-t border-gray-200 pt-6">
                <p className="text-sm font-bold text-gray-500">Source</p>

                {update.sourceUrl ? (
                  <a
                    href={update.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex font-black text-green-700 hover:text-green-900"
                  >
                    {update.source || "View original source"} →
                  </a>
                ) : (
                  <p className="mt-2 font-semibold text-gray-700">
                    {update.source}
                  </p>
                )}
              </div>
            )}

            <div className="mt-10 rounded-2xl bg-green-50 p-5 sm:p-6">
              <h3 className="text-lg font-black text-gray-900">
                Need clarification or admission guidance?
              </h3>
              <p className="mt-2 leading-7 text-gray-700">
                Contact S.O.H CONSULTS and tell us what you need help with.
              </p>

              <a
                href={whatsappLink(
                  `Hello S.O.H CONSULTS, I need clarification about this update: ${update.title}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white transition hover:bg-green-800"
                style={{ color: "#ffffff" }}
              >
                Ask on WhatsApp
              </a>
            </div>

            <div className="mt-8">
              <a
                href="/updates"
                className="inline-flex items-center font-black text-green-700 transition hover:text-green-900"
              >
                ← View All Latest Updates
              </a>
            </div>
          </article>
        </div>
      </section>

      <SiteContact />
    </main>
  );
}
