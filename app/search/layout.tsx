import {withPublicSocial} from "../../lib/public-metadata";
import type {Metadata} from "next";
export const metadata:Metadata=withPublicSocial({title:'Search S.O.H CONSULTS',description:'Search educational updates, guides and opportunities.',alternates:{canonical:"/search"},robots:{index:false,follow:true}});
export default function Layout({children}:{children:React.ReactNode}){return children;}
