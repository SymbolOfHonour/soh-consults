export type QueueStatus = "draft" | "approved" | "published" | "rejected" | "archived";

export type QueuedStory = {
  id: string;
  source_name: string;
  source_url: string;
  source_published_at: string | null;
  title: string;
  institution: string;
  category: string;
  summary: string;
  details: string;
  deadline: string | null;
  deadline_iso: string | null;
  image_url: string | null;
  document_url: string | null;
  document_name: string | null;
  official_source_name: string | null;
  official_source_url: string | null;
  status: QueueStatus;
  created_at: string;
  updated_at: string;
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ATTACHMENT_PREFIX = "/storage/v1/object/public/news-attachments/";

function headers(prefer?: string) {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Supabase environment variables are not configured.");
  return {
    apikey: SERVICE_KEY,
    ...(SERVICE_KEY.startsWith("eyJ") ? { Authorization: `Bearer ${SERVICE_KEY}` } : {}),
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

export async function listStories(): Promise<QueuedStory[]> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/news_queue?select=*&order=created_at.desc`, { headers: headers(), cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load approval queue (${response.status}).`);
  return response.json();
}

export async function listPublishedStories(): Promise<QueuedStory[]> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/news_queue?select=*&status=eq.published&order=updated_at.desc`, { headers: headers(), next: { revalidate: 300 } });
  if (!response.ok) return [];
  return response.json();
}

export async function getPublishedStory(id: string): Promise<QueuedStory | null> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/news_queue?select=*&id=eq.${encodeURIComponent(id)}&status=eq.published&limit=1`, { headers: headers(), next: { revalidate: 300 } });
  if (!response.ok) return null;
  const rows = await response.json();
  return rows[0] || null;
}

export async function upsertStories(stories: Array<Partial<QueuedStory>>) {
  if (!stories.length) return [];
  const response = await fetch(`${SUPABASE_URL}/rest/v1/news_queue?on_conflict=source_url`, { method: "POST", headers: headers("resolution=ignore-duplicates,return=representation"), body: JSON.stringify(stories), cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to save imported stories (${response.status}).`);
  return response.json();
}

export async function createStory(values: Partial<QueuedStory>) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const row = {
    id,
    source_name: "S.O.H CONSULTS",
    source_url: `manual:${id}`,
    source_published_at: null,
    title: values.title,
    institution: values.institution,
    category: values.category,
    summary: values.summary,
    details: values.details,
    deadline: values.deadline || null,
    deadline_iso: values.deadline_iso || null,
    image_url: values.image_url || null,
    document_url: values.document_url || null,
    document_name: values.document_name || null,
    official_source_name: values.official_source_name || null,
    official_source_url: values.official_source_url || null,
    status: values.status || "draft",
    created_at: now,
    updated_at: now,
  };
  const response = await fetch(`${SUPABASE_URL}/rest/v1/news_queue`, { method: "POST", headers: headers("return=representation"), body: JSON.stringify(row), cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to create story (${response.status}).`);
  const rows = await response.json();
  return rows[0] as QueuedStory;
}

export async function updateStory(id: string, values: Partial<QueuedStory>) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/news_queue?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: headers("return=representation"), body: JSON.stringify({ ...values, updated_at: new Date().toISOString() }), cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to update story (${response.status}).`);
  const rows = await response.json();
  return rows[0] as QueuedStory | undefined;
}

function attachmentPath(url: string | null) {
  if (!url || !SUPABASE_URL || !url.startsWith(`${SUPABASE_URL}${ATTACHMENT_PREFIX}`)) return null;
  return decodeURIComponent(url.slice(`${SUPABASE_URL}${ATTACHMENT_PREFIX}`.length));
}

async function deleteAttachment(url: string | null) {
  const path = attachmentPath(url);
  if (!path) return;
  await fetch(`${SUPABASE_URL}/storage/v1/object/news-attachments/${path.split("/").map(encodeURIComponent).join("/")}`, { method: "DELETE", headers: headers(), cache: "no-store" });
}

export async function deleteStory(id: string) {
  const lookup = await fetch(`${SUPABASE_URL}/rest/v1/news_queue?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, { headers: headers(), cache: "no-store" });
  if (!lookup.ok) throw new Error("Unable to load story for deletion.");
  const story = (await lookup.json())[0] as QueuedStory | undefined;
  if (!story) return false;
  await Promise.all([deleteAttachment(story.image_url), deleteAttachment(story.document_url)]);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/news_queue?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: headers("return=minimal"), cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to permanently delete story (${response.status}).`);
  return true;
}

export async function uploadStoryFile(file: File, kind: "image" | "document") {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Supabase environment variables are not configured.");
  const extension = file.name.split(".").pop()?.toLowerCase() || (kind === "image" ? "jpg" : "pdf");
  const safeName = `${kind}s/${crypto.randomUUID()}.${extension}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/news-attachments/${safeName}`, { method: "POST", headers: { ...headers("return=minimal"), "Content-Type": file.type, "x-upsert": "false" }, body: await file.arrayBuffer() });
  if (!response.ok) throw new Error(`Unable to upload file (${response.status}).`);
  return `${SUPABASE_URL}/storage/v1/object/public/news-attachments/${safeName}`;
}
