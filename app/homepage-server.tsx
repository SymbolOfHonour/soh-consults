import CmsHomepage from "../components/CmsHomepage";
import { defaultSections, defaultSiteSettings, getPublishedSiteSettings } from "../lib/site-manager";

export const dynamic = "force-dynamic";

function restoreRequiredHomepageSections(settings: typeof defaultSiteSettings) {
  const sections = [...(settings.sections || [])];
  const requiredTypes = ["hero", "updates"] as const;

  for (const type of requiredTypes) {
    const existingIndex = sections.findIndex(section => section.type === type);
    if (existingIndex >= 0) {
      sections[existingIndex] = {
        ...sections[existingIndex],
        visible: true,
        mobileVisible: true,
        tabletVisible: true,
        desktopVisible: true,
      };
      continue;
    }

    const fallback = defaultSections.find(section => section.type === type);
    if (!fallback) continue;

    if (type === "hero") sections.unshift({ ...fallback });
    else {
      const toolsIndex = sections.findIndex(section => section.type === "tools");
      sections.splice(toolsIndex >= 0 ? toolsIndex + 1 : Math.min(2, sections.length), 0, { ...fallback });
    }
  }

  return { ...settings, showHero: true, showLatestUpdates: true, sections };
}

export default async function HomepageServer(){
  let settings=defaultSiteSettings;
  try { settings=await getPublishedSiteSettings(); }
  catch(error){ console.error("Unable to load published CMS settings; using safe defaults.",error); }
  return <CmsHomepage settings={restoreRequiredHomepageSections(settings)}/>;
}
