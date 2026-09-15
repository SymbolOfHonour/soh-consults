import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedStory } from "../../../../lib/news-queue";
import ShareButtons from "../../../components/ShareButtons";
import SiteContact from "../../../components/SiteContact";
import { getSiteUrl } from "../../../site-url";

type Props = { params: Promise<{ id: string }> };
const whatsappLink = (message: string) => `https://wa.me/2348182141088?text=${encodeURIComponent(message)}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = await getPublishedStory((await params).id);
  if (!story) return { title: "Update Not Found" };
  return { title: story.title, description: story.summary, robots: { index: true, follow: true } };
}

function Body({ value }: { value: string }) {
  return value.split("\n\n").map(part => part.trim()).filter(Boolean).map((part, index) => {
    const heading = part === part.toUpperCase() && part.length <= 80;
    return heading ? <h2 key={index} className="pt-4 text-xl font-black">{part}</h2> : <p key={index} className="whitespace-pre-line leading-8 text-gray-700">{part}</p>;
  });
}

export default async function ImportedUpdatePage({ params }: Props) {
  const story = await getPublishedStory((await params).id);
  if (!story) notFound();
  const pageUrl = `${getSiteUrl()}/updates/imported/${story.id}`;
  return <main className="min-h-screen bg-gray-50 text-gray-900"><header className="border-b bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><a href="/"><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-16 w-auto" /></a><a href={whatsappLink(`Hello S.O.H CONSULTS, I need help with: ${story.title}`)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-700 px-5 py-3 text-sm font-black text-white">WhatsApp Us</a></div></header><section className="bg-gradient-to-br from-green-950 to-green-700 py-14 text-white"><div className="mx-auto max-w-4xl px-5"><a href="/updates" className="text-sm font-bold text-green-100">← Back to Latest Updates</a><p className="mt-6 text-sm font-black text-green-200">{story.category} · {story.institution}</p><h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">{story.title}</h1><p className="mt-5 max-w-3xl leading-8 text-green-50">{story.summary}</p></div></section><section className="py-12"><div className="mx-auto max-w-4xl px-5">{story.image_url && <img src={story.image_url} alt={story.title} className="mb-8 max-h-[560px] w-full rounded-3xl border bg-white object-cover shadow-sm" />}<article className="rounded-3xl border bg-white p-6 shadow-sm sm:p-10"><div className="space-y-5"><Body value={story.details} /></div>{story.deadline && <div className="mt-8 rounded-2xl bg-amber-50 p-5"><p className="text-xs font-black uppercase text-amber-800">Application deadline</p><p className="mt-2 text-lg font-black">{story.deadline}</p></div>}{story.document_url && <a href={story.document_url} target="_blank" rel="noopener noreferrer" className="mt-8 flex w-full items-center justify-center rounded-2xl border-2 border-green-700 px-6 py-4 text-center font-black text-green-700">View or Download {story.document_name || "Supporting Document"} →</a>}<div className="mt-8 rounded-2xl bg-green-50 p-6"><h2 className="text-xl font-black">Need registration assistance?</h2><a href={whatsappLink(`Hello S.O.H CONSULTS, I need assistance with: ${story.title}`)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-xl bg-green-700 px-5 py-3 font-black text-white">Chat on WhatsApp</a></div>{story.official_source_name && <div className="mt-8 border-t pt-6"><p className="text-sm font-bold text-gray-500">Official source</p>{story.official_source_url ? <a href={story.official_source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex font-black text-green-700">{story.official_source_name} →</a> : <p className="mt-2 font-black text-green-700">{story.official_source_name}</p>}</div>}<div className="mt-8 border-t pt-6"><ShareButtons url={pageUrl} title={story.title} /></div></article></div></section><SiteContact /></main>;
}
