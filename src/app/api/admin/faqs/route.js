import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoFaq } from "@/lib/mongodb";
import { INITIAL_FAQS } from "@/lib/constants";

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
    const doc = await MongoFaq.findOne().lean();

    if (doc && Array.isArray(doc.faqs) && doc.faqs.length > 0) {
      return NextResponse.json({ success: true, faqs: doc.faqs }, { headers: NO_CACHE_HEADERS });
    }

    // Auto-seed with INITIAL_FAQS if none exist
    await MongoFaq.findOneAndUpdate({}, { faqs: INITIAL_FAQS }, { upsert: true });
    return NextResponse.json({ success: true, faqs: INITIAL_FAQS }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error("[Admin FAQs GET Error]:", e.message);
    return NextResponse.json({ success: true, faqs: INITIAL_FAQS }, { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    await connectToDatabase();
    const { faqs } = await request.json();
    if (!Array.isArray(faqs)) {
      return NextResponse.json({ success: false, error: "FAQs must be an array" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    // Validate each FAQ has q and a
    for (const faq of faqs) {
      if (!faq.q || !faq.a) {
        return NextResponse.json({ success: false, error: "Each FAQ must have a question (q) and answer (a)" }, { status: 400, headers: NO_CACHE_HEADERS });
      }
    }

    await MongoFaq.findOneAndUpdate({}, { faqs }, { upsert: true });
    return NextResponse.json({ success: true, faqs }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error("[Admin FAQs POST Error]:", e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

