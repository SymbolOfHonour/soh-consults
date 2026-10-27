import { teamRequest } from "./editor-team";

const prefix = "S.O.H System:backup:";
export type BackupSnapshot = { id: string; source_name: string; title: string; summary: string; created_at: string };

/** Read the list without loading the full JSON payload of every snapshot. */
export async function listBackupSnapshots(): Promise<BackupSnapshot[]> {
  const snapshots: BackupSnapshot[] = [];
  for (let offset = 0; ; offset += 500) {
    const query = new URLSearchParams({
      select: "id,source_name,title,summary,created_at",
      source_name: `like.${prefix}*`,
      order: "created_at.desc,id.desc",
      limit: "500",
      offset: String(offset),
    });
    const page = await teamRequest<BackupSnapshot[]>(`/rest/v1/news_queue?${query}`);
    snapshots.push(...page);
    if (page.length < 500) return snapshots;
  }
}

/** Fetch only a requested snapshot, never another private record by ID. */
export async function getBackupSnapshot(id: string): Promise<{ source_name: string; details: string } | null> {
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)) return null;
  const query = new URLSearchParams({ select: "source_name,details", id: `eq.${id}`, source_name: `like.${prefix}*`, limit: "1" });
  const rows = await teamRequest<Array<{ source_name: string; details: string }>>(`/rest/v1/news_queue?${query}`);
  const row = rows[0];
  return row?.source_name.startsWith(prefix) ? row : null;
}
