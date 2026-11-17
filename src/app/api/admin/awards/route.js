import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoAward } from "@/lib/mongodb";
import { INITIAL_AWARDS } from "@/lib/constants";

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
    const doc = await MongoAward.findOne().lean();

    if (doc && Array.isArray(doc.awards) && doc.awards.length > 0) {
      return NextResponse.json({ success: true, awards: doc.awards }, { headers: NO_CACHE_HEADERS });
    }

    // Auto-seed with INITIAL_AWARDS if none exist
    await MongoAward.findOneAndUpdate({}, { awards: INITIAL_AWARDS }, { upsert: true });
    return NextResponse.json({ success: true, awards: INITIAL_AWARDS }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error("[Admin Awards GET Error]:", e.message);
    return NextResponse.json({ success: true, awards: INITIAL_AWARDS }, { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    await connectToDatabase();
    const { awards } = await request.json();
    if (!Array.isArray(awards)) {
      return NextResponse.json({ success: false, error: "Awards must be an array" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    // Validate each award has title and value
    for (const item of awards) {
      if (!item.title || !item.value) {
        return NextResponse.json({ success: false, error: "Each award card must have a title and a value" }, { status: 400, headers: NO_CACHE_HEADERS });
      }
    }

    const sanitized = awards.map((item) => ({
      title: String(item.title).trim(),
      value: String(item.value).trim(),
      iconName: String(item.iconName || "emoji_events").trim()
    }));

    await MongoAward.findOneAndUpdate({}, { awards: sanitized }, { upsert: true });
    return NextResponse.json({ success: true, awards: sanitized }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error("[Admin Awards POST Error]:", e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
