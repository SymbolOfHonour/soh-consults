import type { MetadataRoute } from "next";
import { getSiteUrl } from "./site-url";
import { updates } from "../data/updates";
import { guides } from "../data/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();
  const core: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/lasu-calculator`, lastModified, changeFrequency: "monthly", priority: 0.95 },
    { url: `${siteUrl}/updates`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/opportunities`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/deadlines`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/guides`, lastModified, changeFrequency: "weekly", priority: 0.9 },
  ];
  const updatePages: MetadataRoute.Sitemap = updates.map(item => ({ url: `${siteUrl}/updates/${item.id}`, lastModified, changeFrequency: "weekly", priority: 0.75 }));
  const guidePages: MetadataRoute.Sitemap = guides.map(item => ({ url: `${siteUrl}/guides/${item.slug}`, lastModified, changeFrequency: "monthly", priority: 0.8 }));
  return [...core, ...updatePages, ...guidePages];
}
