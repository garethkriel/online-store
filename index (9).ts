import { db } from "../lib/db";
import { processJob } from "../lib/fulfillment";

/** Polls the queue every 15s. Run with: npm run worker  (or cron → a /api/cron route on Vercel) */
async function tick() {
  const jobs = await db.fulfillmentJob.findMany({ where: { status: "QUEUED" }, take: 10, orderBy: { createdAt: "asc" } });
  for (const j of jobs) await processJob(j.id);
}
(async () => { for (;;) { try { await tick(); } catch (e) { console.error(e); } await new Promise((r) => setTimeout(r, 15000)); } })();
