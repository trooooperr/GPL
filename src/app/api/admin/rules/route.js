import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";
import { verifyAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  await dbReady;
  return NextResponse.json({
    success: true,
    rules: db.getRules()
  });
}

export async function POST(request) {
  await dbReady;
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rules } = await request.json();
    const updated = db.updateRules(rules);
    return NextResponse.json({ success: true, rules: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
