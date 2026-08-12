import type { RawIpo } from "@/lib/types";

/**
 * Sample dataset used when DATA_PROVIDER=seed (the default). Dates are stored
 * as offsets in days from "now" and materialised at read time, so a couple of
 * IPOs are always "closing today" — the emergency ticker is never empty on a
 * fresh clone. The numbers are plausible but illustrative; do not read them
 * as real market data.
 */
interface SeedRecord {
  slug: string;
  name: string;
  board: RawIpo["board"];
  priceMin: number;
  priceMax: number;
  lotSize: number;
  issueSize: string;
  gmp: number;
  sub: { overall: number | null; retail: number | null; qib: number | null; nii: number | null };
  listingPrice?: number | null;
  openOffset: number;
  closeOffset: number;
  listingOffset: number;
}

const SEED: SeedRecord[] = [
  {
    slug: "zenith-fintech",
    name: "Zenith Fintech",
    board: "MAINBOARD",
    priceMin: 402,
    priceMax: 424,
    lotSize: 35,
    issueSize: "₹2,150 Cr",
    gmp: 172,
    sub: { overall: 48.2, retail: 62.4, qib: 41.1, nii: 55.7 },
    openOffset: -2,
    closeOffset: 0,
    listingOffset: 4,
  },
  {
    slug: "aster-logistics",
    name: "Aster Logistics",
    board: "MAINBOARD",
    priceMin: 118,
    priceMax: 124,
    lotSize: 120,
    issueSize: "₹640 Cr",
    gmp: 14,
    sub: { overall: 6.1, retail: 9.3, qib: 3.8, nii: 6.6 },
    openOffset: -1,
    closeOffset: 0,
    listingOffset: 5,
  },
  {
    slug: "nova-renewables",
    name: "Nova Renewables",
    board: "MAINBOARD",
    priceMin: 555,
    priceMax: 585,
    lotSize: 25,
    issueSize: "₹1,480 Cr",
    gmp: 96,
    sub: { overall: 14.7, retail: 11.2, qib: 22.9, nii: 12.4 },
    openOffset: -2,
    closeOffset: 1,
    listingOffset: 6,
  },
  {
    slug: "kritika-foods",
    name: "Kritika Foods",
    board: "SME",
    priceMin: 92,
    priceMax: 97,
    lotSize: 1200,
    issueSize: "₹58 Cr",
    gmp: 8,
    sub: { overall: 2.3, retail: 3.1, qib: 1.2, nii: 2.0 },
    openOffset: -1,
    closeOffset: 2,
    listingOffset: 7,
  },
  {
    slug: "meridian-cables",
    name: "Meridian Cables",
    board: "SME",
    priceMin: 143,
    priceMax: 148,
    lotSize: 800,
    issueSize: "₹74 Cr",
    gmp: -12,
    sub: { overall: 0.7, retail: 1.1, qib: 0.2, nii: 0.5 },
    openOffset: -1,
    closeOffset: 2,
    listingOffset: 8,
  },
  {
    slug: "helios-semicon",
    name: "Helios Semicon",
    board: "MAINBOARD",
    priceMin: 720,
    priceMax: 760,
    lotSize: 19,
    issueSize: "₹3,300 Cr",
    gmp: 210,
    sub: { overall: null, retail: null, qib: null, nii: null },
    openOffset: 2,
    closeOffset: 4,
    listingOffset: 9,
  },
  {
    slug: "orbit-aerospace",
    name: "Orbit Aerospace",
    board: "SME",
    priceMin: 210,
    priceMax: 220,
    lotSize: 600,
    issueSize: "₹132 Cr",
    gmp: 34,
    sub: { overall: null, retail: null, qib: null, nii: null },
    openOffset: 3,
    closeOffset: 5,
    listingOffset: 10,
  },
  {
    slug: "sagar-ceramics",
    name: "Sagar Ceramics",
    board: "MAINBOARD",
    priceMin: 88,
    priceMax: 93,
    lotSize: 160,
    issueSize: "₹410 Cr",
    gmp: 6,
    sub: { overall: null, retail: null, qib: null, nii: null },
    openOffset: 1,
    closeOffset: 3,
    listingOffset: 8,
  },
  {
    slug: "crest-pharma",
    name: "Crest Pharma",
    board: "MAINBOARD",
    priceMin: 480,
    priceMax: 505,
    lotSize: 29,
    issueSize: "₹1,900 Cr",
    gmp: 128,
    sub: { overall: 71.5, retail: 54.2, qib: 92.7, nii: 61.9 },
    openOffset: -4,
    closeOffset: -1,
    listingOffset: 2,
  },
  {
    slug: "vanta-textiles",
    name: "Vanta Textiles",
    board: "SME",
    priceMin: 55,
    priceMax: 58,
    lotSize: 2000,
    issueSize: "₹41 Cr",
    gmp: 3,
    sub: { overall: 4.9, retail: 7.2, qib: 2.1, nii: 4.4 },
    openOffset: -5,
    closeOffset: -2,
    listingOffset: 1,
  },
  {
    slug: "northwind-energy",
    name: "Northwind Energy",
    board: "MAINBOARD",
    priceMin: 315,
    priceMax: 330,
    lotSize: 45,
    issueSize: "₹2,600 Cr",
    gmp: 120,
    sub: { overall: 88.2, retail: 60.5, qib: 110.3, nii: 74.8 },
    listingPrice: 462,
    openOffset: -12,
    closeOffset: -9,
    listingOffset: -3,
  },
  {
    slug: "pioneer-motors",
    name: "Pioneer Motors",
    board: "MAINBOARD",
    priceMin: 205,
    priceMax: 215,
    lotSize: 69,
    issueSize: "₹880 Cr",
    gmp: -8,
    sub: { overall: 3.1, retail: 4.8, qib: 1.4, nii: 2.6 },
    listingPrice: 191,
    openOffset: -14,
    closeOffset: -11,
    listingOffset: -4,
  },
];

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

/** Materialise the seed records into RawIpo[] relative to `now`. */
export function getSeedIpos(now: Date = new Date()): RawIpo[] {
  return SEED.map((s) => ({
    slug: s.slug,
    name: s.name,
    board: s.board,
    priceMin: s.priceMin,
    priceMax: s.priceMax,
    lotSize: s.lotSize,
    issueSize: s.issueSize,
    gmp: s.gmp,
    subscription: {
      overall: s.sub.overall,
      retail: s.sub.retail,
      qib: s.sub.qib,
      nii: s.sub.nii,
    },
    listingPrice: s.listingPrice ?? null,
    openDate: addDays(now, s.openOffset),
    closeDate: addDays(now, s.closeOffset),
    listingDate: addDays(now, s.listingOffset),
    source: "seed",
  }));
}
