import{NextResponse}from"next/server";import{getHomepageControl}from"../../../../lib/homepage-control";
export async function GET(){const v=await getHomepageControl();return NextResponse.json(v.enabled?v:{enabled:false},{headers:{"Cache-Control":"public, s-maxage=30, stale-while-revalidate=120"}})}
