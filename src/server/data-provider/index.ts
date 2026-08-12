import type { RawIpo } from "@/lib/types";
import { LiveIpoProvider } from "./live-provider";
import { SeedProvider } from "./seed-provider";

/**
 * A DataProvider is anything that can hand back a list of raw IPOs. The rest
 * of the app only ever talks to this interface, so swapping the *source* of
 * GMP / subscription data (seed fixtures, a scraper, a paid feed, a partner
 * API) never touches the service, the API routes or the UI.
 */
export interface DataProvider {
  readonly name: string;
  fetchAll(now?: Date): Promise<RawIpo[]>;
}

/**
 * Pick a provider from env.
 *   live    -> live open IPOs from the configured IPO API (default)
 *   seed    -> bundled fixtures (works everywhere incl. Vercel)
 *   scraper -> Playwright scraper (worker host only; loaded lazily)
 */
export async function getProvider(): Promise<DataProvider> {
  const kind = (process.env.DATA_PROVIDER ?? "live").toLowerCase();

  if (kind === "scraper") {
    // Dynamic import so Playwright is never bundled into the Next serverless
    // output and is only required on the machine that actually scrapes.
    const { ScraperProvider } = await import("./scraper-provider");
    return new ScraperProvider();
  }

  if (kind === "seed") {
    return new SeedProvider();
  }

  if (kind !== "live") {
    console.warn(`[data-provider] unknown DATA_PROVIDER="${kind}", using live provider.`);
  }

  return new LiveIpoProvider();
}
