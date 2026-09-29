import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoSetting } from "@/lib/mongodb";
import { INITIAL_SETTINGS } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    await connectToDatabase();
    const doc = await MongoSetting.findOne({ key: "global_settings" }).lean();
    const settings = doc?.value || INITIAL_SETTINGS;
    return NextResponse.json({ success: true, settings });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    await connectToDatabase();
    const body = await request.json();
    const existing = await MongoSetting.findOne({ key: "global_settings" }).lean();
    const merged = { ...(existing?.value || INITIAL_SETTINGS), ...body };
    await MongoSetting.findOneAndUpdate(
      { key: "global_settings" },
      { key: "global_settings", value: merged },
      { upsert: true }
    );
    return NextResponse.json({ success: true, settings: merged });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
