import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    teams: db.getAllTeams()
  });
}

export async function POST(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, teamId, teamData, playerId } = body;

    // Assign / Unassign player
    if (action === "assign") {
      const result = db.assignPlayerToTeam(playerId, teamId);
      return NextResponse.json({ success: true, result });
    }

    // Delete Team
    if (action === "delete") {
      const deleted = db.deleteTeam(teamId);
      return NextResponse.json({ success: true, deleted, teams: db.getAllTeams() });
    }

    // Update existing Team
    if (action === "update" || (teamId && teamData)) {
      const updated = db.updateTeam(teamId, teamData);
      return NextResponse.json({ success: true, team: updated, teams: db.getAllTeams() });
    }

    // Create new Team
    if (action === "create" || teamData) {
      const created = db.addTeam(teamData);
      return NextResponse.json({ success: true, team: created, teams: db.getAllTeams() });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
