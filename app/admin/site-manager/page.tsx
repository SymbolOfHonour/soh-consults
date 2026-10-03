import { redirect } from "next/navigation";
import { isAdmin } from "../../../lib/admin-auth";
import { getSiteSettings, defaultSiteSettings } from "../../../lib/site-manager";
import SiteManagerClient from "./SiteManagerClient";
import PublishControls from "./PublishControls";

export const dynamic = "force-dynamic";

export default async function SiteManagerPage() {
  if (!(await isAdmin())) redirect("/admin/updates");
  let initial = defaultSiteSettings;
  try { initial = await getSiteSettings(); }
  catch (error) { console.error("Unable to load Site Manager settings; using safe defaults.", error); }
  return <><SiteManagerClient initial={initial}/><PublishControls/></>;
}
