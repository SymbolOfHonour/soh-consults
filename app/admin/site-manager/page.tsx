import{getSiteSettings}from"../../../lib/site-manager";import SiteManagerClient from"./SiteManagerClient";

// Authentication for mutations remains enforced by /api/admin/site-manager.
// Do not add a second page-level session gate here: the existing Admin Control
// Centre session flow already protects entry, and the duplicate gate caused
// valid admin sessions to be redirected back to /admin/updates.
export default async function SiteManagerPage(){return <SiteManagerClient initial={await getSiteSettings()}/>}
