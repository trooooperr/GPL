import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoRegistration } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const players = await MongoRegistration.find().lean();
    
    const tshirtSizes = {};
    const trackSizes = {};

    players.forEach((p) => {
      const ts = p.tshirtSize || "Not specified";
      const trk = p.trackSize || "Not specified";
      tshirtSizes[ts] = (tshirtSizes[ts] || 0) + 1;
      trackSizes[trk] = (trackSizes[trk] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      matrix: {
        tshirts: tshirtSizes,
        tracks: trackSizes,
        total: players.length
      }
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
