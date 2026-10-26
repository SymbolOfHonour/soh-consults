import type { Viewport } from "next";
// Fit the full homepage overview to a phone screen; native pinch zoom stays available.
// Clear the root scale so mobile browsers calculate the initial fit from this width.
export const viewport:Viewport={width:1120,initialScale:undefined,userScalable:true};
import type { Metadata } from "next";
import HomepageServer from "./homepage-server";
import {defaultSiteSettings,getPublishedSiteSettings} from "../lib/site-manager";
export const dynamic = "force-dynamic";
export async function generateMetadata():Promise<Metadata> {
 let settings=defaultSiteSettings;
 try {settings=await getPublishedSiteSettings();}catch { /* Keep the established metadata if CMS is unavailable. */ }
 const customTitle=settings.seoTitle&&settings.seoTitle!==defaultSiteSettings.seoTitle;
 const customDescription=settings.seoDescription&&settings.seoDescription!==defaultSiteSettings.seoDescription;
 const title=customTitle?settings.seoTitle!:"S.O.H CONSULTS | Admission, Education & Consultation";
 const description=customDescription?settings.seoDescription!:"S.O.H CONSULTS provides admission guidance, educational updates, JAMB support, application assistance and the LASU Aggregate & Eligibility Checker.";
 return {title:{absolute:title},description,alternates:{canonical:"/"},openGraph:{type:"website",siteName:settings.siteName,title,description,url:"/",images:[{url:"/soh-logo.jpg",alt:settings.siteName}]},twitter:{card:"summary_large_image",title,description,images:["/soh-logo.jpg"]}};
}
export default HomepageServer;
