import Link from "next/link";
import { notFound } from "next/navigation";
import { opportunities } from "../../../data/opportunities";

const WHATSAPP_NUMBER = "2348182141088";

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

type OpportunityPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OpportunityPage({
  params,
}: OpportunityPageProps) {
  const { id } = await params;

  const opportunity = opportunities.find(
    (item) => item.id === Number(id)
  );

  if (!opportunity) {
    notFound();
  }

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

      {/* CONTENT */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">

          <Link
            href="/"
            className="text-sm font-bold text-green-700 hover:text-green-900"
          >
            ← Back to Opportunities
          </Link>

          <article className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-10">

            <div className="flex flex-wrap items-center gap-3">

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                {opportunity.category}
              </span>

              <span className="rounded-full bg-green-700 px-3 py-1 text-xs font-bold text-white">
                {opportunity.status}
              </span>

            </div>

            <h2 className="mt-6 text-3xl font-extrabold leading-tight sm:text-4xl">
              {opportunity.institution}
            </h2>

            <p className="mt-3 text-lg font-bold text-green-700">
              {opportunity.programme}
            </p>

            {/* DEADLINE */}
            <div className="mt-8 rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-200">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Deadline
              </p>

              <p className="mt-2 text-lg font-bold">
                {opportunity.deadline || "Check official portal"}
              </p>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-8">
              <h3 className="text-xl font-bold">
                About This Opportunity
              </h3>

              <p className="mt-4 leading-8 text-gray-600">
                {opportunity.description}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              {opportunity.applicationUrl && (
                <a
                  href={opportunity.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-green-700 px-6 py-3 text-center text-sm font-bold text-white hover:bg-green-800"
                >
                  Visit Official Application
                </a>
              )}

              <a
                href={whatsappLink(
                  `Hello S.O.H CONSULTS, I need guidance about ${opportunity.institution} - ${opportunity.programme}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border-2 border-green-700 px-6 py-3 text-center text-sm font-bold text-green-700 hover:bg-green-50"
              >
                Get Guidance
              </a>

            </div>

          </article>

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