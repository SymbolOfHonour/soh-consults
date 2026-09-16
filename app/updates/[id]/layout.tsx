// Update articles and their metadata read live Supabase data, including no-store
// migration checks. Never prerender this route as static HTML.
export const dynamic = "force-dynamic";

export default function UpdateDetailsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
