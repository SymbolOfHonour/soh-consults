import {getStorySlug,listPublishedStories} from "../lib/news-queue";
import {newestContent, storyDiscovery, publicOpportunities} from "../lib/content-catalogue";
import DiscoveryHighlights from "./components/DiscoveryHighlights";
import CmsHomepage from "../components/CmsHomepage";
import LegacyHomepageSectionRedirect from "./components/LegacyHomepageSectionRedirect";
import { defaultSiteSettings, getPublishedSiteSettings } from "../lib/site-manager";

export const dynamic = "force-dynamic";

export default async function HomepageServer(){
  let settings=defaultSiteSettings;
  try { settings=await getPublishedSiteSettings(); }
  catch(error){ console.error("Unable to load published CMS settings; using safe defaults.",error); }
  const stories=await listPublishedStories();
  const initialUpdates=newestContent(stories.map(story=>({...story,publishedAt:story.source_published_at||story.created_at}))).slice(0,settings.latestUpdatesCount).map(story=>({id:story.id,title:story.title,summary:story.summary,category:story.category,institution:story.institution,date:new Date(story.source_published_at||story.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}),image:story.image_url,slug:getStorySlug(story),updatedAt:story.updated_at,publishedAt:story.source_published_at||story.created_at}));
  return <><LegacyHomepageSectionRedirect/><CmsHomepage settings={settings} initialUpdates={initialUpdates} discoveryHighlights={<><DiscoveryHighlights items={[...stories.map(storyDiscovery),...publicOpportunities(stories)]}/><section className="border-b bg-green-50"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 lg:px-8"><div><h2 className="text-xl font-black text-green-950">Your schools. Your next step.</h2><p className="mt-1 text-sm text-gray-600">Save school preferences and see relevant updates, opportunities and tools.</p></div><a href="/my-school" className="min-h-12 rounded-xl bg-green-800 px-5 py-3 font-bold text-white">Create my school feed →</a></div></section></>}/></>;
}
