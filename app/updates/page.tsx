import PublishedArchive from "../components/PublishedArchive";
import type { Viewport } from "next";
export const viewport:Viewport={width:"device-width",initialScale:1,userScalable:true};
import type { Metadata } from "next";
import SiteContact from "../components/SiteContact";
import DiscoveryHeader from "../components/DiscoveryHeader";
import UpdatesExplorer from "../components/UpdatesExplorer";
import { listPublishedStories } from "../../lib/news-queue";

export const metadata: Metadata = {
  title: "Latest Admission & Education Updates",
  description: "Latest Nigerian admission, JAMB and education updates from S.O.H CONSULTS, simplified for students and applicants.",
  alternates: { canonical: "/updates" },
  openGraph: {
    type: "website",
    title: "Latest Admission & Education Updates | S.O.H CONSULTS",
    description: "Latest Nigerian admission, JAMB and education updates simplified for students and applicants.",
    url: "/updates",
  },
};


export default async function UpdatesPage() {
  const importedStories = await listPublishedStories().catch(() => []);
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <DiscoveryHeader/>
      <section className="bg-gradient-to-br from-green-950 via-green-900 to-green-700 py-16 text-white">
        <div className="mx-auto max-w-5xl px-5 text-center lg:px-8">
          <p className="font-bold uppercase tracking-widest text-green-300">S.O.H CONSULTS</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Latest Updates</h1>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-green-50">Important admission, JAMB and education updates simplified for students and applicants.</p>
        </div>
      </section>
      <section className="py-8"><div className="mx-auto max-w-5xl px-5 lg:px-8"><UpdatesExplorer importedStories={importedStories} /><PublishedArchive stories={importedStories} /></div></section>
      <SiteContact />
    </main>
  );
}
