import CmsHomepage from "../components/CmsHomepage";
import LegacyHomepageSectionRedirect from "./components/LegacyHomepageSectionRedirect";
import { defaultSiteSettings, getPublishedSiteSettings } from "../lib/site-manager";

export const dynamic = "force-dynamic";

export default async function HomepageServer(){
  let settings=defaultSiteSettings;
  try { settings=await getPublishedSiteSettings(); }
  catch(error){ console.error("Unable to load published CMS settings; using safe defaults.",error); }
  return <><LegacyHomepageSectionRedirect/><CmsHomepage settings={settings}/></>;
}
