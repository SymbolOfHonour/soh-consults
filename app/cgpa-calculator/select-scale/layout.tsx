import {withPublicSocial} from "../../../lib/public-metadata";
import type {Metadata} from "next";
export const metadata:Metadata=withPublicSocial({title:'Choose Your CGPA Scale',description:'Choose a grading scale for the S.O.H CONSULTS CGPA calculator.',alternates:{canonical:"/cgpa-calculator/select-scale"}});
export default function Layout({children}:{children:React.ReactNode}){return children;}
