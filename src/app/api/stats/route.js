import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";
import { connectToDatabase, MongoRegistration } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbReady;
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const regs = await MongoRegistration.find().lean();
      db.registrations = regs; // sync in-memory
    }
  } catch (e) {}

  return NextResponse.json({
    success: true,
    stats: db.getStats()
  }, {
    headers: { "Cache-Control": "no-store" }
  });
}
