import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner (the shadcn `cn`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** ₹ with grouping, no decimals. e.g. 15000 -> "₹15,000" */
export function inr(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Compact ₹ for large numbers using the Indian lakh/crore scale isn't
 *  built into Intl, so we keep it simple and readable. */
export function inrCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  return inr(value);
}

/** e.g. 12.37 -> "12.4x" */
export function times(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value.toFixed(1)}x`;
}

/** e.g. 0.1834 already-as-percent 18.3 -> "+18.3%" with sign. */
export function signedPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/** Short date like "14 Aug". */
export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}
