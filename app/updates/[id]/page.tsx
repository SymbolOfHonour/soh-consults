import { notFound } from "next/navigation";
import { updates } from "../../../data/updates";

const WHATSAPP_NUMBER = "2348182141088";

const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export default async function UpdatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const update = updates.find((item) => String(item.id) === id);

  if (!update) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center">
            <img
              src="/soh-logo.jpg"
              alt="S.O.H CONSULTS"
              className="h-14 w-auto object-contain"
            />
          </a>
          <a
            href="/#updates"
            className="rounded-full bg-green-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-800"
          >
            Back to Updates
          </a>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">
              {update.category}
            </span>
            <span className="text-sm font-semibold text-gray-500">
              {update.date}
            </span>
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-widest text-green-700">
            {update.institution}
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            {update.title}
          </h1>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            {update.summary}
          </p>

          <div className="mt-8 border-t border-gray-100 pt-8">
            <p className="whitespace-pre-line leading-8 text-gray-700">
              {update.details}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={whatsappLink(
                `Hello S.O.H CONSULTS, I need more information about: ${update.title}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-green-700 px-6 py-3 font-bold text-white hover:bg-green-800"
            >
              Get Assistance
            </a>

            <a
              href="/#updates"
              className="rounded-xl border border-green-700 px-6 py-3 font-bold text-green-700 hover:bg-green-50"
            >
              More Updates
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}
