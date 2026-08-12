import IORedis from "ioredis";
import { Queue } from "bullmq";

export const QUEUE_NAME = "ipo-refresh";

/**
 * TCP Redis connection for BullMQ. This is a long-lived socket, which is why
 * the worker must run on an always-on host (Railway / Render / Fly / a VPS)
 * and NOT on Vercel serverless. `maxRetriesPerRequest: null` is required by
 * BullMQ for blocking commands.
 */
export function getConnection(): IORedis {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error(
      "REDIS_URL is not set. The BullMQ worker needs a TCP Redis URL (e.g. redis://...).",
    );
  }
  return new IORedis(url, { maxRetriesPerRequest: null });
}

export function createQueue(connection: IORedis): Queue {
  return new Queue(QUEUE_NAME, { connection });
}

/** Register a repeatable refresh job + kick off one immediate run. */
export async function scheduleRefresh(queue: Queue, everyMs = 15 * 60 * 1000): Promise<void> {
  await queue.add(
    "refresh",
    {},
    {
      repeat: { every: everyMs },
      jobId: "repeat-refresh",
      removeOnComplete: 50,
      removeOnFail: 50,
    },
  );
  await queue.add("refresh", { immediate: true }, { removeOnComplete: 50 });
}
