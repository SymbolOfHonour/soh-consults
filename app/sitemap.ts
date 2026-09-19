import type { MetadataRoute } from "next";
import { getSiteUrl } from "./site-url";
import { guides } from "../data/guides";
import { getStorySlug, listPublishedStories } from "../lib/news-queue";

// Publishing, archiving and restoring stories changes the sitemap without a redeploy.
export const dynamic = "force-dynamic";

function safeDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
function categorySlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  // A transient database failure must not masquerade as an empty publication list.
  // Let the request fail so crawlers can retry instead of receiving an incomplete sitemap.
  const published = await listPublishedStories();
  const core: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: .6 },
    { url: `${siteUrl}/privacy-policy`, changeFrequency: "monthly", priority: .4 },
    { url: `${siteUrl}/disclaimer`, changeFrequency: "monthly", priority: .4 },
    { url: `${siteUrl}/lasu-calculator`, changeFrequency: "monthly", priority: .95 },
    { url: `${siteUrl}/cgpa-calculator`, changeFrequency: "monthly", priority: .95 },
    { url: `${siteUrl}/updates`, changeFrequency: "daily", priority: .9 },
    { url: `${siteUrl}/opportunities`, changeFrequency: "daily", priority: .9 },
    { url: `${siteUrl}/deadlines`, changeFrequency: "daily", priority: .9 },
    { url: `${siteUrl}/guides`, changeFrequency: "weekly", priority: .9 },
  ];
  const updatePages: MetadataRoute.Sitemap = published.map(story => ({
    url: `${siteUrl}/updates/${getStorySlug(story)}`,
    lastModified: safeDate(story.updated_at),
    changeFrequency: "weekly",
    priority: .85,
  }));
  const guidePages: MetadataRoute.Sitemap = guides.map(item => ({
    url: `${siteUrl}/guides/${item.slug}`,
    changeFrequency: "monthly",
    priority: .85,
  }));
  const categories: MetadataRoute.Sitemap = Array.from(new Set(published.map(story => categorySlug(story.category)).filter(Boolean))).map(category => ({
    url: `${siteUrl}/updates/category/${category}`,
    changeFrequency: "daily",
    priority: .75,
  }));
  return [...core, ...updatePages, ...categories, ...guidePages];
}
