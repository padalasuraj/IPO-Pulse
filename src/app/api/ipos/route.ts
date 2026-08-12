import { NextResponse } from "next/server";
import { getBoard } from "@/server/ipo-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ipos = await getBoard();
    return NextResponse.json(
      { ipos, count: ipos.length, at: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[GET /api/ipos]", err);
    return NextResponse.json({ error: "Failed to load IPOs" }, { status: 500 });
  }
}
