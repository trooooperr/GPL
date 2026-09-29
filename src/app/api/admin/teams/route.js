import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoTeam, MongoRegistration } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request) {
  await dbReady;
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Always read fresh from MongoDB if available
    const conn = await connectToDatabase();
    if (conn) {
      const mongoTeams = await MongoTeam.find().lean();
      const mongoRegs = await MongoRegistration.find().lean();
      const teams = mongoTeams.map(t => ({
        id: t.id, name: t.name, shortCode: t.shortCode,
        owner: t.owner, captain: t.captain, established: t.established,
        championships: t.championships, logo: t.logo, members: t.members || [],
        memberDetails: (t.members || [])
          .map(mid => mongoRegs.find(r => r.id === mid))
          .filter(Boolean)
          .map(r => ({ id: r.id, name: r.name, speciality: r.speciality, ward: r.ward, tshirtSize: r.tshirtSize }))
      }));
      return NextResponse.json({ success: true, teams });
    }
  } catch (e) {
    console.error("[Teams GET MongoDB Error]:", e.message);
  }

  // Fallback to in-memory
  return NextResponse.json({ success: true, teams: db.getAllTeams() });
}

export async function POST(request) {
  await dbReady;
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, teamId, teamData, playerId } = body;

    const conn = await connectToDatabase();

    // Assign / Unassign player
    if (action === "assign") {
      if (conn && teamId && playerId) {
        // Remove from all teams first
        await MongoTeam.updateMany({}, { $pull: { members: playerId } });
        if (teamId !== "unassign") {
          await MongoTeam.findOneAndUpdate({ id: teamId }, { $addToSet: { members: playerId } });
          await MongoRegistration.findOneAndUpdate({ id: playerId }, { teamId });
        } else {
          await MongoRegistration.findOneAndUpdate({ id: playerId }, { teamId: null });
        }
        const mongoTeams = await MongoTeam.find().lean();
        const mongoRegs = await MongoRegistration.find().lean();
        const teams = mongoTeams.map(t => ({
          id: t.id, name: t.name, shortCode: t.shortCode,
          owner: t.owner, captain: t.captain, established: t.established,
          championships: t.championships, logo: t.logo, members: t.members || [],
          memberDetails: (t.members || []).map(mid => mongoRegs.find(r => r.id === mid)).filter(Boolean)
        }));
        return NextResponse.json({ success: true, teams });
      }
      const result = db.assignPlayerToTeam(playerId, teamId);
      return NextResponse.json({ success: true, result });
    }

    // Delete Team
    if (action === "delete") {
      if (conn && teamId) {
        await MongoTeam.findOneAndDelete({ id: teamId });
        await MongoRegistration.updateMany({ teamId }, { teamId: null });
      }
      const deleted = db.deleteTeam(teamId);
      const teams = conn ? (await MongoTeam.find().lean()) : db.getAllTeams();
      return NextResponse.json({ success: true, deleted, teams });
    }

    // Update existing Team
    if ((action === "update" || teamId) && teamData) {
      if (conn && teamId) {
        await MongoTeam.findOneAndUpdate({ id: teamId }, teamData);
      }
      const updated = db.updateTeam(teamId, teamData);
      const teams = conn ? (await MongoTeam.find().lean()) : db.getAllTeams();
      return NextResponse.json({ success: true, team: updated, teams });
    }

    // Create new Team
    if (action === "create" || teamData) {
      const created = db.addTeam(teamData);
      if (conn) {
        await MongoTeam.create(created).catch(() => {});
      }
      const teams = conn ? (await MongoTeam.find().lean()) : db.getAllTeams();
      return NextResponse.json({ success: true, team: created, teams });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
