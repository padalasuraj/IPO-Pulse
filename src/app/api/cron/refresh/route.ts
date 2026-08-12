import { NextResponse } from "next/server";
import { refresh } from "@/server/ipo-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Refreshes IPO data. Wired to Vercel Cron via vercel.json. On Vercel the
 * active provider should be `seed` or a fetch-based source — Playwright cannot
 * run in a serverless function, so heavy scraping belongs on the BullMQ worker
 * (src/worker). Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`
 * automatically once CRON_SECRET is set in project settings.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await refresh();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[GET /api/cron/refresh]", err);
    return NextResponse.json({ ok: false, error: "Refresh failed" }, { status: 500 });
  }
}
