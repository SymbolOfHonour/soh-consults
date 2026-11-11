import type { Metadata } from 'next';
import { withPublicSocial } from '../../lib/public-metadata';
export const metadata: Metadata = withPublicSocial({title:'OAU Aggregate Calculator 2026/2027 | S.O.H CONSULTS',description:'Calculate your OAU aggregate from UTME, official O’Level points and Post-UTME scores. Plan the Post-UTME score you need and download your report.',alternates:{canonical:'/oau-calculator'}});
export default function Layout({children}:{children:React.ReactNode}) {return children;}
