import {getStorySlug,listPublishedStories} from "../lib/news-queue";
import CmsHomepage from "../components/CmsHomepage";
import { defaultSiteSettings, getPublishedSiteSettings } from "../lib/site-manager";

export const dynamic = "force-dynamic";

export default async function HomepageServer(){
  let settings=defaultSiteSettings;
  try { settings=await getPublishedSiteSettings(); }
  catch(error){ console.error("Unable to load published CMS settings; using safe defaults.",error); }
  const stories=await listPublishedStories();
  const initialUpdates=stories.slice(0,settings.latestUpdatesCount).map(story=>({id:story.id,title:story.title,summary:story.summary,category:story.category,institution:story.institution,date:new Date(story.source_published_at||story.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}),image:story.image_url,slug:getStorySlug(story),updatedAt:story.updated_at,publishedAt:story.source_published_at||story.created_at}));
  return <CmsHomepage settings={settings} initialUpdates={initialUpdates}/>;
}
