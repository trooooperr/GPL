import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoRegistration, MongoTeam } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    // Only include sold/assigned players to teams
    const [soldPlayers, teams] = await Promise.all([
      MongoRegistration.find(
        { teamId: { $ne: null, $nin: ["", "unassign", null] } },
        "id regNumber name phone ward speciality tshirtSize trackSize teamId soldPrice"
      ).lean(),
      MongoTeam.find().lean()
    ]);

    const tshirtSizes = {};
    const trackSizes = {};

    const teamMap = {};
    (teams || []).forEach((t) => {
      teamMap[t.id] = {
        id: t.id,
        name: t.name,
        shortCode: t.shortCode,
        themeColor: t.themeColor || "#0041b9",
        logo: t.logo?.startsWith("data:") ? `/api/team-logo?id=${t.id}` : (t.logo || "/images/teams/team-csk.png"),
        players: [],
        tshirts: {},
        tracks: {},
        total: 0
      };
    });

    (soldPlayers || []).forEach((p) => {
      const ts = p.tshirtSize || "Not specified";
      const trk = p.trackSize || "Not specified";

      tshirtSizes[ts] = (tshirtSizes[ts] || 0) + 1;
      trackSizes[trk] = (trackSizes[trk] || 0) + 1;

      if (!teamMap[p.teamId]) {
        teamMap[p.teamId] = {
          id: p.teamId,
          name: p.teamId,
          shortCode: p.teamId,
          themeColor: "#0041b9",
          logo: "/images/teams/team-csk.png",
          players: [],
          tshirts: {},
          tracks: {},
          total: 0
        };
      }

      teamMap[p.teamId].players.push({
        id: p.id,
        regNumber: p.regNumber || p.id,
        name: p.name,
        phone: p.phone,
        ward: p.ward,
        speciality: p.speciality,
        tshirtSize: ts,
        trackSize: trk,
        soldPrice: Number(p.soldPrice) || 0
      });

      teamMap[p.teamId].tshirts[ts] = (teamMap[p.teamId].tshirts[ts] || 0) + 1;
      teamMap[p.teamId].tracks[trk] = (teamMap[p.teamId].tracks[trk] || 0) + 1;
      teamMap[p.teamId].total += 1;
    });

    return NextResponse.json({
      success: true,
      matrix: {
        tshirts: tshirtSizes,
        tracks: trackSizes,
        total: (soldPlayers || []).length
      },
      teams: Object.values(teamMap)
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
