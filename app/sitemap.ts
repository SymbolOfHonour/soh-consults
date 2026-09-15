import type { MetadataRoute } from "next";
import { getSiteUrl } from "./site-url";
import { getUpdateSlug, updates } from "../data/updates";
import { guides } from "../data/guides";
import { getStorySlug, listPublishedStories } from "../lib/news-queue";

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
  const published = await listPublishedStories().catch(() => []);

  const core: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/lasu-calculator`, changeFrequency: "monthly", priority: 0.95 },
    { url: `${siteUrl}/cgpa-calculator`, changeFrequency: "monthly", priority: 0.95 },
    { url: `${siteUrl}/updates`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/opportunities`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/deadlines`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/guides`, changeFrequency: "weekly", priority: 0.9 },
  ];

  const codedUpdatePages: MetadataRoute.Sitemap = updates.map((item) => ({
    url: `${siteUrl}/updates/${getUpdateSlug(item)}`,
    lastModified: safeDate(item.date),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const dashboardUpdatePages: MetadataRoute.Sitemap = published.map((story) => ({
    url: `${siteUrl}/updates/${getStorySlug(story)}`,
    lastModified: safeDate(story.updated_at),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const guidePages: MetadataRoute.Sitemap = guides.map((item) => ({
    url: `${siteUrl}/guides/${item.slug}`,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const updateCategories: MetadataRoute.Sitemap = Array.from(new Set([
    ...updates.map((item) => categorySlug(item.category)),
    ...published.map((story) => categorySlug(story.category)),
  ].filter(Boolean))).map((category) => ({
    url: `${siteUrl}/updates/category/${category}`,
    changeFrequency: "daily",
    priority: 0.75,
  }));

  return [...core, ...codedUpdatePages, ...dashboardUpdatePages, ...updateCategories, ...guidePages];
}
