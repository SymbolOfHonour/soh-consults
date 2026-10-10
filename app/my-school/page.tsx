import type { Metadata, Viewport } from "next";
import { listPublishedStories } from "../../lib/news-queue";
import { contentCatalogue, publicOpportunities } from "../../lib/content-catalogue";
import { applicationHref } from "../../lib/application-guide";
import { schoolOptions } from "../../lib/school-feed";
import { withPublicSocial } from "../../lib/public-metadata";
import DiscoveryHeader from "../components/DiscoveryHeader";
import MySchoolFeed from "../components/MySchoolFeed";
import SiteContact from "../components/SiteContact";
export const dynamic = "force-dynamic";
export const viewport: Viewport = { width: "device-width", initialScale: 1, userScalable: true };
export const metadata: Metadata = withPublicSocial({ title: "My School | Personal education feed", description: "Choose schools and interests to find relevant educational updates, opportunities, application guides and calculators from S.O.H CONSULTS.", alternates: { canonical: "/my-school" } });
export default async function MySchoolPage() {
  const stories = await listPublishedStories();
  const opportunities = new Map(publicOpportunities(stories).map(item => [item.id, item]));
  const catalogue = contentCatalogue(stories).map(item => {
    const opportunity = opportunities.get(item.id);
    return opportunity ? { ...item, href: applicationHref(opportunity) } : item;
  });
  // Body text is only needed by global search; keep the personalised client payload small.
  const items = catalogue.map(item => ({ id: item.id, href: item.href, kind: item.kind, title: item.title, summary: item.summary, institution: item.institution, category: item.category, keywords: item.keywords, publishedAt: item.publishedAt, deadline: item.deadline, status: item.status, isOfficial: item.isOfficial }));
  return <main className="min-h-screen bg-gray-50 text-gray-900"><DiscoveryHeader/><header className="mx-auto max-w-7xl px-4 pt-8 lg:px-8"><p className="font-bold text-green-800">S.O.H CONSULTS</p><h1 className="mt-2 text-3xl font-black">My School</h1><p className="mt-3 max-w-3xl leading-7 text-gray-600">Follow the schools and topics that matter to you. Change or clear your choices at any time.</p></header><MySchoolFeed items={items} schools={schoolOptions(items)}/><SiteContact/></main>;
}
