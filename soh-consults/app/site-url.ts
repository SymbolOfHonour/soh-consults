export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const vercelUrl = process.env.VERCEL_URL;

  const rawUrl = configuredUrl
    ? configuredUrl
    : vercelProductionUrl
      ? `https://${vercelProductionUrl}`
      : vercelUrl
        ? `https://${vercelUrl}`
        : "http://localhost:3000";

  return rawUrl.replace(/\/$/, "");
}
