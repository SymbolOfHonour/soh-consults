const origin = "https://soh-consults-qa.oluyepeadetayo.workers.dev";
const secret = process.env.QA_CRON_SECRET;
if (!secret) throw new Error("QA cron verification requires its isolated secret.");
for (const path of ["/api/cron/smart-operations", "/api/cron/import-news", "/api/cron/backup-updates"]) {
  const denied = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(30000) });
  if (denied.status !== 401) throw new Error(`Unauthenticated QA cron was not rejected: ${path}`);
  const response = await fetch(`${origin}${path}`, {
    headers: { authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(180000),
  });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(`QA cron failed: ${path} (${response.status})`);
  if (path.endsWith("backup-updates") && result.success !== true) throw new Error("QA snapshot was not confirmed.");
  console.log(`PASS ${path}: authenticated execution and unauthenticated rejection`);
}
