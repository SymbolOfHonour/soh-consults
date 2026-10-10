// A private review can use already-published fixtures without any database credentials.
// Configured previews and Production continue to read their normal CMS.
export function isIsolatedPreview() {
  return process.env.VERCEL_ENV === "preview" && (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY);
}
