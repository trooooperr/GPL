import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbReady;
  try {
    const stats = db.getStats();
    return NextResponse.json({
      success: true,
      stats
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch tournament stats" },
      { status: 500 }
    );
  }
}
