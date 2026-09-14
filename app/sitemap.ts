import type { MetadataRoute } from "next";
import { getSiteUrl } from "./site-url";
import { getUpdateSlug, updates } from "../data/updates";
import { guides } from "../data/guides";

function safeDate(value?: string): Date | undefined {
  if (!value) return undefined;

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  const core: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/lasu-calculator`,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/updates`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/opportunities`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/deadlines`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/guides`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const updatePages: MetadataRoute.Sitemap = updates.map((item) => ({
    url: `${siteUrl}/updates/${getUpdateSlug(item)}`,
    lastModified: safeDate(item.date),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const guidePages: MetadataRoute.Sitemap = guides.map((item) => ({
    url: `${siteUrl}/guides/${item.slug}`,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const updateCategories: MetadataRoute.Sitemap = Array.from(
    new Set(updates.map((item) => item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"))),
  ).map((category) => ({
    url: `${siteUrl}/updates/category/${category}`,
    changeFrequency: "daily",
    priority: 0.75,
  }));

  return [...core, ...updatePages, ...updateCategories, ...guidePages];
}
