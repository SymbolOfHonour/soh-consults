"use client";

import { useMemo, useState } from "react";
import { getUpdateImage, getUpdateReadingTime, getUpdateSlug, updates } from "../../data/updates";
import type { QueuedStory } from "../../lib/news-queue";

export default function UpdatesExplorer({ initialCategory = "All", importedStories = [] }: { initialCategory?: string; importedStories?: QueuedStory[] }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const allUpdates = useMemo(() => [
    ...importedStories.map(item => ({
      id: `imported-${item.id}`,
      category: item.category,
      institution: item.institution,
      title: item.title,
      date: new Date(item.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      summary: item.summary,
      details: item.details,
      importedId: item.id,
    })),
    ...updates.map(item => ({ ...item, importedId: undefined as string | undefined })),
  ], [importedStories]);
  const categories = ["All", ...Array.from(new Set(allUpdates.map((item) => item.category)))];

  const filteredUpdates = useMemo(() => {
    const search = query.trim().toLowerCase();
    return allUpdates.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch =
        !search ||
        [item.title, item.summary, item.institution, item.category].some((value) =>
          value.toLowerCase().includes(search),
        );
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, query, allUpdates]);

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <label htmlFor="update-search" className="sr-only">Search updates</label>
        <input
          id="update-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search LASU, JAMB, admission list..."
          className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-base shadow-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
        />
      </div>

      <div className="mt-7 flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
              activeCategory === category
                ? "bg-green-700 text-white"
                : "bg-white text-gray-700 shadow-sm hover:bg-green-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <p className="mt-7 text-sm font-semibold text-gray-500">
        {filteredUpdates.length} update{filteredUpdates.length === 1 ? "" : "s"} found
      </p>

      {filteredUpdates.length > 0 ? (
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {filteredUpdates.map((item) => {
            const image = item.importedId ? undefined : getUpdateImage(item);
            return (
              <article key={item.id} className="flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                {image ? <img src={image} alt="" className="h-52 w-full object-cover" /> : (
                  <div className="flex h-36 items-end bg-gradient-to-br from-green-950 to-green-700 p-6 text-4xl">📰</div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
                    <a href={`/updates/category/${item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="rounded-full bg-green-100 px-3 py-1 font-black text-green-800 hover:bg-green-200">
                      {item.category}
                    </a>
                    <span>{item.date}</span>
                    <span>·</span>
                    <span>{getUpdateReadingTime(item)} min read</span>
                  </div>
                  <h2 className="mt-4 text-xl font-black leading-7 text-gray-950">{item.title}</h2>
                  <p className="mt-3 flex-1 leading-7 text-gray-600">{item.summary}</p>
                  <a href={item.importedId ? `/updates/imported/${item.importedId}` : `/updates/${getUpdateSlug({ id: item.id as number, title: item.title })}`} className="mt-6 inline-flex items-center font-black text-green-700 hover:text-green-900">
                    Read Full Update →
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-xl font-black text-gray-900">No update matches your search</p>
          <button onClick={() => { setQuery(""); setActiveCategory("All"); }} className="mt-4 font-black text-green-700">Clear search and filters</button>
        </div>
      )}
    </>
  );
}
