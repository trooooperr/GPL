import { NextResponse } from "next/server";
import { connectToDatabase, MongoRegistration } from "@/lib/mongodb";
import { INITIAL_SETTINGS } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const players = await MongoRegistration.find().lean();
    const total = players.length;
    const approved = players.filter(p => p.paymentStatus === "Approved").length;
    const rejected = players.filter(p => p.paymentStatus === "Rejected").length;
    const pending = players.filter(p => p.paymentStatus === "Pending").length;
    return NextResponse.json({
      success: true,
      stats: { totalRegistrations: total, approved, rejected, pending, available: 140 - approved }
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ success: true, stats: { totalRegistrations: 0, approved: 0, rejected: 0, pending: 0, available: 140 } });
  }
}
