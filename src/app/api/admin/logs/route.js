import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";
import { verifyAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  await dbReady;
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    logs: db.getAuditLogs()
  });
}
