import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { guides } from "../../../data/guides";
import { getSiteUrl } from "../../site-url";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);

  if (!guide) {
    return {
      title: "Guide Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/guides/${guide.slug}`;

  return {
    title: guide.title,
    description: guide.summary,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.summary,
      url: canonicalUrl,
      siteName: "S.O.H CONSULTS",
    },

    twitter: {
      card: "summary",
      title: guide.title,
      description: guide.summary,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);

  if (!guide) notFound();

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#102720]">
      <header className="border-b border-[#dfe7df] bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <a href="/" className="font-black text-[#075738]">S.O.H CONSULTS</a>
          <nav aria-label="Guide navigation" className="flex flex-wrap gap-4 text-sm font-bold">
            <a href="/guides" className="hover:text-[#087245]">All Guides</a>
            <a href="/updates" className="hover:text-[#087245]">Updates</a>
            <a href="https://wa.me/2348182141088" target="_blank" rel="noopener noreferrer" className="text-[#087245]">Get Help</a>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <a href="/guides" className="text-sm font-bold text-[#087245] hover:underline">← Back to all guides</a>
        <p className="mt-8 text-xs font-black uppercase tracking-[.16em] text-[#087245]">{guide.category}</p>
        <h1 className="mt-3 break-words text-3xl font-black leading-tight sm:text-5xl">{guide.title}</h1>
        <p className="mt-5 text-base leading-7 text-[#52615a] sm:text-lg">{guide.summary}</p>

        <div className="mt-10 space-y-5">
          {guide.sections.map((section, index) => (
            <section key={section.heading} className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm sm:p-7">
              <p className="text-xs font-black text-[#087245]">STEP {index + 1}</p>
              <h2 className="mt-2 text-xl font-black sm:text-2xl">{section.heading}</h2>
              <p className="mt-3 leading-7 text-[#52615a]">{section.body}</p>
            </section>
          ))}
        </div>

        <aside className="mt-10 rounded-2xl bg-[#06452f] p-6 text-white sm:p-8">
          <h2 className="text-2xl font-black">Need admission guidance?</h2>
          <p className="mt-2 leading-7 text-[#e6f0e9]">S.O.H CONSULTS can guide you through JAMB CAPS, admission documentation and your next steps.</p>
          <a href={`https://wa.me/2348182141088?text=${encodeURIComponent(`Hello S.O.H CONSULTS, I need help with ${guide.title}.`)}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-xl bg-[#efc46e] px-5 py-3 font-black text-[#102720] hover:bg-[#ffdb8e]">Chat on WhatsApp →</a>
        </aside>
      </article>
    </main>
  );
}
