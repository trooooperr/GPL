import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoRule } from "@/lib/mongodb";
import { INITIAL_RULES } from "@/lib/constants";

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
    const doc = await MongoRule.findOne().lean();
    
    if (doc && Array.isArray(doc.rules) && doc.rules.length > 0) {
      return NextResponse.json({ success: true, rules: doc.rules }, { headers: NO_CACHE_HEADERS });
    }
    
    // Auto-seed MongoDB with INITIAL_RULES if no rules exist
    await MongoRule.findOneAndUpdate({}, { rules: INITIAL_RULES }, { upsert: true });
    return NextResponse.json({ success: true, rules: INITIAL_RULES }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error("[Admin Rules GET Error]:", e.message);
    return NextResponse.json({ success: true, rules: INITIAL_RULES }, { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    await connectToDatabase();
    const { rules } = await request.json();
    if (!Array.isArray(rules)) {
      return NextResponse.json({ success: false, error: "Rules must be an array" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    await MongoRule.findOneAndUpdate({}, { rules }, { upsert: true });
    return NextResponse.json({ success: true, rules }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error("[Admin Rules POST Error]:", e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
