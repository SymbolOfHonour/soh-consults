import { getSiteSettings, defaultSiteSettings } from "../../../lib/site-manager";
import SiteManagerClient from "./SiteManagerClient";

// Site Manager depends on runtime Supabase data. CI intentionally builds without
// production secrets, so never prerender this page during the production build.
export const dynamic = "force-dynamic";

export default async function SiteManagerPage() {
  let initial = defaultSiteSettings;
  try {
    initial = await getSiteSettings();
  } catch (error) {
    // Keep the admin UI reachable when the settings store is temporarily
    // unavailable. Mutations remain protected by /api/admin/site-manager.
    console.error("Unable to load Site Manager settings; using safe defaults.", error);
  }
  return <SiteManagerClient initial={initial} />;
}
