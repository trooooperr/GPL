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
    settings: db.getSettings()
  });
}

export async function POST(request) {
  await dbReady;
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = db.updateSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
