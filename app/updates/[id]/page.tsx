import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { findUpdateBySlug, getUpdateImage, getUpdateReadingTime, getUpdateSlug, updates } from "../../../data/updates";
import ShareButtons from "../../components/ShareButtons";
import SiteContact from "../../components/SiteContact";
import UpdateComments from "../../components/UpdateComments";
import { getSiteUrl } from "../../site-url";

const whatsappLink = (message: string) => `https://wa.me/2348182141088?text=${encodeURIComponent(message)}`;
type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return updates.map((update) => ({ id: getUpdateSlug(update) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const update = findUpdateBySlug(id);
  if (!update) return { title: "Update Not Found" };
  const slug = getUpdateSlug(update);
  const image = getUpdateImage(update) || "/soh-logo.jpg";
  return {
    title: update.title,
    description: update.summary,
    alternates: { canonical: `/updates/${slug}` },
    openGraph: { type: "article", title: update.title, description: update.summary, url: `/updates/${slug}`, images: [{ url: image, alt: update.title }] },
    twitter: { card: "summary_large_image", title: update.title, description: update.summary, images: [image] },
  };
}

function ArticleBody({ details }: { details: string }) {
  return details.split("\n\n").map((part) => part.trim()).filter(Boolean).map((section, index) => {
    const heading = section === section.toUpperCase() && section.length <= 80 && !section.includes("“") && !section.includes('"');
    return heading
      ? <h2 key={index} className="pt-4 text-xl font-black text-gray-950 sm:text-2xl">{section}</h2>
      : <p key={index} className="whitespace-pre-line text-[15px] leading-8 text-gray-700 sm:text-base">{section}</p>;
  });
}

export default async function UpdateDetailsPage({ params }: Props) {
  const { id } = await params;
  const update = findUpdateBySlug(id);
  if (!update) notFound();
  const slug = getUpdateSlug(update);
  if (id !== slug) permanentRedirect(`/updates/${slug}`);

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/updates/${slug}`;
  const image = getUpdateImage(update);
  const related = updates.filter((item) => item.id !== update.id && (item.category === update.category || item.institution === update.institution)).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "NewsArticle", headline: update.title,
    description: update.summary, datePublished: update.date, mainEntityOfPage: pageUrl,
    image: [`${siteUrl}${image || "/soh-logo.jpg"}`], author: { "@type": "Organization", name: "S.O.H CONSULTS" },
    publisher: { "@type": "Organization", name: "S.O.H CONSULTS", logo: { "@type": "ImageObject", url: `${siteUrl}/soh-logo.jpg` } },
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/"><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-16 w-auto object-contain" /></a>
          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex"><a href="/">Home</a><a href="/updates" className="text-green-700">Updates</a><a href="/opportunities">Opportunities</a><a href="/guides">Guides</a><a href="/lasu-calculator">LASU Calculator</a></nav>
          <a href={whatsappLink("Hello S.O.H CONSULTS, I need admission assistance.")} target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white">WhatsApp Us</a>
        </div>
      </header>

      <section className="bg-gradient-to-br from-green-950 via-green-900 to-green-700 py-14 text-white sm:py-16">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <a href="/updates" className="text-sm font-bold text-green-100">← Back to Latest Updates</a>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm font-semibold text-green-100">
            <a href={`/updates/category/${update.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="rounded-full bg-white/15 px-3 py-1 font-black text-white">{update.category}</a>
            <span>{update.institution}</span><span>·</span><time>{update.date}</time><span>·</span><span>{getUpdateReadingTime(update)} min read</span>
          </div>
          <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{update.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-green-50 sm:text-lg">{update.summary}</p>
        </div>
      </section>

      <section className="py-12 sm:py-16"><div className="mx-auto max-w-4xl px-5 lg:px-8">
        {image && <div className="mb-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"><img src={image} alt={update.title} className="h-auto w-full object-cover" /></div>}
        <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="space-y-5"><ArticleBody details={update.details} /></div>
          <div className="mt-10 rounded-2xl bg-green-50 p-6"><p className="text-xs font-black uppercase tracking-widest text-green-700">S.O.H CONSULTS</p><h2 className="mt-2 text-xl font-black">Need help with this admission process?</h2><p className="mt-2 leading-7 text-gray-700">Get clear, personal guidance and registration assistance directly on WhatsApp.</p><a href={whatsappLink(`Hello S.O.H CONSULTS, I need help with: ${update.title}`)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white">Get Assistance</a></div>
          {(update.source || update.sourceUrl) && <div className="mt-10 border-t border-gray-200 pt-6"><p className="text-sm font-bold text-gray-500">Official source</p>{update.sourceUrl ? <a href={update.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex font-black text-green-700">{update.source || "View original source"} →</a> : <p className="mt-2 font-semibold">{update.source}</p>}</div>}
          <div className="mt-10 border-t border-gray-200 pt-7"><h2 className="mb-4 text-lg font-black">Share this update</h2><ShareButtons url={pageUrl} title={update.title} /></div>
          {related.length > 0 && <div className="mt-10 border-t border-gray-200 pt-8"><h2 className="text-xl font-black">Related Updates</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{related.map((item) => <a key={item.id} href={`/updates/${getUpdateSlug(item)}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-green-300 hover:bg-green-50"><p className="text-xs font-black uppercase tracking-wide text-green-700">{item.institution} · {item.category}</p><p className="mt-2 font-black leading-6">{item.title}</p><p className="mt-2 text-sm text-gray-600">{item.date}</p></a>)}</div></div>}
        </article>
        <UpdateComments updateId={update.id} />
      </div></section>
      <SiteContact />
    </main>
  );
}
