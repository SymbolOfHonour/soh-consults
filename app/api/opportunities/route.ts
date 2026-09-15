import {NextResponse} from "next/server";
import {listManagedOpportunities} from "../../../lib/opportunities-store";
export async function GET(){try{const opportunities=(await listManagedOpportunities()).filter(o=>o.status!=="CLOSED");return NextResponse.json({opportunities},{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=300"}})}catch{return NextResponse.json({opportunities:[]})}}
