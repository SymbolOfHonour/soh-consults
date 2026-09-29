import{redirect}from"next/navigation";import{isAdmin}from"../../../lib/admin-auth";import{getSiteSettings}from"../../../lib/site-manager";import SiteManagerClient from"./SiteManagerClient";
export default async function SiteManagerPage(){if(!(await isAdmin()))redirect("/admin/updates");return <SiteManagerClient initial={await getSiteSettings()}/>}
