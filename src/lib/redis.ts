// Optional HTTP Redis cache (Upstash), safe to call whether or not it's
// configured. When the env vars are missing, every method is a no-op and the
// service simply computes fresh each time. This is the Vercel-friendly Redis
// client (HTTP, no persistent socket) — distinct from the ioredis connection
// the BullMQ worker uses.

import type { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

async function getClient(): Promise<Redis | null> {
  if (client !== undefined) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    client = null;
    return client;
  }

  const { Redis } = await import("@upstash/redis");
  client = new Redis({ url, token });
  return client;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const c = await getClient();
      if (!c) return null;
      return (await c.get<T>(key)) ?? null;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T, ttlSeconds = 120): Promise<void> {
    try {
      const c = await getClient();
      if (!c) return;
      await c.set(key, value, { ex: ttlSeconds });
    } catch {
      /* ignore cache write failures */
    }
  },

  async del(key: string): Promise<void> {
    try {
      const c = await getClient();
      if (!c) return;
      await c.del(key);
    } catch {
      /* ignore */
    }
  },
};

export const CACHE_KEYS = {
  board: "ipos:board:v1",
} as const;
