import { listPublishedStories } from "../../lib/news-queue";
import { publicOpportunities } from "../../lib/content-catalogue";
import OpportunitiesExplorer from "../components/OpportunitiesExplorer";
import DiscoveryHeader from "../components/DiscoveryHeader";
import SiteContact from "../components/SiteContact";
export const dynamic="force-dynamic";
export default async function OpportunitiesPage(){
  const stories=await listPublishedStories();
  return <main className="min-h-screen bg-gray-50 text-gray-900"><DiscoveryHeader/><section className="bg-gradient-to-br from-green-950 to-green-700 py-10 text-white"><div className="mx-auto max-w-5xl px-4"><p className="text-sm font-bold text-green-200">S.O.H CONSULTS · Your Guide. Your Success.</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">Admission Opportunities</h1><p className="mt-3 max-w-3xl leading-7 text-green-50">Explore scholarships and admission opportunities. Check the deadline and confirm availability before applying.</p></div></section><OpportunitiesExplorer items={publicOpportunities(stories)}/><SiteContact/></main>;
}
