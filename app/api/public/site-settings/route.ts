import{NextResponse}from"next/server";import{getSiteSettings}from"../../../../lib/site-manager";
export const dynamic="force-dynamic";
export async function GET(){const{maintenanceNote:_,...publicSettings}=await getSiteSettings();return NextResponse.json(publicSettings,{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=300"}})}
