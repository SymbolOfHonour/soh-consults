import{NextResponse}from"next/server";
import{isAdmin}from"../../../../../lib/admin-auth";
import{publishSiteSettings}from"../../../../../lib/site-manager";

export async function POST(){
 if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{return NextResponse.json(await publishSiteSettings())}
 catch(error){console.error("CMS publish failed",error);return NextResponse.json({error:"Could not publish CMS changes."},{status:500})}
}
