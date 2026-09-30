import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoRule } from "@/lib/mongodb";
import { INITIAL_RULES } from "@/lib/db";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

export async function GET(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  try {
    await connectToDatabase();
    const doc = await MongoRule.findOne().lean();
    return NextResponse.json({ success: true, rules: doc?.rules || INITIAL_RULES }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  try {
    await connectToDatabase();
    const { rules } = await request.json();
    await MongoRule.findOneAndUpdate({}, { rules }, { upsert: true });
    return NextResponse.json({ success: true, rules }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
