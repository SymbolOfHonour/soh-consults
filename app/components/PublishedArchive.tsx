import { categorySlug } from "../../lib/category-slug";
import { getStorySlug, type QueuedStory } from "../../lib/news-queue";

/** Server-rendered links keep older publications discoverable without Show more. */
export default function PublishedArchive({ stories }: { stories: QueuedStory[] }) {
  const categories = Array.from(new Set(stories.map(story => story.category))).sort();
  if (!stories.length) return null;
  return <nav aria-label="Published update archive" className="mt-8 rounded-2xl border bg-white p-5">
    <h2 className="text-lg font-black text-green-950">Browse update categories</h2>
    <div className="mt-3 flex flex-wrap gap-2">{categories.map(name => <a key={name} href={`/updates/category/${categorySlug(name)}`} className="rounded-full border px-3 py-2 text-sm font-bold text-green-800">{name}</a>)}</div>
    <details className="mt-5">
      <summary className="cursor-pointer py-2 font-bold text-green-800">All published updates ({stories.length})</summary>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">{stories.map(story => <li key={story.id}><a href={`/updates/${getStorySlug(story)}`} className="block break-words py-2 text-sm font-semibold text-green-800 hover:underline">{story.title}</a></li>)}</ul>
    </details>
  </nav>;
}
