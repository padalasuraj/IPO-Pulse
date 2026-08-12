import { NextResponse } from "next/server";
import { getClosingToday } from "@/server/ipo-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ipos = await getClosingToday();
    return NextResponse.json(
      { ipos, count: ipos.length, at: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[GET /api/ipos/closing-today]", err);
    return NextResponse.json({ error: "Failed to load closing IPOs" }, { status: 500 });
  }
}
