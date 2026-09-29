import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { db, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  await dbReady;
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const matrix = db.getSizingMatrix();
  return NextResponse.json({ success: true, matrix });
}
