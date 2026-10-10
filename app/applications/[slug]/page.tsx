import type { Metadata, Viewport } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getStorySlug, listPublishedStories } from "../../../lib/news-queue";
import { opportunityStatus, publicOpportunities } from "../../../lib/content-catalogue";
import { applicationHref, applicationSections, applicationSlug, checklistSection, officialNoticeUrl, safeOfficialUrl } from "../../../lib/application-guide";
import { withPublicSocial } from "../../../lib/public-metadata";
import DiscoveryHeader from "../../components/DiscoveryHeader";
import ServiceEnquiry from "../../components/ServiceEnquiry";
import JsonLd from "../../components/JsonLd";
import RichText from "../../updates/[id]/RichText";
import { PRIMARY_SITE_URL } from "../../site-url";

export const dynamic = "force-dynamic";
export const viewport: Viewport = { width: "device-width", initialScale: 1, userScalable: true };
const getApplication = cache(async (slug: string) => {
  const stories = await listPublishedStories();
  const item = publicOpportunities(stories).find(item => applicationSlug(item) === slug);
  if (!item) return null;
  const story = stories.find(story => item.detailHref === `/updates/${getStorySlug(story)}`);
  return { item, story };
});
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const application = await getApplication((await params).slug);
  if (!application) return { title: "Application not found", robots: { index: false, follow: false } };
  return withPublicSocial({ title: `${application.item.programme} | Application checklist`, description: application.item.summary, alternates: { canonical: applicationHref(application.item) } });
}
export default async function ApplicationPage({ params }: { params: Promise<{ slug: string }> }) {
  const application = await getApplication((await params).slug);
  if (!application) notFound();
  const { item, story } = application;
  const state = opportunityStatus(item);
  const sections = applicationSections(story);
  const source = safeOfficialUrl(item.applicationUrl) || officialNoticeUrl(story);
  const updated = story?.updated_at && !Number.isNaN(Date.parse(story.updated_at)) ? new Date(story.updated_at).toLocaleDateString("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "long", year: "numeric" }) : null;
  const href = applicationHref(item);
  return <main className="min-h-screen bg-gray-50 text-gray-900"><DiscoveryHeader/>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Opportunities", item: `${PRIMARY_SITE_URL}/opportunities` }, { "@type": "ListItem", position: 2, name: item.programme, item: `${PRIMARY_SITE_URL}${href}` }] }}/>
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <nav aria-label="Breadcrumbs" className="mb-5 flex flex-wrap gap-2 text-sm"><a href="/opportunities" className="py-2 font-bold text-green-800">Opportunities</a><span className="py-2">/ Application checklist</span></nav>
      <header className="rounded-2xl bg-green-950 p-6 text-white sm:p-8"><p className="text-sm font-bold text-green-200">{item.institution || item.category}</p><h1 className="mt-3 break-words text-2xl font-black leading-tight sm:text-4xl">{item.programme}</h1><p className="mt-4 max-w-3xl leading-7 text-green-50">{item.summary}</p><p className="mt-4 text-sm font-bold text-green-200">Your Guide. Your Success.</p></header>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border bg-white p-5 sm:p-7"><h2 className="text-xl font-black">Before you apply</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2"><div><dt className="text-sm font-bold text-gray-500">Availability</dt><dd className="mt-1 font-black">{state}</dd></div><div><dt className="text-sm font-bold text-gray-500">Listed deadline</dt><dd className="mt-1 font-bold">{item.deadlineLabel}</dd></div><div><dt className="text-sm font-bold text-gray-500">Notice updated</dt><dd className="mt-1">{updated || "Update date not available"}</dd></div><div><dt className="text-sm font-bold text-gray-500">Official information</dt><dd className="mt-1">{source ? <a href={source} target="_blank" rel="noopener noreferrer" className="break-all font-bold text-green-800 underline">View official source ↗</a> : "Official link not supplied"}</dd></div></dl>
            <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">{state === "Closed" ? "The listed deadline has passed or this opportunity is marked closed. Confirm any reopening with the institution before paying." : state === "Coming soon" ? "This application is marked coming soon. Wait for the institution’s opening notice." : "Availability follows the published deadline. Confirm current requirements, charges and portal availability with the institution before paying."} Notice updates are not independent verification of the institution’s portal.</p>
          </section>
          {([ ["eligibility", "Who can apply", "Read the published notice and official source for eligibility. No separate eligibility checklist was supplied."], ["documents", "Documents to prepare", "No separate document list was supplied. Confirm required documents on the official portal."], ["fees", "Application fees", "A separate fee section was not supplied. Confirm the current charge with the institution; request S.O.H CONSULTS service pricing separately."] ] as const).map(([kind, title, fallback]) => {
            const matches = checklistSection(sections, kind);
            return <section key={kind} className="rounded-2xl border bg-white p-5 sm:p-7"><h2 className="text-xl font-black">{title}</h2><div className="mt-4 space-y-4 break-words text-sm leading-7 text-gray-700">{matches.length ? matches.map((section, index) => <div key={index}><RichText text={section.text}/></div>) : <p>{fallback}</p>}</div></section>;
          })}
          <section className="rounded-2xl border bg-white p-5 sm:p-7"><h2 className="text-xl font-black">Published application information</h2><div className="mt-4 space-y-6 break-words leading-7">{sections.length ? sections.map((section, index) => <div key={index}><h3 className="mb-3 font-bold"><RichText text={section.heading} heading/></h3><RichText text={section.text}/></div>) : <p>{item.description}</p>}</div>{item.detailHref ? <a href={item.detailHref} className="mt-5 inline-block min-h-11 py-3 font-bold text-green-800">Read the full original notice and attachments →</a> : null}</section>
        </div>
        <aside className="min-w-0 space-y-5">
          <ServiceEnquiry school={`${item.institution || ""} ${item.programme}`.trim()} context={`${PRIMARY_SITE_URL}${href}`}/>
          <nav aria-label="Application guidance" className="rounded-2xl border bg-white p-5"><h2 className="font-black">Useful next steps</h2><a href="/guides" className="mt-3 block min-h-11 py-3 font-bold text-green-800">Application guides →</a><a href="/screening-calculator" className="block min-h-11 py-3 font-bold text-green-800">Choose your screening calculator →</a><a href="/my-school" className="block min-h-11 py-3 font-bold text-green-800">Set up your school feed →</a></nav>
        </aside>
      </div>
    </div>
  </main>;
}
