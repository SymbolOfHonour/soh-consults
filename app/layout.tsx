import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWARegister from "./components/PWARegister";
import InstallApp from "./components/InstallApp";
import AskSOH from "./components/AskSOH";
import VisitCounter from "./components/VisitCounter";
import HomeLatestUpdates from "./components/HomeLatestUpdates";
import HomeAnnouncement from "./components/HomeAnnouncement";
import BusinessAnalytics from "./components/BusinessAnalytics";
import { getSiteUrl } from "./site-url";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "S.O.H CONSULTS | Admission, Education & Consultation", template: "%s | S.O.H CONSULTS" },
  description: "S.O.H CONSULTS provides admission guidance, educational updates, JAMB support, application assistance and the LASU Aggregate & Eligibility Checker.",
  keywords: ["S.O.H CONSULTS","LASU aggregate calculator","LASU admission","LASU admission calculator","LASU eligibility checker","admission opportunities Nigeria","JAMB services","JAMB admission","education updates Nigeria","admission guidance","Post UTME registration","Direct Entry admission"],
  authors: [{ name: "S.O.H CONSULTS" }], creator: "S.O.H CONSULTS", publisher: "S.O.H CONSULTS",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: { type: "website", title: "S.O.H CONSULTS | Admission, Education & Consultation", description: "Admission guidance, educational opportunities, JAMB support and the LASU Aggregate & Eligibility Checker.", siteName: "S.O.H CONSULTS", url: siteUrl, images: [{ url: "/soh-logo.jpg", alt: "S.O.H CONSULTS" }] },
  manifest: "/manifest.webmanifest", verification: { google: "BdoiW3GoHdajYLbbLSmm-UQpo3YrjBAAWT2NpoKTcBs" },
};
export const viewport: Viewport = { themeColor: "#15803d" };
const organizationStructuredData = { "@context":"https://schema.org", "@type":"Organization", "@id":`${siteUrl}/#organization`, name:"S.O.H CONSULTS", url:siteUrl, logo:`${siteUrl}/soh-logo.jpg`, description:"S.O.H CONSULTS provides admission guidance, educational consultation, JAMB support, application assistance, educational updates and admission tools for students and applicants in Nigeria.", email:"mailto:Oluyepeadetayo@gmail.com", telephone:"+2348182141088", founder:{"@type":"Person",name:"Oluyepe Adetayo Sunday"}, sameAs:["https://www.instagram.com/oluyepeadetayo/","https://www.linkedin.com/in/adetayo-sunday-oluyepe","https://whatsapp.com/channel/0029VbD6QQp3GJP68dl9TK29"], contactPoint:{"@type":"ContactPoint",telephone:"+2348182141088",contactType:"customer service",areaServed:"NG",availableLanguage:["English"]}, areaServed:{"@type":"Country",name:"Nigeria"} };

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}><head><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationStructuredData)}}/></head><body className="min-h-full flex flex-col"><PWARegister/><HomeAnnouncement/>{children}<footer aria-label="Legal information" className="bg-[#043b29] px-4 py-3 text-center text-xs text-white"><a href="/privacy-policy" className="inline-block rounded px-2 py-1 font-semibold underline underline-offset-4 hover:text-[#efc46e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#efc46e]">Privacy Policy</a><a href="/disclaimer" className="inline-block rounded px-2 py-1 font-semibold underline underline-offset-4 hover:text-[#efc46e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#efc46e]">Disclaimer</a><span className="block pt-1">CAC Registered Business | BN8780171</span></footer><HomeLatestUpdates/><VisitCounter/><BusinessAnalytics/><AskSOH/><InstallApp/></body></html>;
}
