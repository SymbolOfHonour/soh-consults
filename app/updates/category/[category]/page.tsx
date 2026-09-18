import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listPublishedStories } from "../../../../lib/news-queue";
import SiteContact from "../../../components/SiteContact";
import UpdatesExplorer from "../../../components/UpdatesExplorer";

type Props = { params: Promise<{ category: string }> };
const categorySlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Categories change whenever updates are published, archived or moved to Trash.
export const dynamic = "force-dynamic";

async function getCategory(category: string) {
  const stories = await listPublishedStories();
  const name = stories.find((item) => categorySlug(item.category) === category)?.category;
  return { stories, name };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const { name } = await getCategory(category);
  return name
    ? { title: `${name} Updates`, description: `Latest ${name.toLowerCase()} news and guidance from S.O.H CONSULTS.`, alternates: { canonical: `/updates/category/${category}` } }
    : { title: "Update Category Not Found", robots: { index: false, follow: false } };
}

export default async function UpdateCategoryPage({ params }: Props) {
  const { category } = await params;
  const { stories, name } = await getCategory(category);
  if (!name) notFound();
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-100 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><a href="/"><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-16 w-auto" /></a><a href="/updates" className="font-black text-green-700">All Updates</a></div></header>
      <section className="bg-gradient-to-br from-green-950 to-green-700 py-14 text-white"><div className="mx-auto max-w-5xl px-5 text-center"><p className="font-bold uppercase tracking-widest text-green-300">Browse by category</p><h1 className="mt-3 text-4xl font-black">{name} Updates</h1></div></section>
      <section className="py-14"><div className="mx-auto max-w-5xl px-5 lg:px-8"><UpdatesExplorer initialCategory={name} importedStories={stories} /></div></section>
      <SiteContact />
    </main>
  );
}
