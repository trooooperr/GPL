import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoSetting } from "@/lib/mongodb";
import { INITIAL_SETTINGS, db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

export async function GET(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    await connectToDatabase();
    const doc = await MongoSetting.findOne({ key: "global_settings" }).lean();
    const settings = { ...INITIAL_SETTINGS, ...(doc?.value || {}) };
    return NextResponse.json({ success: true, settings }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    await connectToDatabase();
    const body = await request.json();
    const existing = await MongoSetting.findOne({ key: "global_settings" }).lean();
    const merged = { ...INITIAL_SETTINGS, ...(existing?.value || {}), ...body };

    await MongoSetting.findOneAndUpdate(
      { key: "global_settings" },
      { key: "global_settings", value: merged },
      { upsert: true }
    );

    if (db) {
      db.settings = merged;
    }

    return NextResponse.json({ success: true, settings: merged }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
