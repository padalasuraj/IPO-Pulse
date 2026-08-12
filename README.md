# IPO Pulse

IPO Pulse is a live Indian IPO dashboard built with Next.js, TypeScript,
Tailwind CSS, Prisma, and optional Redis/worker infrastructure.

The app is designed to be easy to explain:

1. A provider fetches raw IPO rows.
2. The service layer decides whether to use cache, database, or provider data.
3. A pure math layer derives profit, risk, status, and sort order.
4. The UI renders a dashboard with filters, stats, and a closing-today ticker.

> Informational only. This is not investment advice. GMP is unofficial and can
> be incomplete, unavailable, or wrong.

## Current Behavior

By default the app uses the `live` provider and shows only IPOs whose upstream
status is `OPEN`.

```text
DATA_PROVIDER=live
LIVE_IPO_API_URL=https://ipo-tracker-api-lxje.onrender.com
```

The live provider calls:

```text
/api/ipos?status=OPEN
```

and maps those rows into the app's internal `RawIpo` shape.

If the upstream API does not return GMP, the app treats GMP as `0`, so expected
listing gain and profit per lot will be `0` until GMP data exists.

## Quick Start

```powershell
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Useful commands:

```powershell
npm run dev       # local development server
npm run build     # production build
npm run lint      # Next.js lint
npm run db:push   # push Prisma schema to configured Postgres
npm run db:seed   # seed Postgres with sample data
npm run worker    # run the optional BullMQ refresh worker
```

## Project Structure

```text
ipo-pulse/
  docs/
    ARCHITECTURE.md          # Deeper system explanation

  prisma/
    schema.prisma            # Database schema for raw IPO rows
    seed.ts                  # Loads sample data into Postgres

  public/
    robots.txt

  src/
    app/                     # Next.js App Router pages and API routes
      api/
        ipos/                # GET live board data
        ipos/closing-today/  # GET IPOs closing today
        cron/refresh/        # Cron refresh endpoint
      globals.css            # Global Tailwind styles
      layout.tsx             # Root layout and fonts
      page.tsx               # Server-rendered home page

    components/              # UI components
      dashboard.tsx          # Client dashboard orchestration
      ipo-table.tsx          # Desktop table and mobile cards
      ipo-filters.tsx        # Search, board/status filters, sort
      emergency-ticker.tsx   # Closing-today ticker
      stat-cards.tsx         # Summary cards
      ipo-visuals.tsx        # Badges, meters, formatted cells
      ui/                    # Small reusable UI primitives

    data/
      ipos.seed.ts           # Demo fallback data

    lib/
      types.ts               # Domain types shared across app/server/worker
      ipo-math.ts            # Pure calculations and derived fields
      db.ts                  # Optional Prisma client
      redis.ts               # Optional Upstash cache
      utils.ts               # Formatting and class helpers

    server/
      ipo-service.ts         # Main read/refresh service
      data-provider/         # Swappable data sources
        index.ts             # Provider selector
        live-provider.ts     # Live OPEN IPO provider
        seed-provider.ts     # Local demo provider
        scraper-provider.ts  # Optional Playwright scraper template

    worker/
      queue.ts               # BullMQ queue setup
      worker.ts              # Optional always-on refresh worker
```

## Data Flow

```text
Browser
  |
  | loads /
  v
Next.js page.tsx
  |
  | calls getBoard()
  v
src/server/ipo-service.ts
  |
  | tries cache, then database, then active provider
  v
DataProvider
  |
  | live-provider maps external IPO API rows to RawIpo
  v
src/lib/ipo-math.ts
  |
  | derives status, lot value, profit, GMP %, risk, sorting
  v
Dashboard components
```

## Provider Options

Set `DATA_PROVIDER` in `.env`.

| Value | Meaning |
| --- | --- |
| `live` | Default. Calls `LIVE_IPO_API_URL` and keeps only upstream `OPEN` IPOs. |
| `seed` | Uses bundled demo data from `src/data/ipos.seed.ts`. |
| `scraper` | Uses the Playwright scraper template. Intended for a worker host, not Vercel. |

## Environment Variables

Copy `.env.example` to `.env` if you want local overrides.

| Variable | Purpose |
| --- | --- |
| `DATA_PROVIDER` | `live`, `seed`, or `scraper`. |
| `LIVE_IPO_API_URL` | Base URL for the live IPO API. |
| `DATABASE_URL` | Optional Postgres connection for persistence. |
| `UPSTASH_REDIS_REST_URL` | Optional Upstash REST Redis URL. |
| `UPSTASH_REDIS_REST_TOKEN` | Optional Upstash REST Redis token. |
| `REDIS_URL` | Optional TCP Redis URL for BullMQ worker. |
| `CRON_SECRET` | Optional secret protecting `/api/cron/refresh`. |

## API Routes

| Route | Purpose |
| --- | --- |
| `/api/ipos` | Returns the full enriched board. |
| `/api/ipos/closing-today` | Returns open IPOs whose close date is today. |
| `/api/cron/refresh` | Pulls fresh provider data, persists it if DB is configured, warms cache. |

## How Calculations Work

All derived display fields live in `src/lib/ipo-math.ts`.

```text
lotValue = priceMax * lotSize
expectedListingPrice = priceMax + gmp
profitPerLot = (expectedListingPrice - priceMax) * lotSize
profitPct = profitPerLot / lotValue * 100
gmpPct = gmp / priceMax * 100
```

Risk is a simple, transparent heuristic. It starts at `50` and adjusts based on:

- subscription demand
- GMP percentage
- whether the IPO is SME or mainboard
- whether demand data is missing

Higher risk means riskier. It is not a financial model.

## Deployment Notes

The Next.js app can deploy to Vercel.

The optional worker should run somewhere with a persistent process, such as
Railway, Render, Fly, or a VPS. Vercel serverless functions are not a good place
for Playwright scraping or a long-running BullMQ worker.

## Data Source Warning

The default live API is a convenient development source discovered from another
public demo app. This project does not own that API. For production, use your own
backend, an official/permitted feed, or an API you have permission to call.

## Financial Disclaimer

IPO Pulse is for education and portfolio demonstration. GMP is unofficial and
speculative. Expected listing gain, profit per lot, and risk score are
illustrative calculations, not predictions or advice.
