import { z } from "zod";
import { getSeedIpos } from "@/data/ipos.seed";
import type { RawIpo } from "@/lib/types";
import type { DataProvider } from "./index";

/**
 * Playwright-based scraper provider (TEMPLATE).
 *
 * IMPORTANT CONTEXT — READ BEFORE ENABLING
 * ----------------------------------------
 * There is no official, licensable API for Grey Market Premium (GMP). Sites
 * that show GMP publish unofficial, speculative numbers. Before you point this
 * at any site:
 *   1. Read that site's Terms of Service and robots.txt and respect them.
 *   2. Prefer an official/permitted data source if one exists for your use.
 *   3. Throttle hard, cache aggressively, and identify your bot honestly.
 *   4. Treat GMP as rumour, not fact (see the disclaimer in the UI).
 *
 * This provider is a *shape* to fill in, not a turnkey scraper for a specific
 * property. It reads a URL from SCRAPE_URL and expects YOU to write the
 * page-level extraction in `extractRecords`. On any failure it falls back to
 * seed data so the pipeline degrades gracefully instead of crashing.
 *
 * Playwright is intentionally NOT a dependency in package.json (it pulls large
 * browser binaries). Install it only on the worker host:
 *   npm i -D playwright && npx playwright install chromium
 */

const RawIpoSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  board: z.enum(["MAINBOARD", "SME"]),
  priceMin: z.number(),
  priceMax: z.number(),
  lotSize: z.number(),
  issueSize: z.string().optional(),
  gmp: z.number(),
  subscription: z.object({
    overall: z.number().nullable(),
    retail: z.number().nullable(),
    qib: z.number().nullable(),
    nii: z.number().nullable(),
  }),
  listingPrice: z.number().nullable().optional(),
  openDate: z.string(),
  closeDate: z.string(),
  listingDate: z.string().nullable().optional(),
  source: z.string(),
});

export class ScraperProvider implements DataProvider {
  readonly name = "scraper";

  async fetchAll(now: Date = new Date()): Promise<RawIpo[]> {
    const url = process.env.SCRAPE_URL;
    if (!url) {
      console.warn("[scraper] SCRAPE_URL not set — falling back to seed data.");
      return getSeedIpos(now);
    }

    // Untyped on purpose: playwright is not a dependency of this project (it
    // pulls large browser binaries), so we must not reference its types at
    // compile time. It is required dynamically only on the worker host.
    let playwright: any;
    try {
      const importRuntime = new Function("specifier", "return import(specifier)") as (
        specifier: string,
      ) => Promise<any>;
      playwright = await importRuntime("playwright");
    } catch {
      console.warn(
        "[scraper] Playwright is not installed. Run `npm i -D playwright && npx playwright install chromium`. Falling back to seed data.",
      );
      return getSeedIpos(now);
    }

    const browser = await playwright.chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({
        userAgent: "IPOPulseBot/1.0 (+https://your-domain.example/bot)",
      });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });

      const rows = await this.extractRecords(page);
      const parsed = z.array(RawIpoSchema).safeParse(rows);
      if (!parsed.success) {
        console.warn("[scraper] extracted rows failed validation:", parsed.error.issues.slice(0, 3));
        return getSeedIpos(now);
      }
      if (parsed.data.length === 0) return getSeedIpos(now);
      return parsed.data;
    } catch (err) {
      console.error("[scraper] scrape failed, using seed data:", err);
      return getSeedIpos(now);
    } finally {
      await browser.close();
    }
  }

  /**
   * FILL THIS IN for your permitted source. Everything inside page.evaluate
   * runs in the browser, so map the DOM to the RawIpo shape there. The stub
   * returns an empty array, which triggers the seed fallback above.
   */
  private async extractRecords(page: any): Promise<unknown[]> {
    return page.evaluate(() => {
      // Example skeleton — replace selectors with your source's structure.
      //
      // const toNum = (s: string) => Number(String(s).replace(/[^0-9.-]/g, "")) || 0;
      // return Array.from(document.querySelectorAll("table.ipo-gmp tbody tr")).map((tr) => {
      //   const c = tr.querySelectorAll("td");
      //   const name = c[0]?.textContent?.trim() ?? "";
      //   return {
      //     slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      //     name,
      //     board: "MAINBOARD",
      //     priceMin: 0, priceMax: toNum(c[1]?.textContent ?? ""),
      //     lotSize: toNum(c[2]?.textContent ?? ""),
      //     gmp: toNum(c[3]?.textContent ?? ""),
      //     subscription: { overall: null, retail: null, qib: null, nii: null },
      //     openDate: new Date().toISOString(),
      //     closeDate: new Date().toISOString(),
      //     source: "scraper",
      //   };
      // });
      return [] as unknown[];
    });
  }
}
