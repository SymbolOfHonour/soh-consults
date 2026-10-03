import worker from "./.open-next/worker.js";
export * from "./.open-next/worker.js";

const routes = {
  "0 5 * * *": "/api/cron/smart-operations",
  "0 6 * * *": "/api/cron/import-news",
  "0 7 * * *": "/api/cron/backup-updates",
};

export async function runQaScheduled(controller, env, ctx) {
  const path = routes[controller.cron];
  if (!path) throw new Error("Unknown QA cron schedule.");
  if (!env.CRON_SECRET) throw new Error("QA cron secret is not configured.");
  const response = await worker.fetch(
    new Request(`https://soh-consults-qa.oluyepeadetayo.workers.dev${path}`, {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    }),
    env,
    ctx,
  );
  await response.arrayBuffer();
  if (!response.ok) throw new Error(`QA scheduled job failed (${response.status}).`);
}

const qaWorker = {
  ...worker,
  scheduled(controller, env, ctx) {
    ctx.waitUntil(runQaScheduled(controller, env, ctx));
  },
};

export default qaWorker;
