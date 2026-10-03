const origin = "https://soh-consults-qa.oluyepeadetayo.workers.dev";
const secret = process.env.QA_CRON_SECRET;
if (!secret) throw new Error("QA cron verification requires its isolated secret.");
const failures = [];
for (const path of ["/api/cron/smart-operations", "/api/cron/import-news", "/api/cron/backup-updates"]) {
  try {
    const denied = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(30000) });
    if (denied.status !== 401) throw new Error("Unauthenticated request was not rejected");
    const response = await fetch(`${origin}${path}`, {
      headers: { authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(180000),
    });
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(`HTTP ${response.status}: ${String(result.error || "Execution failed").replaceAll(secret, "[redacted]").slice(0,500)}`);
    if (path.endsWith("backup-updates") && result.success !== true) throw new Error("Snapshot was not confirmed");
    console.log(`PASS ${path}: authenticated execution and unauthenticated rejection`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Execution failed";
    failures.push(`${path}: ${message}`);
    console.error(`FAIL ${path}: ${message}`);
  }
}
if (failures.length) throw new Error(`${failures.length} QA cron verification(s) failed.`);
