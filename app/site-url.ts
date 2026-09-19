const PRIMARY_SITE_URL = "https://sohconsults.com.ng";

export function getSiteUrl() {
  // Canonical URLs must remain stable regardless of Vercel deployment aliases or
  // a stale NEXT_PUBLIC_SITE_URL environment variable.
  if (process.env.VERCEL_ENV === "production") return PRIMARY_SITE_URL;

  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl = process.env.VERCEL_URL;
  const rawUrl = configuredUrl || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");
  return rawUrl.replace(/\/$/, "");
}
