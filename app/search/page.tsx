import { listPublishedStories } from "../../lib/news-queue";
import { contentCatalogue } from "../../lib/content-catalogue";
import SearchExplorer from "../components/SearchExplorer";
import DiscoveryHeader from "../components/DiscoveryHeader";
import SiteContact from "../components/SiteContact";
export const dynamic="force-dynamic";
export default async function SearchPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const params=await searchParams;
  const initialFilters=Object.fromEntries(["q","type","sort","availability"].map(key=>[key,typeof params[key]==="string"?params[key]:undefined]));
  const stories=await listPublishedStories();
  return <main className="min-h-screen bg-gray-50 text-gray-900"><DiscoveryHeader/><section className="bg-gradient-to-br from-green-950 to-green-700 py-10 text-white"><div className="mx-auto max-w-5xl px-4"><p className="text-sm font-bold text-green-200">S.O.H CONSULTS · Your Guide. Your Success.</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">Search Everything</h1><p className="mt-3 leading-7 text-green-50">Find updates, opportunities, guides and calculators in one place.</p></div></section><SearchExplorer items={contentCatalogue(stories)} initialFilters={initialFilters}/><SiteContact/></main>;
}
