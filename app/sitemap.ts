import { publicOpportunities } from "../lib/content-catalogue";
import { applicationHref } from "../lib/application-guide";
import {categorySlug} from "../lib/category-slug";
import type { MetadataRoute } from "next";
import { PRIMARY_SITE_URL } from "./site-url";
import { guides } from "../data/guides";
import { getStorySlug, listPublishedStories } from "../lib/news-queue";

// Publishing, archiving and restoring stories changes the sitemap without a redeploy.
export const dynamic = "force-dynamic";

function safeDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A sitemap describes canonical public URLs, never private deployment URLs.
  const siteUrl = PRIMARY_SITE_URL;
  // A transient database failure must not masquerade as an empty publication list.
  // Let the request fail so crawlers can retry instead of receiving an incomplete sitemap.
  const published = await listPublishedStories({strict:true});
  const core: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: .8 },
    { url: `${siteUrl}/privacy-policy`, changeFrequency: "monthly", priority: .5 },
    { url: `${siteUrl}/disclaimer`, changeFrequency: "monthly", priority: .5 },
    { url: `${siteUrl}/lasu-calculator`, changeFrequency: "monthly", priority: .95 },
    { url: `${siteUrl}/cgpa-calculator`, changeFrequency: "monthly", priority: .95 },
    { url: `${siteUrl}/updates`, changeFrequency: "daily", priority: .9 },
    { url: `${siteUrl}/opportunities`, changeFrequency: "daily", priority: .9 },
    { url: `${siteUrl}/deadlines`, changeFrequency: "daily", priority: .9 },
    { url: `${siteUrl}/guides`, changeFrequency: "weekly", priority: .95 },
  ];
  core.push(...["my-school","tools","screening-calculator","fuoye-calculator","fuadsi-calculator","uniosun-calculator","lasued-calculator","lasustech-calculator","oou-calculator","yabatech-calculator","cgpa-calculator/planner","cgpa-calculator/select-scale"].map(path=>({url:`${siteUrl}/${path}`,changeFrequency:"monthly" as const,priority:.7})));
  const updatePages: MetadataRoute.Sitemap = published.map(story => ({
    url: `${siteUrl}/updates/${getStorySlug(story)}`,
    lastModified: safeDate(story.updated_at) || safeDate(story.source_published_at) || safeDate(story.created_at),
    changeFrequency: "weekly",
    priority: .85,
  }));
  const guidePages: MetadataRoute.Sitemap = guides.map(item => ({
    url: `${siteUrl}/guides/${item.slug}`,
    changeFrequency: "monthly",
    priority: .9,
  }));
  const categories: MetadataRoute.Sitemap = Array.from(new Set(published.map(story => categorySlug(story.category)).filter(Boolean))).map(category => ({
    url: `${siteUrl}/updates/category/${category}`,
    changeFrequency: "daily",
    priority: .75,
  }));
  // Slug collisions must not emit duplicate canonical URLs.
  return Array.from(new Map([...core, ...updatePages, ...categories, ...guidePages, ...publicOpportunities(published).map(item => ({ url: `${siteUrl}${applicationHref(item)}`, changeFrequency: "weekly" as const, priority: .7 }))].map(entry => [entry.url, entry])).values());
}
