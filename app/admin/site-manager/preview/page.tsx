import{redirect}from"next/navigation";
import CmsHomepage from"../../../../components/CmsHomepage";
import{isAdmin}from"../../../../lib/admin-auth";
import{defaultSiteSettings,getSiteSettings}from"../../../../lib/site-manager";

export const dynamic="force-dynamic";
export const metadata={robots:{index:false,follow:false}};

export default async function CmsDraftPreview(){
 if(!(await isAdmin()))redirect("/admin");
 let settings=defaultSiteSettings;
 try{settings=await getSiteSettings()}catch(error){console.error("Unable to load CMS draft preview",error)}
 return <><div className="sticky top-0 z-[100] bg-amber-300 px-4 py-2 text-center text-xs font-black text-black">CMS DRAFT PREVIEW · NOT LIVE</div><CmsHomepage settings={settings}/></>
}
