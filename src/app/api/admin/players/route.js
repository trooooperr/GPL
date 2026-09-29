import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { sendPlayerStatusEmail } from "@/lib/email";
import { connectToDatabase, MongoRegistration, MongoTeam } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function mapPlayer(r) {
  return {
    id: r.id, regNumber: r.regNumber, name: r.name, email: r.email,
    phone: r.phone, dob: r.dob, age: r.age, ward: r.ward,
    speciality: r.speciality, tshirtSize: r.tshirtSize, trackSize: r.trackSize,
    utrNumber: r.utrNumber, amount: r.amount, paymentStatus: r.paymentStatus,
    photoUrl: r.photoUrl, aadhaarFrontUrl: r.aadhaarFrontUrl,
    aadhaarBackUrl: r.aadhaarBackUrl, paymentProofUrl: r.paymentProofUrl,
    teamId: r.teamId, notes: r.notes,
    registeredAt: r.registeredAt || r.createdAt,
    history: r.history || []
  };
}

function calcStats(players) {
  const total = players.length;
  const approved = players.filter(p => p.paymentStatus === "Approved").length;
  const rejected = players.filter(p => p.paymentStatus === "Rejected").length;
  const pending = players.filter(p => p.paymentStatus === "Pending").length;
  return { totalRegistrations: total, approved, rejected, pending, available: 140 - approved };
}

export async function GET(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    await connectToDatabase();
    const players = await MongoRegistration.find().sort({ registeredAt: -1 }).lean();
    const mapped = players.map(mapPlayer);
    return NextResponse.json({ success: true, players: mapped, stats: calcStats(mapped) });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    await connectToDatabase();
    const body = await request.json();
    const { action, id, status, notes, playerData, teamId } = body;

    // DELETE player
    if (action === "delete") {
      await MongoRegistration.findOneAndDelete({ id });
      await MongoTeam.updateMany({}, { $pull: { members: id } });
      const players = (await MongoRegistration.find().sort({ registeredAt: -1 }).lean()).map(mapPlayer);
      return NextResponse.json({ success: true, players, stats: calcStats(players) });
    }

    // ASSIGN TEAM
    if (action === "assignTeam") {
      await MongoTeam.updateMany({}, { $pull: { members: id } });
      if (teamId && teamId !== "unassign") {
        const team = await MongoTeam.findOne({ id: teamId });
        if (team && (team.members || []).length >= 14) {
          return NextResponse.json({ success: false, error: "Team is full (14/14 players)" }, { status: 400 });
        }
        await MongoTeam.findOneAndUpdate({ id: teamId }, { $addToSet: { members: id } });
        await MongoRegistration.findOneAndUpdate({ id }, { teamId });
      } else {
        await MongoRegistration.findOneAndUpdate({ id }, { teamId: null });
      }
      const players = (await MongoRegistration.find().sort({ registeredAt: -1 }).lean()).map(mapPlayer);
      return NextResponse.json({ success: true, players, stats: calcStats(players) });
    }

    // EDIT player
    if (action === "edit" && id && playerData) {
      const old = await MongoRegistration.findOne({ id }).lean();
      await MongoRegistration.findOneAndUpdate({ id }, playerData);
      const updated = await MongoRegistration.findOne({ id }).lean();
      const mappedUpdated = mapPlayer(updated);
      if (playerData.paymentStatus && old?.paymentStatus !== playerData.paymentStatus &&
        ["approved", "rejected"].includes(playerData.paymentStatus.toLowerCase())) {
        sendPlayerStatusEmail(mappedUpdated, playerData.paymentStatus, playerData.notes || "").catch(() => {});
      }
      const players = (await MongoRegistration.find().sort({ registeredAt: -1 }).lean()).map(mapPlayer);
      return NextResponse.json({ success: true, player: mappedUpdated, players, stats: calcStats(players) });
    }

    // UPDATE STATUS (approve/reject)
    if (id && status) {
      const old = await MongoRegistration.findOne({ id }).lean();
      const historyEntry = { timestamp: new Date().toISOString(), action: `STATUS_CHANGE_${status.toUpperCase()}`, notes: notes || `Changed to ${status}` };
      await MongoRegistration.findOneAndUpdate({ id }, {
        paymentStatus: status,
        notes: notes || old?.notes || "",
        $push: { history: historyEntry }
      });
      const updated = await MongoRegistration.findOne({ id }).lean();
      const mappedUpdated = mapPlayer(updated);
      if (["approved", "rejected"].includes(status.toLowerCase())) {
        sendPlayerStatusEmail(mappedUpdated, status, notes || "").catch(() => {});
      }
      const players = (await MongoRegistration.find().sort({ registeredAt: -1 }).lean()).map(mapPlayer);
      return NextResponse.json({ success: true, player: mappedUpdated, players, stats: calcStats(players) });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
