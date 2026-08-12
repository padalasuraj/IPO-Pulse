# Source Code Guide

Use this file as a map when explaining the code.

## Read In This Order

1. `lib/types.ts`
   - Defines the domain language: `RawIpo`, `Ipo`, board, status, risk.

2. `server/data-provider/index.ts`
   - Shows how the active data source is selected.

3. `server/data-provider/live-provider.ts`
   - Shows how live API rows are validated and mapped.

4. `server/ipo-service.ts`
   - Shows the app's main read and refresh pipeline.

5. `lib/ipo-math.ts`
   - Shows how raw data becomes UI-ready data.

6. `app/page.tsx`
   - Shows the server-rendered entry point.

7. `components/dashboard.tsx`
   - Shows client-side interaction: refresh, filters, search, sort.

## Folder Responsibilities

```text
app/
  Next.js routes. Keep route files thin. They should call services, not contain
  business logic.

components/
  React UI. Components should receive already-derived IPO data and focus on
  presentation or local dashboard interactions.

data/
  Static seed data for demos and fallback development.

lib/
  Shared code with no framework assumptions where possible. Types and math live
  here because server, UI, and worker can all use them.

server/
  Server-only services and provider adapters. This is where network/database
  decisions belong.

worker/
  Optional long-running background process. Keep this separate from the Next.js
  request/response path.
```

## Code Style Rules For This Project

- Keep raw provider data and derived UI data separate.
- Put formulas in `lib/ipo-math.ts`, not inside React components.
- Put external API mapping in provider files, not inside `ipo-service.ts`.
- Keep API routes small: validate request, call service, return JSON.
- Add comments only when they explain a decision or boundary.
