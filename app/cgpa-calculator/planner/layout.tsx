import {withPublicSocial} from "../../../lib/public-metadata";
import type {Metadata} from "next";
export const metadata:Metadata=withPublicSocial({title:'CGPA Target Planner',description:'Plan the grades and credit units needed to reach your target CGPA.',alternates:{canonical:"/cgpa-calculator/planner"}});
export default function Layout({children}:{children:React.ReactNode}){return children;}
