import { Worker } from "bullmq";
import { createQueue, getConnection, QUEUE_NAME, scheduleRefresh } from "./queue";
import { refresh } from "@/server/ipo-service";

/**
 * Standalone worker process. Run with `npm run worker` on an always-on host.
 * It refreshes IPO data (via the active DataProvider — set DATA_PROVIDER=scraper
 * here to actually scrape) and persists it to Postgres, then repeats.
 *
 * This is the piece that makes the Playwright + BullMQ + Redis part of the
 * stack real; the Vercel deployment relies on Vercel Cron instead.
 */
async function main() {
  const connection = getConnection();
  const queue = createQueue(connection);

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const result = await refresh();
      console.log(
        `[worker] job ${job.id} done — ${result.count} IPOs from "${result.source}" (persisted: ${result.persisted})`,
      );
      return result;
    },
    { connection, concurrency: 1 },
  );

  worker.on("failed", (job, err) => {
    console.error(`[worker] job ${job?.id} failed:`, err);
  });

  await scheduleRefresh(queue);
  console.log(`[worker] listening on "${QUEUE_NAME}" — refresh scheduled.`);

  const shutdown = async () => {
    console.log("[worker] shutting down…");
    await worker.close();
    await queue.close();
    await connection.quit();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[worker] fatal:", err);
  process.exit(1);
});
