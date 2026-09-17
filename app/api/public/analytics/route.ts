import {NextResponse} from "next/server";
import {checkRateLimit} from "../../../../lib/rate-limit";
import {recordAnalyticsEvent,type AnalyticsEvent} from "../../../../lib/business-intelligence";
const allowed=new Set<AnalyticsEvent>(["article_view","calculator_use","whatsapp_click"]);
export async function POST(request:Request){const rate=await checkRateLimit(request,"analytics-event",60,60*60);if(!rate.allowed)return NextResponse.json({ok:false},{status:429});const ua=request.headers.get("user-agent")||"";if(/bot|crawler|spider|preview/i.test(ua))return NextResponse.json({ok:true,ignored:true});const body=await request.json().catch(()=>null) as {event?:AnalyticsEvent;label?:string}|null;if(!body?.event||!allowed.has(body.event))return NextResponse.json({error:"Invalid analytics event."},{status:400});try{await recordAnalyticsEvent(body.event,String(body.label||""));return NextResponse.json({ok:true})}catch{return NextResponse.json({error:"Analytics unavailable."},{status:503})}}
