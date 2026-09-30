import { NextResponse } from "next/server";
import { db, INITIAL_TEAMS } from "@/lib/db";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoTeam, MongoRegistration } from "@/lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

async function getPopulatedTeams() {
  try {
    const conn = await connectToDatabase();
    if (conn && mongoose.connection.readyState === 1) {
      const [mongoTeams, mongoRegs] = await Promise.all([
        MongoTeam.find().lean().exec(),
        MongoRegistration.find().lean().exec()
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
  } catch (err) {
    console.warn("[getPopulatedTeams fallback]:", err.message);
  }

  return db ? db.getAllTeams() : INITIAL_TEAMS;
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
    return NextResponse.json({ success: true, teams: db ? db.getAllTeams() : INITIAL_TEAMS }, { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    const conn = await connectToDatabase();
    const isMongoReady = conn && mongoose.connection.readyState === 1;
    const body = await request.json();
    const { action, teamId, teamData, playerId } = body;

    // 1. ASSIGN / UNASSIGN PLAYER
    if (action === "assign") {
      if (teamId && playerId) {
        if (isMongoReady) {
          await MongoTeam.updateMany({}, { $pull: { members: playerId } }).catch(() => {});
          if (teamId !== "unassign" && teamId !== "") {
            const targetTeam = await MongoTeam.findOne({ id: teamId }).lean().catch(() => null);
            if (targetTeam && (targetTeam.members || []).length >= 14) {
              return NextResponse.json(
                { success: false, error: "Team squad is full (14/14 players)" },
                { status: 400, headers: NO_CACHE_HEADERS }
              );
            }
            await MongoTeam.findOneAndUpdate({ id: teamId }, { $addToSet: { members: playerId } }).catch(() => {});
            await MongoRegistration.findOneAndUpdate({ id: playerId }, { teamId }).catch(() => {});
          } else {
            await MongoRegistration.findOneAndUpdate({ id: playerId }, { teamId: null }).catch(() => {});
          }
        }
      }
      if (db) db.assignPlayerToTeam(playerId, teamId);
      const teams = await getPopulatedTeams();
      return NextResponse.json({ success: true, teams }, { headers: NO_CACHE_HEADERS });
    }

    // 2. DELETE TEAM
    if (action === "delete") {
      if (teamId) {
        if (isMongoReady) {
          await MongoTeam.findOneAndDelete({ id: teamId }).catch(() => {});
          await MongoRegistration.updateMany({ teamId }, { teamId: null }).catch(() => {});
        }
      }
      if (db) db.deleteTeam(teamId);
      const teams = await getPopulatedTeams();
      return NextResponse.json({ success: true, teams }, { headers: NO_CACHE_HEADERS });
    }

    // 3. UPDATE TEAM
    if ((action === "update" || teamId) && teamData) {
      const cleanData = { ...teamData };
      delete cleanData._id;
      if (teamId && isMongoReady) {
        await MongoTeam.findOneAndUpdate(
          { id: teamId },
          { $set: cleanData },
          { returnDocument: "after" }
        ).catch(() => {});
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
      if (isMongoReady) {
        await MongoTeam.create(cleanData).catch(() => {});
      }
      if (db) db.addTeam(cleanData);
      const teams = await getPopulatedTeams();
      return NextResponse.json({ success: true, team: cleanData, teams }, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400, headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("[Teams POST Error]:", err.message);
    const teams = db ? db.getAllTeams() : INITIAL_TEAMS;
    return NextResponse.json({ success: true, teams }, { headers: NO_CACHE_HEADERS });
  }
}
