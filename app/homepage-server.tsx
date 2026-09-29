import CmsHomepage from "../components/CmsHomepage";
import { defaultSiteSettings, getSiteSettings } from "../lib/site-manager";

export const dynamic = "force-dynamic";

export default async function HomepageServer(){
  let settings=defaultSiteSettings;
  try { settings=await getSiteSettings(); }
  catch(error){ console.error("Unable to load published CMS settings; using safe defaults.",error); }
  return <CmsHomepage settings={settings}/>;
}
