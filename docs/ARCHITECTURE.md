# Architecture

This document explains how IPO Pulse is organized and how data moves through the
system.

## High-Level System

```text
                  +----------------------+
                  | Browser              |
                  | React dashboard      |
                  +----------+-----------+
                             |
                             | GET / or /api/ipos
                             v
                  +----------------------+
                  | Next.js App Router   |
                  | pages + API routes   |
                  +----------+-----------+
                             |
                             | getBoard() / refresh()
                             v
                  +----------------------+
                  | IPO service          |
                  | cache -> DB -> source|
                  +----+-----------+-----+
                       |           |
             optional  |           | active provider
                       v           v
              +-------------+   +------------------+
              | Redis cache |   | DataProvider     |
              +-------------+   | live/seed/scrape |
                                +--------+---------+
                                         |
                                         v
                                +------------------+
                                | ipo-math.ts      |
                                | derived fields   |
                                +------------------+
```

## The Main Boundary: Raw Data vs Derived Data

The app keeps a clean separation between raw observed data and calculated UI
data.

`RawIpo` is the source-of-truth shape:

- company name
- board
- price band
- lot size
- GMP
- subscription
- dates
- source

`Ipo` is the enriched shape used by the UI:

- status
- lot value
- expected listing price
- profit per lot
- GMP percentage
- risk score
- closing-today flag

This split matters because formulas can change without database migrations and
without changing every component.

## Key Modules

### `src/server/data-provider`

Providers are adapters. They all implement the same interface:

```ts
interface DataProvider {
  readonly name: string;
  fetchAll(now?: Date): Promise<RawIpo[]>;
}
```

Current providers:

- `live-provider.ts`: calls the live IPO API and keeps only OPEN IPOs.
- `seed-provider.ts`: returns demo data for offline development.
- `scraper-provider.ts`: template for a permitted Playwright scraper.

### `src/server/ipo-service.ts`

This is the main data service.

Read path:

1. Try Redis raw-record cache.
2. Try Postgres if `DATABASE_URL` exists.
3. Fall back to the active provider.
4. Recalculate derived fields every request.

Refresh path:

1. Fetch from active provider.
2. Upsert into Postgres if configured.
3. Warm Redis cache.
4. Return a small refresh summary.

### `src/lib/ipo-math.ts`

This file is deliberately pure. It does not call the network, database, Redis,
or React. That makes the business logic easy to explain and test.

Responsibilities:

- derive status
- compute lot value
- compute estimated listing and profit
- compute risk score
- sort the board
- assign serial numbers

### `src/components`

The UI is split by job:

- `dashboard.tsx`: owns client-side state and refresh behavior.
- `stat-cards.tsx`: top summary cards.
- `emergency-ticker.tsx`: closing-today rail.
- `ipo-filters.tsx`: search, filters, and sort controls.
- `ipo-table.tsx`: desktop table and mobile cards.
- `ipo-visuals.tsx`: shared badges, meters, and formatted display pieces.

## Why Providers Exist

IPO data sources are unstable:

- NSE subscription data can change during the day.
- GMP is unofficial and may not be available.
- Scraping targets can change HTML or block automated access.
- A paid API may replace a free source later.

The provider interface isolates those changes. If the source changes, update or
add one provider. The UI, service layer, and math layer should not need to know.

## Live IPO Data

The current live provider calls:

```text
https://ipo-tracker-api-lxje.onrender.com/api/ipos?status=OPEN
```

It validates the response with Zod, maps each row into `RawIpo`, and ignores any
row that is not usable for the dashboard.

Rows are skipped when:

- status is not `OPEN`
- `price_band_max` is missing or non-positive
- `lot_size` is missing or non-positive

The provider trusts upstream status using `sourceStatus`, because upstream data
may know market state better than a date-only calculation.

## Optional Database

Postgres stores only raw/mutable fields. Derived values are recalculated at read
time.

This means:

- formula changes do not require migrations
- displayed status can stay current
- the database stays close to source data

## Optional Cache

Upstash Redis caches raw IPO rows briefly. The cache is intentionally optional:

- missing Redis variables mean no-op cache
- cache failures are ignored
- the app can still read provider or DB data

## Optional Worker

The BullMQ worker is for always-on refresh jobs.

Use it when you want a background process to refresh data into Postgres on a
schedule. Do not run the worker on Vercel serverless.

## Explanation Script

For a quick verbal explanation:

"IPO Pulse is a Next.js IPO dashboard. The data source is hidden behind a
DataProvider adapter, so live API data, seed data, or a scraper can all feed the
same service. The service reads raw IPO rows from cache, Postgres, or the active
provider, then `ipo-math.ts` derives the numbers the UI needs. The dashboard is
client-side for search, filters, sorting, and refresh, while the initial page is
server-rendered."
