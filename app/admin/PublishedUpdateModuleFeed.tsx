import Link from "next/link";
import {listStories, getStorySlug, type QueuedStory} from "../../lib/news-queue";

type SyncedModule = "opportunities" | "forms" | "media" | "calendar";
const opportunityPattern = /opportunit|scholarship|internship|fellowship|vacanc|recruit|job\b|grant\b|nysc|employment|career/i;
const formPattern = /admission|application|registration|screening|post.?utme|postgraduate|pre.?degree|sandwich|part.?time|jupeb|form\b/i;
function belongs(story:QueuedStory,module:SyncedModule){
  const category=story.category||"";
  const title=story.title||"";
  if(module==="opportunities")return opportunityPattern.test(`${category} ${title}`);
  if(module==="forms")return formPattern.test(`${category} ${title}`) && !opportunityPattern.test(category);
  if(module==="media")return Boolean(story.image_url||story.document_url);
  return Boolean(story.deadline||story.deadline_iso);
}
export default async function PublishedUpdateModuleFeed({module}:{module:SyncedModule}){
  // Read the canonical rows each time: editing, unpublishing, archiving and deleting
  // an update automatically changes its presence here without copying any records.
  const published=(await listStories()).filter(story=>story.status==="published" && !story.source_name.startsWith("S.O.H Module:") && !story.source_name.startsWith("S.O.H Opportunity:"));
  const matches=published.filter(story=>belongs(story,module));
  return <section className="mb-6 rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-green-700">Live synchronization · Published Updates</p><h2 className="mt-1 text-xl font-black">Linked published updates ({matches.length})</h2><p className="mt-1 text-sm text-gray-600">These are live references, not duplicate records. Edit, archive or delete the original update in Updates Manager to change this feed. Existing manually managed records remain separate.</p></div><Link href="/admin/updates" className="rounded-xl bg-green-700 px-4 py-2 text-sm font-black text-white">Manage Updates →</Link></div>
    {matches.length===0?<p className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">No matching published updates yet. Publish a relevant update to populate this module automatically.</p>:<div className="mt-5 divide-y rounded-xl border">{matches.map(story=><article key={story.id} className="flex flex-wrap items-start justify-between gap-3 p-4"><div className="min-w-0 flex-1"><p className="text-xs font-bold text-green-700">{story.category||"Update"} · Published</p><h3 className="mt-1 font-black text-gray-950">{story.title}</h3>{story.summary&&<p className="mt-1 line-clamp-2 text-sm text-gray-600">{story.summary}</p>}{module==="calendar"&&(story.deadline_iso||story.deadline)&&<p className="mt-2 text-xs font-bold text-gray-700">Deadline: {story.deadline_iso||story.deadline}</p>}{module==="media"&&<p className="mt-2 text-xs text-gray-600">{[story.image_url?"Image":"",story.document_url?"Document":""].filter(Boolean).join(" · ")}</p>}</div><div className="flex flex-wrap gap-2"><Link href={`/updates/${getStorySlug(story)}`} className="rounded-lg border px-3 py-2 text-xs font-bold text-green-800">View article</Link><Link href="/admin/updates/edit" className="rounded-lg border px-3 py-2 text-xs font-bold text-gray-800">Edit in Updates</Link>{module==="media"&&story.image_url&&<a href={story.image_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border px-3 py-2 text-xs font-bold">Image ↗</a>}{module==="media"&&story.document_url&&<a href={story.document_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border px-3 py-2 text-xs font-bold">Document ↗</a>}</div></article>)}</div>}
  </section>;
}
