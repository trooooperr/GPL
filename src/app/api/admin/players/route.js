import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAuthCookie } from "@/lib/auth";
import { sendPlayerStatusEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    players: db.getAllRegistrations(),
    stats: db.getStats()
  });
}

export async function POST(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, id, status, notes, playerData, teamId } = body;

    // 1. Delete player
    if (action === "delete") {
      const deleted = db.deletePlayer(id);
      return NextResponse.json({ success: true, deleted, players: db.getAllRegistrations(), stats: db.getStats() });
    }

    // 2. Assign team
    if (action === "assignTeam") {
      const result = db.assignPlayerToTeam(id, teamId);
      return NextResponse.json({ success: true, result, players: db.getAllRegistrations() });
    }

    // 3. Edit full player details
    if (action === "edit" || (id && playerData)) {
      const existing = db.getRegistrationById(id);
      const updated = db.updatePlayer(id, playerData);

      if (
        playerData?.paymentStatus &&
        existing?.paymentStatus !== playerData.paymentStatus &&
        (playerData.paymentStatus.toLowerCase() === "approved" || playerData.paymentStatus.toLowerCase() === "rejected")
      ) {
        sendPlayerStatusEmail(updated, playerData.paymentStatus, playerData.notes || notes || "").catch((err) =>
          console.error("Player status email error on edit:", err)
        );
      }

      return NextResponse.json({ success: true, player: updated, players: db.getAllRegistrations(), stats: db.getStats() });
    }

    // 4. Add manual player from admin
    if (action === "create" || (action === "add" && playerData)) {
      const created = db.addRegistration(playerData);
      return NextResponse.json({ success: true, player: created, players: db.getAllRegistrations(), stats: db.getStats() });
    }

    // 5. Update payment status (Approve / Reject / Pending)
    if (id && status) {
      const updated = db.updateRegistrationStatus(id, status, notes);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Player not found" }, { status: 404 });
      }

      // Send email to player on Approve or Reject
      if (status.toLowerCase() === "approved" || status.toLowerCase() === "rejected") {
        sendPlayerStatusEmail(updated, status, notes || "").catch((err) =>
          console.error("Player status email error on status update:", err)
        );
      }

      return NextResponse.json({ success: true, player: updated, stats: db.getStats() });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
