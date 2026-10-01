import {withPublicSocial} from "../../lib/public-metadata";
import type {Metadata} from "next";
export const metadata:Metadata=withPublicSocial({title:'YABATECH Screening Calculator',description:'Estimate your YABATECH admission screening score using UTME and OLevel results.',alternates:{canonical:"/yabatech-calculator"}});
export default function Layout({children}:{children:React.ReactNode}){return children;}
