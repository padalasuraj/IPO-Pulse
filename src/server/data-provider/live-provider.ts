import { z } from "zod";
import type { IpoBoard, IpoStatus, RawIpo, Subscription } from "@/lib/types";
import type { DataProvider } from "./index";

const DEFAULT_API_BASE = "https://ipo-tracker-api-lxje.onrender.com";

const ExternalIpoSchema = z.object({
  symbol: z.string().min(1),
  company_name: z.string().min(1),
  board: z.enum(["MAINBOARD", "SME"]),
  status: z.enum(["UPCOMING", "OPEN", "CLOSED", "LISTED"]),
  open_date: z.string().nullable().optional(),
  close_date: z.string().nullable().optional(),
  listing_date: z.string().nullable().optional(),
  price_band_min: z.number().nullable().optional(),
  price_band_max: z.number().nullable().optional(),
  lot_size: z.number().int().nullable().optional(),
  issue_size: z.number().nullable().optional(),
  subscription: z.record(z.number().nullable()).default({}),
  gmp: z
    .object({
      gmp_value: z.number().nullable().optional(),
      estimated_listing_price: z.number().nullable().optional(),
      source: z.string().optional(),
    })
    .nullable()
    .optional(),
});

type ExternalIpo = z.infer<typeof ExternalIpoSchema>;

function dateOnlyToIso(date: string | null | undefined): string {
  if (!date) return new Date().toISOString();
  return `${date}T00:00:00.000+05:30`;
}

function mapSubscription(subscription: ExternalIpo["subscription"]): Subscription {
  return {
    overall: subscription.TOTAL ?? null,
    retail: subscription.RETAIL ?? null,
    qib: subscription.QIB ?? null,
    nii: subscription.NII ?? null,
  };
}

function mapExternalIpo(row: ExternalIpo): RawIpo | null {
  if (row.status !== "OPEN") return null;
  if (row.price_band_max == null || row.price_band_max <= 0) return null;
  if (row.lot_size == null || row.lot_size <= 0) return null;

  const gmpValue = row.gmp?.gmp_value ?? 0;
  const source = row.gmp?.source ? `live:${row.gmp.source}` : "live:ipo-tracker-api";

  return {
    slug: row.symbol.toLowerCase(),
    name: row.company_name,
    board: row.board as IpoBoard,
    sourceStatus: row.status as IpoStatus,
    priceMin: row.price_band_min ?? row.price_band_max,
    priceMax: row.price_band_max,
    lotSize: row.lot_size,
    issueSize: row.issue_size == null ? undefined : `${row.issue_size.toLocaleString("en-IN")} shares`,
    gmp: gmpValue,
    subscription: mapSubscription(row.subscription),
    listingPrice: null,
    openDate: dateOnlyToIso(row.open_date),
    closeDate: dateOnlyToIso(row.close_date),
    listingDate: row.listing_date ? dateOnlyToIso(row.listing_date) : null,
    source,
  };
}

export class LiveIpoProvider implements DataProvider {
  readonly name = "live";

  async fetchAll(): Promise<RawIpo[]> {
    const base = process.env.LIVE_IPO_API_URL ?? DEFAULT_API_BASE;
    const url = `${base.replace(/\/$/, "")}/api/ipos?status=OPEN`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`[live-provider] ${url} returned ${res.status} ${res.statusText}`);
    }

    const parsed = z.array(ExternalIpoSchema).safeParse(await res.json());
    if (!parsed.success) {
      throw new Error(`[live-provider] invalid IPO payload: ${parsed.error.message}`);
    }

    return parsed.data.map(mapExternalIpo).filter((ipo): ipo is RawIpo => ipo != null);
  }
}
