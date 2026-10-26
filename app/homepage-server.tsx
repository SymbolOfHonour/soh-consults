import {getStorySlug,listPublishedStories} from "../lib/news-queue";
import {newestContent} from "../lib/content-catalogue";
import BreakingNewsTicker from "./components/BreakingNewsTicker";
import HomepageDiscovery from "../components/HomepageDiscovery";
import {buildHomeDiscovery,recentArticleViews} from "../lib/homepage-discovery";
import HomepageSchoolPreferences from "./components/HomepageSchoolPreferences";
import CmsHomepage from "../components/CmsHomepage";
import LegacyHomepageSectionRedirect from "./components/LegacyHomepageSectionRedirect";
import { defaultSiteSettings, getPublishedSiteSettings } from "../lib/site-manager";

export const dynamic = "force-dynamic";

export default async function HomepageServer(){
  const viewsPromise=recentArticleViews();
  let settings=defaultSiteSettings;
  try { settings=await getPublishedSiteSettings(); }
  catch(error){ console.error("Unable to load published CMS settings; using safe defaults.",error); }
  const stories=await listPublishedStories();
  const initialUpdates=newestContent(stories.map(story=>({...story,publishedAt:story.source_published_at||story.created_at}))).slice(0,settings.latestUpdatesCount).map(story=>({id:story.id,title:story.title,summary:story.summary,category:story.category,institution:story.institution,date:new Date(story.source_published_at||story.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}),image:story.image_url,slug:getStorySlug(story),updatedAt:story.updated_at,publishedAt:story.source_published_at||story.created_at}));
  const discovery=buildHomeDiscovery(stories,await viewsPromise);
  const now = Date.now();
  const seen = new Set<string>();
  const breaking = stories
    .map(story => ({story, published: Math.max(Date.parse(String(story.source_published_at || "")) || 0, Date.parse(String(story.created_at || "")) || 0)}))
    .filter(({published}) => published > 0 && published <= now && now - published <= 72 * 60 * 60 * 1000)
    .sort((a,b) => b.published - a.published)
    .filter(({story}) => {const slug = getStorySlug(story); if (seen.has(slug)) return false; seen.add(slug); return true;})
    .slice(0,10).map(({story}) => ({title:story.title,href:`/updates/${getStorySlug(story)}`}));
  return <><LegacyHomepageSectionRedirect/><CmsHomepage settings={settings} initialUpdates={initialUpdates} discoveryHighlights={<BreakingNewsTicker stories={breaking}/>} afterUpdates={<><HomepageDiscovery data={discovery}/><HomepageSchoolPreferences/></>}/></>;
}
