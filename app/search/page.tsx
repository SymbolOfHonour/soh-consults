import SearchClient from "./SearchClient";
import { listPublishedStories, getStorySlug } from "../../lib/news-queue";
import type { DiscoveryItem } from "../../lib/algorithm-phase2";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const stories = await listPublishedStories();
  const publishedUpdates: DiscoveryItem[] = stories.map((story) => ({
    id: `published-${story.id}`,
    href: `/updates/${getStorySlug(story)}`,
    kind: "update",
    title: story.title,
    summary: story.summary,
    body: story.details,
    institution: story.institution,
    category: story.category,
    publishedAt: story.source_published_at || story.updated_at,
    deadline: story.deadline_iso || story.deadline,
    isOfficial: Boolean(story.official_source_name),
  }));
  return <SearchClient publishedUpdates={publishedUpdates} />;
}
