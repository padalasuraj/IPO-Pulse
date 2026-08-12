// Core domain types. Kept framework-free so they can be shared by the
// Next app, the API routes and the BullMQ worker.

export type IpoBoard = "MAINBOARD" | "SME";
export type IpoStatus = "UPCOMING" | "OPEN" | "CLOSED" | "LISTED";
export type RiskBand = "LOW" | "MEDIUM" | "HIGH";

/**
 * Subscription figures, in "times subscribed" (e.g. 12.4 = 12.4x).
 * Any field may be null before the IPO opens.
 */
export interface Subscription {
  overall: number | null;
  retail: number | null;
  qib: number | null;
  nii: number | null;
}

/**
 * The raw, source-of-truth shape a DataProvider returns. Dates are ISO
 * strings so the shape is trivially serialisable across the wire and the
 * queue. Everything here is either observed or scraped; nothing is derived.
 */
export interface RawIpo {
  slug: string;
  name: string;
  board: IpoBoard;
  sourceStatus?: IpoStatus;
  priceMin: number;
  priceMax: number; // cut-off price
  lotSize: number; // shares per lot
  issueSize?: string;
  gmp: number; // INR per share, may be negative
  subscription: Subscription;
  listingPrice?: number | null; // realised, once listed
  openDate: string; // ISO
  closeDate: string; // ISO, last day to apply
  listingDate?: string | null; // ISO
  source: string;
}

/**
 * The enriched shape the UI consumes: raw fields + everything derived in
 * src/lib/ipo-math.ts (status, lot value, expected listing, profit, risk).
 */
export interface Ipo extends RawIpo {
  serial: number;
  status: IpoStatus;
  lotValue: number; // priceMax * lotSize
  expectedListingPrice: number; // priceMax + gmp (or listingPrice if listed)
  profitPerLot: number; // (expected - priceMax) * lotSize
  profitPct: number; // profitPerLot / lotValue * 100
  gmpPct: number; // gmp / priceMax * 100
  risk: number; // 0..100, higher = riskier
  riskBand: RiskBand;
  closesToday: boolean;
  daysToClose: number; // negative once closed
}
