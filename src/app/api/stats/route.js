import { NextResponse } from "next/server";
import { connectToDatabase, MongoRegistration, MongoTeam, MongoSetting } from "@/lib/mongodb";
import { INITIAL_SETTINGS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

export async function GET() {
  try {
    await connectToDatabase();
    const [counts, totalTeamsCount, settingDoc] = await Promise.all([
      MongoRegistration.aggregate([
        { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }
      ]),
      MongoTeam.countDocuments(),
      MongoSetting.findOne({ key: "global_settings" }).lean(),
    ]);

    const settings = { ...INITIAL_SETTINGS, ...(settingDoc?.value || {}) };
    let total = 0;
    let approved = 0;
    let rejected = 0;
    let pending = 0;

    (counts || []).forEach((c) => {
      const cnt = c.count || 0;
      total += cnt;
      if (c._id === "Approved") approved = cnt;
      else if (c._id === "Rejected") rejected = cnt;
      else if (c._id === "Pending") pending = cnt;
    });

    const totalTeams = totalTeamsCount || 11;
    const cap = totalTeams * 14;

    return NextResponse.json({
      success: true,
      stats: {
        totalRegistrations: total,
        totalRegistered: total,
        approved,
        rejected,
        pending,
        available: Math.max(0, cap - approved),
        remainingSlots: Math.max(0, cap - approved),
        totalTeams,
        maxCapacity: cap,
        registrationFee: settings.registrationFee || 100,
        upiId: settings.upiId || "shahbazkhandm@okhdfcbank"
      },
      settings
    }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    return NextResponse.json({
      success: true,
      stats: {
        totalRegistrations: 0,
        totalRegistered: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        available: 140,
        remainingSlots: 140,
        totalTeams: 10,
        maxCapacity: 140,
        registrationFee: 100,
        upiId: "shahbazkhandm@okhdfcbank"
      }
    }, { headers: NO_CACHE_HEADERS });
  }
}
