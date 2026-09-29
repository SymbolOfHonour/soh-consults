import{NextResponse}from"next/server";import{getSiteSettings}from"../../../../lib/site-manager";
export const dynamic="force-dynamic";
export async function GET(){const s=await getSiteSettings();return NextResponse.json(s,{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=300"}})}
