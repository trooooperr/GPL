import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoTeam, MongoRegistration } from "@/lib/mongodb";
import { INITIAL_TEAMS } from "@/lib/constants";
import { sendTeamAssignmentEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

async function getPopulatedTeams() {
  const [mongoTeams, mongoRegs] = await Promise.all([
    MongoTeam.find().lean(),
    MongoRegistration.find({}, "id name speciality ward tshirtSize").lean()
  ]);

  let rawTeams = mongoTeams;
  
  // If no teams in DB, seed with INITIAL_TEAMS
  if (!rawTeams || rawTeams.length === 0) {
    await MongoTeam.insertMany(INITIAL_TEAMS).catch(() => {});
    rawTeams = INITIAL_TEAMS;
  }
  
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
    themeColor: t.themeColor || "#0041b9",
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
    await connectToDatabase();
    const teams = await getPopulatedTeams();
    return NextResponse.json({ success: true, teams }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error("[Admin Teams GET Error]:", e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: NO_CACHE_HEADERS });
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
    const { action, teamId, teamData, playerId, playerIds } = body;

    // 0. BATCH ASSIGN PLAYERS TO TEAM
    if (action === "batchAssign" && Array.isArray(playerIds) && playerIds.length > 0) {
      await MongoTeam.updateMany({}, { $pull: { members: { $in: playerIds } } });

      if (teamId && teamId !== "unassign" && teamId !== "" && teamId !== "null") {
        const targetTeam = await MongoTeam.findOne({ id: teamId }).lean();
        const currentMembers = targetTeam?.members || [];
        const availableSlots = Math.max(0, 14 - currentMembers.length);
        const toAdd = playerIds.slice(0, availableSlots);

        if (toAdd.length > 0) {
          await MongoTeam.findOneAndUpdate({ id: teamId }, { $addToSet: { members: { $each: toAdd } } });
          await MongoRegistration.updateMany({ id: { $in: toAdd } }, { $set: { teamId } });
        }
      } else {
        await MongoRegistration.updateMany({ id: { $in: playerIds } }, { $set: { teamId: null } });
      }

      const teams = await getPopulatedTeams();
      return NextResponse.json({ success: true, teams }, { headers: NO_CACHE_HEADERS });
    }

    // 1. ASSIGN / UNASSIGN PLAYER
    if (action === "assign") {
      if (playerId) {
        // If a valid teamId is provided, verify player is not rejected
        if (teamId && teamId !== "unassign" && teamId !== "" && teamId !== "null") {
          const playerDoc = await MongoRegistration.findOne({ id: playerId }, "paymentStatus").lean();
          if (playerDoc && playerDoc.paymentStatus === "Rejected") {
            return NextResponse.json(
              { success: false, error: "Cannot assign a rejected player to any team." },
              { status: 400, headers: NO_CACHE_HEADERS }
            );
          }

          // First always remove from all teams
          await MongoTeam.updateMany({}, { $pull: { members: playerId } });

          const targetTeam = await MongoTeam.findOne({ id: teamId }).lean();
          if (targetTeam && (targetTeam.members || []).length >= 14) {
            return NextResponse.json(
              { success: false, error: "Team squad is full (14/14 players)" },
              { status: 400, headers: NO_CACHE_HEADERS }
            );
          }
          await MongoTeam.findOneAndUpdate({ id: teamId }, { $addToSet: { members: playerId } });
          const updatedPlayer = await MongoRegistration.findOneAndUpdate(
            { id: playerId },
            { teamId },
            { new: true }
          ).lean();

          if (targetTeam && updatedPlayer) {
            sendTeamAssignmentEmail(updatedPlayer, targetTeam).catch((err) => {
              console.warn("[Auction Draft Email Notice]:", err.message);
            });
          }
        } else {
          // Unassign from team
          await MongoTeam.updateMany({}, { $pull: { members: playerId } });
          await MongoRegistration.findOneAndUpdate({ id: playerId }, { teamId: null });
        }
      }
      const teams = await getPopulatedTeams();
      return NextResponse.json({ success: true, teams }, { headers: NO_CACHE_HEADERS });
    }

    // 2. DELETE TEAM
    if (action === "delete") {
      if (teamId) {
        await MongoTeam.findOneAndDelete({ id: teamId });
        await MongoRegistration.updateMany({ teamId }, { teamId: null });
      }
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
      await MongoTeam.create(cleanData);
      const teams = await getPopulatedTeams();
      return NextResponse.json({ success: true, team: cleanData, teams }, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400, headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("[Teams POST Error]:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
