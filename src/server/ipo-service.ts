import { getPrisma, hasDatabase } from "@/lib/db";
import { buildBoard, deriveIpo } from "@/lib/ipo-math";
import { cache, CACHE_KEYS } from "@/lib/redis";
import type { Ipo, RawIpo } from "@/lib/types";
import { getProvider } from "./data-provider";

const RAW_CACHE_KEY = "ipos:raw:v1";

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * The enriched board the UI renders. Resolution order:
 *   1. Redis cache of raw records (short TTL)         — fastest
 *   2. Postgres, if DATABASE_URL is set               — the persisted store
 *   3. The active DataProvider (seed by default)      — always works
 * Derived fields (status, profit, risk, "closes today") are recomputed on
 * every request against the current time, so they never go stale within a
 * cache window.
 */
export async function getBoard(now: Date = new Date()): Promise<Ipo[]> {
  const raws = await getRawIpos(now);
  return buildBoard(raws, now);
}

/** Just the IPOs whose last application day is today and are still open. */
export async function getClosingToday(now: Date = new Date()): Promise<Ipo[]> {
  const board = await getBoard(now);
  return board.filter((ipo) => ipo.closesToday);
}

async function getRawIpos(now: Date): Promise<RawIpo[]> {
  const cached = await cache.get<RawIpo[]>(RAW_CACHE_KEY);
  if (cached && cached.length) return cached;

  let raws: RawIpo[] | null = null;

  if (hasDatabase()) {
    raws = await readFromDb().catch((err) => {
      console.error("[ipo-service] DB read failed, using provider:", err);
      return null;
    });
  }

  if (!raws || raws.length === 0) {
    const provider = await getProvider();
    raws = await provider.fetchAll(now);
  }

  await cache.set(RAW_CACHE_KEY, raws, 120);
  return raws;
}

// ---------------------------------------------------------------------------
// Refresh (used by the cron endpoint and the BullMQ worker)
// ---------------------------------------------------------------------------

export interface RefreshResult {
  count: number;
  source: string;
  persisted: boolean;
  at: string;
}

/**
 * Pull the latest data from the active provider, persist it if a DB is
 * configured, and warm the cache. Safe to call from anywhere.
 */
export async function refresh(now: Date = new Date()): Promise<RefreshResult> {
  const provider = await getProvider();
  const raws = await provider.fetchAll(now);

  let persisted = false;
  if (hasDatabase()) {
    await upsertAll(raws, now);
    persisted = true;
  }

  await cache.set(RAW_CACHE_KEY, raws, 120);
  await cache.del(CACHE_KEYS.board);

  return {
    count: raws.length,
    source: provider.name,
    persisted,
    at: now.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// DB mapping
// ---------------------------------------------------------------------------

async function readFromDb(): Promise<RawIpo[] | null> {
  const prisma = await getPrisma();
  if (!prisma) return null;

  const rows = await prisma.ipo.findMany();
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    board: r.board,
    sourceStatus: r.status,
    priceMin: r.priceMin,
    priceMax: r.priceMax,
    lotSize: r.lotSize,
    issueSize: r.issueSize ?? undefined,
    gmp: r.gmp,
    subscription: {
      overall: r.subOverall,
      retail: r.subRetail,
      qib: r.subQib,
      nii: r.subNii,
    },
    listingPrice: r.listingPrice ?? null,
    openDate: r.openDate.toISOString(),
    closeDate: r.closeDate.toISOString(),
    listingDate: r.listingDate ? r.listingDate.toISOString() : null,
    source: r.source,
  }));
}

async function upsertAll(raws: RawIpo[], now: Date): Promise<void> {
  const prisma = await getPrisma();
  if (!prisma) return;

  await Promise.all(
    raws.map((raw) => {
      const status = deriveIpo(raw, 0, now).status;
      const data = {
        name: raw.name,
        board: raw.board,
        status,
        priceMin: raw.priceMin,
        priceMax: raw.priceMax,
        lotSize: raw.lotSize,
        issueSize: raw.issueSize ?? null,
        gmp: raw.gmp,
        subOverall: raw.subscription.overall,
        subRetail: raw.subscription.retail,
        subQib: raw.subscription.qib,
        subNii: raw.subscription.nii,
        listingPrice: raw.listingPrice ?? null,
        openDate: new Date(raw.openDate),
        closeDate: new Date(raw.closeDate),
        listingDate: raw.listingDate ? new Date(raw.listingDate) : null,
        source: raw.source,
      };
      return prisma.ipo.upsert({
        where: { slug: raw.slug },
        create: { slug: raw.slug, ...data },
        update: data,
      });
    }),
  );
}
