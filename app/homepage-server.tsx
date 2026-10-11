import {getStorySlug,listPublishedStories} from "../lib/news-queue";
import {newestContent, storyDiscovery, publicOpportunities} from "../lib/content-catalogue";
import DiscoveryHighlights from "./components/DiscoveryHighlights";
import EducationDiscoveryPanels from "./components/EducationDiscoveryPanels";
import HomepageSchoolPreferences from "./components/HomepageSchoolPreferences";
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
  return <><LegacyHomepageSectionRedirect/><CmsHomepage settings={settings} initialUpdates={initialUpdates} discoveryHighlights={<><DiscoveryHighlights items={[...stories.map(storyDiscovery),...publicOpportunities(stories)]}/><EducationDiscoveryPanels items={[...stories.map(storyDiscovery),...publicOpportunities(stories)]}/><HomepageSchoolPreferences/></>}/></>;
}
