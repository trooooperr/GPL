import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoRule } from "@/lib/mongodb";
import { INITIAL_RULES, db } from "@/lib/db";
import mongoose from "mongoose";

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

  let rules = INITIAL_RULES;

  try {
    const conn = await connectToDatabase();
    if (conn && mongoose.connection.readyState === 1) {
      const doc = await MongoRule.findOne().lean();
      if (doc && Array.isArray(doc.rules) && doc.rules.length > 0) {
        rules = doc.rules;
      } else {
        // Auto-seed MongoDB with INITIAL_RULES so it is saved in DB
        await MongoRule.findOneAndUpdate({}, { rules: INITIAL_RULES }, { upsert: true }).catch(() => {});
        rules = INITIAL_RULES;
      }
    } else if (db && db.rules && db.rules.length > 0) {
      rules = db.rules;
    }
  } catch (e) {
    console.error("[Rules GET Fallback]:", e.message);
    if (db && db.rules && db.rules.length > 0) rules = db.rules;
  }

  return NextResponse.json({ success: true, rules }, { headers: NO_CACHE_HEADERS });
}

export async function POST(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    const { rules } = await request.json();
    if (!Array.isArray(rules)) {
      return NextResponse.json({ success: false, error: "Rules must be an array" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const conn = await connectToDatabase();
    if (conn && mongoose.connection.readyState === 1) {
      await MongoRule.findOneAndUpdate({}, { rules }, { upsert: true });
    }

    if (db) {
      db.rules = rules;
    }

    return NextResponse.json({ success: true, rules }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error("[Rules POST Error]:", e.message);
    if (db) {
      try {
        const { rules } = await request.json();
        db.rules = rules;
        return NextResponse.json({ success: true, rules }, { headers: NO_CACHE_HEADERS });
      } catch (err) {}
    }
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
