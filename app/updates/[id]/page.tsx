import Link from "next/link";
import { notFound } from "next/navigation";
import { updates } from "../../../data/updates";

type PageProps = {
  params: Promise<{ id: string }>;
};

const WHATSAPP_NUMBER = "2348182141088";

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  const update = updates.find((item) => item.id === Number(id));

  if (!update) {
    return {
      title: "Update Not Found | S.O.H CONSULTS",
    };
  }

  return {
    title: `${update.title} | S.O.H CONSULTS`,
    description: update.summary,
  };
}

export default async function UpdatePage({ params }: PageProps) {
  const { id } = await params;

  const update = updates.find((item) => item.id === Number(id));

  if (!update) {
    notFound();
  }

  const relatedUpdates = updates
    .filter(
      (item) =>
        item.id !== update.id &&
        item.category === update.category
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* HEADER */}
      <header className="bg-green-700 text-white shadow-md">
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

          <Link
            href="/"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
          >
            Home
          </Link>
        </div>
      </header>

      {/* ARTICLE */}
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        <Link
          href="/#updates"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900"
        >
          ← Back to Latest Updates
        </Link>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="p-6 sm:p-8 lg:p-10">
            {/* CATEGORY + DATE */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-800">
                {update.category}
              </span>

              <span className="text-sm text-gray-500">
                {update.date}
              </span>
            </div>

            {/* TITLE */}
            <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
              {update.title}
            </h1>

            {/* SUMMARY */}
            <p className="mt-5 text-lg leading-8 text-gray-600">
              {update.summary}
            </p>

            <div className="my-8 h-px bg-gray-200" />

            {/* DETAILS */}
            <div className="whitespace-pre-line text-base leading-8 text-gray-700">
              {update.details}
            </div>

            {/* DEADLINE */}
            {update.deadline && (
              <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                  Deadline / Important Date
                </p>

                <p className="mt-2 text-lg font-bold text-green-900">
                  {update.deadline}
                </p>
              </div>
            )}

            {/* BUTTONS */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {update.sourceUrl && (
                <a
                  href={update.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-green-700 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-green-800"
                >
                  Visit Official Source
                </a>
              )}

              <a
                href={whatsappLink(
                  `Hello S.O.H CONSULTS, I need guidance concerning this update: ${update.title}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border-2 border-green-700 px-6 py-3 text-center text-sm font-bold text-green-700 transition hover:bg-green-50"
              >
                Get Guidance on WhatsApp
              </a>
            </div>

            {/* SOURCE */}
            {update.source && (
              <p className="mt-6 text-sm text-gray-500">
                Source:{" "}
                <span className="font-semibold text-gray-700">
                  {update.source}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* RELATED UPDATES */}
        {relatedUpdates.length > 0 && (
          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Related Updates
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                More updates in {update.category}.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {relatedUpdates.map((item) => (
                <Link
                  key={item.id}
                  href={`/updates/${item.id}`}
                  className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="text-xs font-bold uppercase tracking-wide text-green-700">
                    {item.category}
                  </span>

                  <h3 className="mt-3 font-bold leading-6 text-gray-900 group-hover:text-green-700">
                    {item.title}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                    {item.summary}
                  </p>

                  <span className="mt-4 inline-block text-sm font-bold text-green-700">
                    Read Update →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* FOOTER */}
      <footer className="mt-12 bg-green-900 px-4 py-8 text-center text-sm text-green-100">
        <p className="font-semibold text-white">
          S.O.H CONSULTS
        </p>

        <p className="mt-1">
          Your Guide. Your Success.
        </p>

        <p className="mt-4">
          © {new Date().getFullYear()} S.O.H CONSULTS. All rights reserved.
        </p>
      </footer>
    </main>
  );
}