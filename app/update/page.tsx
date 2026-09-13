"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { updates } from "../../data/updates";
import { opportunities } from "../../data/opportunities";
import SiteContact from "../components/SiteContact";

const WHATSAPP_NUMBER = "2348182141088";

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function UpdatesPage() {
  const [category, setCategory] = useState("All");

  const filteredUpdates = useMemo(() => {
    return updates.filter(
      (item) => category === "All" || item.category === category
    );
  }, [category]);

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

      {/* PAGE HEADER */}
      <section className="bg-green-700 px-4 pb-14 pt-10 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">

          <p className="text-sm font-bold uppercase tracking-wide text-green-200">
            Latest Updates
          </p>

          <h2 className="mt-2 text-4xl font-extrabold">
            Admission & Educational Updates
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-green-50">
            Stay informed with the latest JAMB, admission, school and
            deadline updates from S.O.H CONSULTS.
          </p>

        </div>
      </section>

      {/* UPDATES */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">

          {/* FILTERS */}
          <div className="mb-8 flex flex-wrap gap-2">

            {[
              "All",
              "JAMB",
              "Admission List",
              "Admission",
              "School News",
              "Deadline",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  category === item
                    ? "bg-green-700 text-white"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                {item}
              </button>
            ))}

          </div>

          {/* UPDATE CARDS */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {filteredUpdates.length > 0 ? (
              filteredUpdates.map((item) => (
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

                  {item.deadline && (
                    <div className="mt-5 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                        Deadline
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {item.deadline}
                      </p>
                    </div>
                  )}

                  <Link
                    href={`/update/${item.id}`}
                    className="mt-5 rounded-xl bg-green-700 px-5 py-3 text-center text-sm font-bold text-white hover:bg-green-800"
                  >
                    Read Full Update →
                  </Link>

                </article>
              ))
            ) : (
              <div className="col-span-full rounded-2xl bg-white p-10 text-center ring-1 ring-gray-200">

                <h3 className="text-lg font-bold">
                  No updates found
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  Try selecting another category.
                </p>

              </div>
            )}

          </div>

        </div>
      </section>

      {/* GUIDANCE */}
      <section className="bg-green-50 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Need Help?
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            Need Guidance on an Update?
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            Contact S.O.H CONSULTS for assistance with admission,
            registration and educational processes.
          </p>

          <a
            href={whatsappLink(
              "Hello S.O.H CONSULTS, I need guidance about an admission update."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-xl bg-green-700 px-6 py-3 text-sm font-bold text-white hover:bg-green-800"
          >
            Chat on WhatsApp
          </a>

        </div>
      </section>

      {/* FOOTER */}
      <SiteContact />

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