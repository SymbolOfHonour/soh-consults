export type QueueStatus = "draft" | "approved" | "published" | "rejected";

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

function headers(prefer?: string) {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Supabase environment variables are not configured.");
  return {
    apikey: SERVICE_KEY,
    // Legacy service-role keys are JWTs and can also be used as the Bearer token.
    // New sb_secret_ keys belong in apikey only; Supabase rejects them as JWTs.
    ...(SERVICE_KEY.startsWith("eyJ") ? { Authorization: `Bearer ${SERVICE_KEY}` } : {}),
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

export async function listStories(): Promise<QueuedStory[]> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/news_queue?select=*&order=created_at.desc`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Unable to load approval queue (${response.status}).`);
  return response.json();
}

export async function listPublishedStories(): Promise<QueuedStory[]> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/news_queue?select=*&status=eq.published&order=updated_at.desc`, {
    headers: headers(),
    next: { revalidate: 300 },
  });
  if (!response.ok) return [];
  return response.json();
}

export async function getPublishedStory(id: string): Promise<QueuedStory | null> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/news_queue?select=*&id=eq.${encodeURIComponent(id)}&status=eq.published&limit=1`, {
    headers: headers(),
    next: { revalidate: 300 },
  });
  if (!response.ok) return null;
  const rows = await response.json();
  return rows[0] || null;
}

export async function upsertStories(stories: Array<Partial<QueuedStory>>) {
  if (!stories.length) return [];
  const response = await fetch(`${SUPABASE_URL}/rest/v1/news_queue?on_conflict=source_url`, {
    method: "POST",
    headers: headers("resolution=ignore-duplicates,return=representation"),
    body: JSON.stringify(stories),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Unable to save imported stories (${response.status}).`);
  return response.json();
}

export async function updateStory(id: string, values: Partial<QueuedStory>) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/news_queue?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headers("return=representation"),
    body: JSON.stringify({ ...values, updated_at: new Date().toISOString() }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Unable to update story (${response.status}).`);
  const rows = await response.json();
  return rows[0] as QueuedStory | undefined;
}

export async function uploadStoryFile(file: File, kind: "image" | "document") {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Supabase environment variables are not configured.");
  const extension = file.name.split(".").pop()?.toLowerCase() || (kind === "image" ? "jpg" : "pdf");
  const safeName = `${kind}s/${crypto.randomUUID()}.${extension}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/news-attachments/${safeName}`, {
    method: "POST",
    headers: {
      ...headers("return=minimal"),
      "Content-Type": file.type,
      "x-upsert": "false",
    },
    body: await file.arrayBuffer(),
  });
  if (!response.ok) throw new Error(`Unable to upload file (${response.status}).`);
  return `${SUPABASE_URL}/storage/v1/object/public/news-attachments/${safeName}`;
}
