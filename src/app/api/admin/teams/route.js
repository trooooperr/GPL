import { NextResponse } from "next/server";
import { db, dbReady, INITIAL_TEAMS } from "@/lib/db";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoTeam, MongoRegistration } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

async function getPopulatedTeams() {
  await connectToDatabase();
  const [mongoTeams, mongoRegs] = await Promise.all([
    MongoTeam.find().lean(),
    MongoRegistration.find().lean()
  ]);

  const rawTeams = (mongoTeams && mongoTeams.length > 0) ? mongoTeams : INITIAL_TEAMS;
  const regs = mongoRegs || [];

  return rawTeams.map((t) => ({
    id: t.id,
    name: t.name,
    shortCode: t.shortCode,
    owner: t.owner,
    captain: t.captain,
    established: t.established || "2024",
    championships: t.championships || 0,
    logo: t.logo || "/images/teams/team-csk.png",
    members: t.members || [],
    memberDetails: (t.members || [])
      .map((mid) => regs.find((r) => r.id === mid))
      .filter(Boolean)
      .map((r) => ({
        id: r.id,
        name: r.name,
        speciality: r.speciality,
        ward: r.ward,
        tshirtSize: r.tshirtSize
      }))
  }));
}

export async function GET(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    const teams = await getPopulatedTeams();
    return NextResponse.json({ success: true, teams }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error("[Teams GET Error]:", e.message);
    return NextResponse.json({ success: true, teams: db ? db.getAllTeams() : INITIAL_TEAMS }, { headers: NO_CACHE_HEADERS });
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
    const { action, teamId, teamData, playerId } = body;

    // 1. ASSIGN / UNASSIGN PLAYER
    if (action === "assign") {
      if (teamId && playerId) {
        await MongoTeam.updateMany({}, { $pull: { members: playerId } });
        if (teamId !== "unassign" && teamId !== "") {
          const targetTeam = await MongoTeam.findOne({ id: teamId });
          if (targetTeam && (targetTeam.members || []).length >= 14) {
            return NextResponse.json(
              { success: false, error: "Team squad is full (14/14 players)" },
              { status: 400, headers: NO_CACHE_HEADERS }
            );
          }
          await MongoTeam.findOneAndUpdate({ id: teamId }, { $addToSet: { members: playerId } });
          await MongoRegistration.findOneAndUpdate({ id: playerId }, { teamId });
        } else {
          await MongoRegistration.findOneAndUpdate({ id: playerId }, { teamId: null });
        }
      }
      if (db) db.assignPlayerToTeam(playerId, teamId);
      const teams = await getPopulatedTeams();
      return NextResponse.json({ success: true, teams }, { headers: NO_CACHE_HEADERS });
    }

    // 2. DELETE TEAM
    if (action === "delete") {
      if (teamId) {
        await MongoTeam.findOneAndDelete({ id: teamId });
        await MongoRegistration.updateMany({ teamId }, { teamId: null });
      }
      if (db) db.deleteTeam(teamId);
      const teams = await getPopulatedTeams();
      return NextResponse.json({ success: true, teams }, { headers: NO_CACHE_HEADERS });
    }

    // 3. UPDATE TEAM
    if ((action === "update" || teamId) && teamData) {
      const cleanData = { ...teamData };
      delete cleanData._id;
      if (teamId) {
        await MongoTeam.findOneAndUpdate(
          { id: teamId },
          { $set: cleanData },
          { returnDocument: "after" }
        );
      }
      if (db) db.updateTeam(teamId, cleanData);
      const teams = await getPopulatedTeams();
      return NextResponse.json({ success: true, team: cleanData, teams }, { headers: NO_CACHE_HEADERS });
    }

    // 4. CREATE TEAM
    if (action === "create" || teamData) {
      const cleanData = { ...teamData };
      delete cleanData._id;
      if (!cleanData.id) {
        cleanData.id = `team-${Date.now()}`;
      }
      await MongoTeam.create(cleanData).catch(() => {});
      if (db) db.addTeam(cleanData);
      const teams = await getPopulatedTeams();
      return NextResponse.json({ success: true, team: cleanData, teams }, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400, headers: NO_CACHE_HEADERS });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}
