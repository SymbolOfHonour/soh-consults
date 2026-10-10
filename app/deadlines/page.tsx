import { withPublicSocial } from "../../lib/public-metadata";
import type { Metadata } from "next";
export const metadata: Metadata = withPublicSocial({
  title: "Admission Deadline Tracker",
  description: "Track published Nigerian admission and application deadlines, find the supporting updates and get registration guidance from S.O.H CONSULTS.",
  alternates: { canonical: "/deadlines" },
});
import { listPublishedStories } from "../../lib/news-queue";
import { publishedDeadlines } from "../../lib/content-catalogue";
import DeadlinesExplorer from "../components/DeadlinesExplorer";
export const dynamic="force-dynamic";
export default async function DeadlinesPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const params=await searchParams;
  const initialFilters=Object.fromEntries(["q","category"].map(key=>[key,typeof params[key]==="string"?params[key]:undefined]));
  const stories=await listPublishedStories();
  const publishedItems=publishedDeadlines(stories).map(item=>({institution:item.institution||"",programme:item.title,deadline:String(item.deadline),category:item.category||"Other",status:item.status,updateId:null,publishedAt:String(item.publishedAt),detailHref:item.href,isOfficial:item.isOfficial}));
  return <DeadlinesExplorer publishedItems={publishedItems} initialFilters={initialFilters}/>;
}
