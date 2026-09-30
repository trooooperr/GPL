import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoTeam, MongoRegistration } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

export async function GET(request) {
  await dbReady;
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const mongoTeams = await MongoTeam.find().lean();
      const mongoRegs = await MongoRegistration.find().lean();
      const teams = mongoTeams.map(t => ({
        id: t.id,
        name: t.name,
        shortCode: t.shortCode,
        owner: t.owner,
        captain: t.captain,
        established: t.established,
        championships: t.championships,
        logo: t.logo,
        members: t.members || [],
        memberDetails: (t.members || [])
          .map(mid => mongoRegs.find(r => r.id === mid))
          .filter(Boolean)
          .map(r => ({ id: r.id, name: r.name, speciality: r.speciality, ward: r.ward, tshirtSize: r.tshirtSize }))
      }));
      return NextResponse.json({ success: true, teams }, { headers: NO_CACHE_HEADERS });
    }
  } catch (e) {
    console.error("[Teams GET MongoDB Error]:", e.message);
  }

  return NextResponse.json({ success: true, teams: db.getAllTeams() }, { headers: NO_CACHE_HEADERS });
}

export async function POST(request) {
  await dbReady;
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    const body = await request.json();
    const { action, teamId, teamData, playerId } = body;
    const conn = await connectToDatabase();

    // 1. Assign / Unassign player
    if (action === "assign") {
      if (conn && teamId && playerId) {
        await MongoTeam.updateMany({}, { $pull: { members: playerId } });
        if (teamId !== "unassign" && teamId !== "") {
          await MongoTeam.findOneAndUpdate({ id: teamId }, { $addToSet: { members: playerId } });
          await MongoRegistration.findOneAndUpdate({ id: playerId }, { teamId });
        } else {
          await MongoRegistration.findOneAndUpdate({ id: playerId }, { teamId: null });
        }
      }
      db.assignPlayerToTeam(playerId, teamId);

      const mongoTeams = conn ? await MongoTeam.find().lean() : db.getAllTeams();
      const mongoRegs = conn ? await MongoRegistration.find().lean() : [];
      const teams = mongoTeams.map(t => ({
        id: t.id,
        name: t.name,
        shortCode: t.shortCode,
        owner: t.owner,
        captain: t.captain,
        established: t.established,
        championships: t.championships,
        logo: t.logo,
        members: t.members || [],
        memberDetails: (t.members || []).map(mid => mongoRegs.find(r => r.id === mid)).filter(Boolean)
      }));
      return NextResponse.json({ success: true, teams }, { headers: NO_CACHE_HEADERS });
    }

    // 2. Delete Team
    if (action === "delete") {
      if (conn && teamId) {
        await MongoTeam.findOneAndDelete({ id: teamId });
        await MongoRegistration.updateMany({ teamId }, { teamId: null });
      }
      db.deleteTeam(teamId);
      const teams = conn ? (await MongoTeam.find().lean()) : db.getAllTeams();
      return NextResponse.json({ success: true, teams }, { headers: NO_CACHE_HEADERS });
    }

    // 3. Update existing Team
    if ((action === "update" || teamId) && teamData) {
      const cleanData = { ...teamData };
      delete cleanData._id;
      if (conn && teamId) {
        await MongoTeam.findOneAndUpdate(
          { id: teamId },
          { $set: cleanData },
          { returnDocument: "after" }
        );
      }
      db.updateTeam(teamId, cleanData);
      const teams = conn ? (await MongoTeam.find().lean()) : db.getAllTeams();
      return NextResponse.json({ success: true, team: cleanData, teams }, { headers: NO_CACHE_HEADERS });
    }

    // 4. Create new Team
    if (action === "create" || teamData) {
      const cleanData = { ...teamData };
      delete cleanData._id;
      if (!cleanData.id) {
        cleanData.id = `team-${Date.now()}`;
      }
      if (conn) {
        await MongoTeam.create(cleanData).catch(() => {});
      }
      db.addTeam(cleanData);
      const teams = conn ? (await MongoTeam.find().lean()) : db.getAllTeams();
      return NextResponse.json({ success: true, team: cleanData, teams }, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400, headers: NO_CACHE_HEADERS });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}
