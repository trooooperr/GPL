import { NextResponse } from "next/server";
import { connectToDatabase, MongoAudit } from "@/lib/mongodb";
import { verifyAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const logs = await MongoAudit.find().sort({ createdAt: -1 }).limit(100).lean();
    return NextResponse.json({
      success: true,
      logs: logs || []
    });
  } catch (e) {
    return NextResponse.json({ success: true, logs: [] });
  }
}
