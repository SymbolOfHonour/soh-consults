import type { QueuedStory } from "./news-queue";

const TRASH_PREFIX = "S.O.H Trash:";
const ATTACHMENT_PREFIX = "/storage/v1/object/public/news-attachments/";

/** Delete only if the row is still in Trash when PostgREST executes DELETE. */
export async function permanentlyDeleteTrashedStory(id: string): Promise<boolean> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are not configured.");
  const headers = {
    apikey: key,
    ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
  // The predicate is part of the DELETE itself, not a separate preflight read.
  const filter = new URLSearchParams({ id: `eq.${id}`, source_name: `like.${TRASH_PREFIX}*`, select: "*" });
  const response = await fetch(`${url}/rest/v1/news_queue?${filter}`, {
    method: "DELETE", headers, cache: "no-store",
  });
  if (!response.ok) throw new Error(`Unable to permanently delete trashed update (${response.status}).`);
  const deleted = (await response.json()) as QueuedStory[];
  if (!deleted.length) return false;

  async function cleanup(fileUrl: string | null) {
    if (!fileUrl?.startsWith(`${url}${ATTACHMENT_PREFIX}`)) return;
    let path: string;
    try { path = decodeURIComponent(fileUrl.slice(`${url}${ATTACHMENT_PREFIX}`.length)); }
    catch { return; }
    if (!/^(images|documents)\/[a-f0-9-]+\.[a-z0-9]+$/i.test(path)) return;
    const objectPath = path.split("/").map(encodeURIComponent).join("/");
    const result = await fetch(`${url}/storage/v1/object/news-attachments/${objectPath}`, {
      method: "DELETE", headers, cache: "no-store",
    });
    if (!result.ok && result.status !== 404) console.error(`Attachment cleanup failed (${result.status}).`);
  }
  await Promise.all([cleanup(deleted[0].image_url), cleanup(deleted[0].document_url)]);
  return true;
}
