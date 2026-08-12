import type { Ipo, IpoStatus, RawIpo, RiskBand } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight-normalised whole-day difference (target - reference). */
function daysBetween(target: Date, reference: Date): number {
  const a = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const b = Date.UTC(reference.getFullYear(), reference.getMonth(), reference.getDate());
  return Math.round((a - b) / DAY_MS);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Derive status purely from the calendar so the board is always current. */
function deriveStatus(raw: RawIpo, now: Date): IpoStatus {
  if (raw.sourceStatus) return raw.sourceStatus;

  const open = new Date(raw.openDate);
  const close = new Date(raw.closeDate);
  const listing = raw.listingDate ? new Date(raw.listingDate) : null;

  if (now < open) return "UPCOMING";
  if (now <= endOfDay(close)) return "OPEN";
  if (listing && now >= startOfDay(listing)) return "LISTED";
  return "CLOSED"; // between close and listing (allotment / pre-listing)
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function bandFor(risk: number): RiskBand {
  if (risk < 34) return "LOW";
  if (risk < 67) return "MEDIUM";
  return "HIGH";
}

/**
 * A transparent, deliberately-naive risk heuristic. This is NOT a model of
 * actual investment risk and is not financial advice — it just turns the
 * signals a retail applicant already eyeballs (how heavily subscribed, how
 * fat the grey-market premium, mainboard vs SME) into a single 0..100 read
 * where higher = riskier.
 *
 * Anchored at 50 (neutral), then nudged:
 *   - heavier subscription  -> lower risk (demand is a cushion)
 *   - larger positive GMP    -> lower risk; negative GMP -> higher risk
 *   - SME issues             -> higher risk (thinner, more volatile)
 *   - not yet open (no subs) -> mild uncertainty bump
 */
export function computeRisk(raw: RawIpo): number {
  let risk = 50;

  const sub = raw.subscription.overall;
  if (sub == null) {
    risk += 6; // no demand signal yet
  } else if (sub >= 50) risk -= 26;
  else if (sub >= 10) risk -= 18;
  else if (sub >= 3) risk -= 10;
  else if (sub >= 1) risk -= 2;
  else risk += 22; // undersubscribed

  const gmpPct = raw.priceMax > 0 ? (raw.gmp / raw.priceMax) * 100 : 0;
  if (gmpPct >= 40) risk -= 20;
  else if (gmpPct >= 20) risk -= 12;
  else if (gmpPct >= 5) risk -= 6;
  else if (gmpPct >= 0) risk += 0;
  else risk += 25; // discount to issue price in the grey market

  if (raw.board === "SME") risk += 12;

  return Math.round(clamp(risk, 2, 98));
}

/** Enrich a single raw IPO with every derived figure the UI needs. */
export function deriveIpo(raw: RawIpo, serial: number, now: Date = new Date()): Ipo {
  const status = deriveStatus(raw, now);

  const lotValue = raw.priceMax * raw.lotSize;

  // Once listed we know the real listing price; otherwise estimate from GMP.
  const expectedListingPrice =
    status === "LISTED" && raw.listingPrice != null
      ? raw.listingPrice
      : raw.priceMax + raw.gmp;

  const profitPerLot = (expectedListingPrice - raw.priceMax) * raw.lotSize;
  const profitPct = lotValue > 0 ? (profitPerLot / lotValue) * 100 : 0;
  const gmpPct = raw.priceMax > 0 ? (raw.gmp / raw.priceMax) * 100 : 0;

  const risk = computeRisk(raw);
  const close = new Date(raw.closeDate);

  return {
    ...raw,
    serial,
    status,
    lotValue,
    expectedListingPrice,
    profitPerLot,
    profitPct,
    gmpPct,
    risk,
    riskBand: bandFor(risk),
    closesToday: isSameDay(close, now) && status === "OPEN",
    daysToClose: daysBetween(close, now),
  };
}

/**
 * Sort for the main board: live/urgent first, then by soonest close, then by
 * fattest expected profit. Serial numbers are assigned after sorting so the
 * "S.No" column reflects the order the user actually sees.
 */
const STATUS_RANK: Record<IpoStatus, number> = {
  OPEN: 0,
  UPCOMING: 1,
  CLOSED: 2,
  LISTED: 3,
};

export function buildBoard(raws: RawIpo[], now: Date = new Date()): Ipo[] {
  const enriched = raws
    .map((r) => deriveIpo(r, 0, now))
    .sort((a, b) => {
      if (STATUS_RANK[a.status] !== STATUS_RANK[b.status]) {
        return STATUS_RANK[a.status] - STATUS_RANK[b.status];
      }
      if (a.status === "OPEN" || a.status === "UPCOMING") {
        // soonest to close/open first
        const at = new Date(a.closeDate).getTime();
        const bt = new Date(b.closeDate).getTime();
        if (at !== bt) return at - bt;
      }
      return b.profitPerLot - a.profitPerLot;
    });

  // assign serials in display order
  return enriched.map((ipo, i) => ({ ...ipo, serial: i + 1 }));
}
