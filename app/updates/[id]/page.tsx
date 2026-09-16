import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getPublishedStoryBySlug, getStorySlug, listPublishedStories } from "../../../lib/news-queue";
import { cleanGalleryDetails, getGalleryImages } from "../../../lib/story-gallery";
import ShareButtons from "../../components/ShareButtons";
import SiteContact from "../../components/SiteContact";
import { getSiteUrl } from "../../site-url";

const whatsappLink = (message: string) => `https://wa.me/2348182141088?text=${encodeURIComponent(message)}`;
type Props = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export async function generateStaticParams() { return []; }
async function resolveStory(id: string) {
  let story = await getPublishedStoryBySlug(id);
  if (!story && /^\d+$/.test(id)) {
    const stories = await listPublishedStories();
    story = stories.find(item => item.source_url.startsWith(`legacy:${id}:`)) || null;
  }
  return story;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const story = await resolveStory(id);
  if (!story) return { title: "Update Not Found" };
  const slug = getStorySlug(story), image = story.image_url || "/soh-logo.jpg";
  return { title: story.title, description: story.summary, alternates: { canonical: `/updates/${slug}` }, openGraph: { type: "article", title: story.title, description: story.summary, url: `/updates/${slug}`, images: [{ url: image, alt: story.title }] }, twitter: { card: "summary_large_image", title: story.title, description: story.summary, images: [image] } };
}
function publicDetails(value: string) {
  return cleanGalleryDetails(value).replace(/\[SOH:(?:FEATURED|BREAKING)\]\s*/gi, "").replace(/\[(?:SCHEDULE|EXPIRES):\s*[^\]]+\]\s*/gi, "").trim();
}
function Body({ value }: { value: string }) {
  return value.split("\n\n").map(p => p.trim()).filter(Boolean).map((section, index) => {
    const heading = section === section.toUpperCase() && section.length <= 80 && !section.includes("“") && !section.includes('"');
    if (heading) return <h2 key={index} className="pt-6 text-2xl font-black leading-tight text-gray-950 sm:text-3xl">{section}</h2>;
    const parts = section.split(/(https?:\/\/[^\s]+)/g);
    return <p key={index} className="whitespace-pre-line text-[19px] leading-9 text-gray-800 sm:text-xl sm:leading-10">{parts.map((part, i) => part.startsWith("http") ? <a key={i} href={part.replace(/[.,;:]$/, "")} target="_blank" rel="noopener noreferrer" className="break-all font-black text-green-700 underline decoration-green-300 underline-offset-4 hover:text-green-900">{part}</a> : part)}</p>;
  });
}
export default async function UpdateDetailsPage({ params }: Props) {
  const { id } = await params;
  const story = await resolveStory(id);
  if (!story) notFound();
  const slug = getStorySlug(story);
  if (id !== slug) permanentRedirect(`/updates/${slug}`);
  const pageUrl = `${getSiteUrl()}/updates/${slug}`;
  const gallery = [...new Set([...(story.image_url ? [story.image_url] : []), ...getGalleryImages(story.details)])].slice(0, 5);
  const body = publicDetails(story.details);
  const publishedDate = new Date(story.source_published_at || story.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return <main className="min-h-screen bg-gray-50 text-gray-900">
    <header className="border-b bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><a href="/"><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-16 w-auto" /></a><a href={whatsappLink(`Hello S.O.H CONSULTS, I need help with: ${story.title}`)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-700 px-5 py-3 text-sm font-black text-white">WhatsApp Us</a></div></header>
    <section className="bg-gradient-to-br from-green-950 to-green-700 py-14 text-white"><div className="mx-auto max-w-5xl px-5"><a href="/updates" className="text-sm font-bold text-green-100">← Back to Latest Updates</a><p className="mt-6 text-sm font-black text-green-200">{story.category} · {story.institution} · {publishedDate}</p><h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">{story.title}</h1><p className="mt-5 max-w-4xl text-xl leading-9 text-green-50">{story.summary}</p></div></section>
    <section className="py-12"><div className="mx-auto max-w-5xl px-5"><article className="rounded-3xl border bg-white p-6 shadow-sm sm:p-12">
      <div className="space-y-7"><Body value={body} /></div>
      {gallery.length > 0 && <div className={`mt-10 grid gap-4 ${gallery.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`} aria-label="Update pictures">{gallery.map((url, i) => <img key={`${url}-${i}`} src={url} alt={`${story.title} picture ${i + 1}`} className={`${i === 0 && gallery.length > 2 ? "sm:col-span-2 max-h-[650px]" : "max-h-[460px]"} w-full rounded-3xl border bg-white object-contain shadow-sm`} />)}</div>}
      {story.deadline && <div className="mt-8 rounded-2xl bg-amber-50 p-5"><p className="text-xs font-black uppercase text-amber-800">Application deadline</p><p className="mt-2 text-lg font-black">{story.deadline}</p></div>}
      {story.document_url && <a href={story.document_url} target="_blank" rel="noopener noreferrer" className="mt-8 flex w-full items-center justify-center rounded-2xl border-2 border-green-700 px-6 py-4 text-center font-black text-green-700">View or Download {story.document_name || "Supporting Document"} →</a>}
      <div className="mt-8 rounded-2xl bg-green-50 p-6"><h2 className="text-xl font-black">Need registration assistance?</h2><a href={whatsappLink(`Hello S.O.H CONSULTS, I need assistance with: ${story.title}`)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-xl bg-green-700 px-5 py-3 font-black text-white">Chat on WhatsApp</a></div>
      {story.official_source_name && <div className="mt-8 border-t pt-6"><p className="text-sm font-bold text-gray-500">Official source</p>{story.official_source_url ? <a href={story.official_source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex font-black text-green-700">{story.official_source_name} →</a> : <p className="mt-2 font-black text-green-700">{story.official_source_name}</p>}</div>}
      <div className="mt-8 border-t pt-6"><ShareButtons url={pageUrl} title={story.title} /></div>
    </article></div></section><SiteContact />
  </main>;
}
