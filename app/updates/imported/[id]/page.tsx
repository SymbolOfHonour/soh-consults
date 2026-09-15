import { notFound, permanentRedirect } from "next/navigation";
import { getPublishedStory, getStorySlug } from "../../../../lib/news-queue";

type Props={params:Promise<{id:string}>};

export default async function LegacyImportedUpdatePage({params}:Props){
  const story=await getPublishedStory((await params).id);
  if(!story)notFound();
  permanentRedirect(`/updates/${getStorySlug(story)}`);
}
