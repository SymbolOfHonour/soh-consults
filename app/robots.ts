import type { MetadataRoute } from "next";
import { getSiteUrl } from "./site-url";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments can contain draft content and have their own Vercel URLs.
  // Keep them out of search results; only the production deployment is indexable.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  const siteUrl = getSiteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/admin/", "/api/cron/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
