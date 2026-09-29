import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoRule } from "@/lib/mongodb";
import { INITIAL_RULES } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    await connectToDatabase();
    const doc = await MongoRule.findOne().lean();
    return NextResponse.json({ success: true, rules: doc?.rules || INITIAL_RULES });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    await connectToDatabase();
    const { rules } = await request.json();
    await MongoRule.findOneAndUpdate({}, { rules }, { upsert: true });
    return NextResponse.json({ success: true, rules });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
