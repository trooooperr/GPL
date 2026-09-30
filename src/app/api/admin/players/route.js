import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { sendPlayerStatusEmail, sendTeamAssignmentEmail } from "@/lib/email";
import { connectToDatabase, MongoRegistration, MongoTeam, MongoSetting } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

function mapPlayer(r) {
  let displayId = String(r.id || "");
  if (!/^\d{4}$/.test(displayId)) {
    if (/^\d{4}$/.test(String(r.regNumber || ""))) {
      displayId = String(r.regNumber);
    } else {
      const num = parseInt(r.regNumber, 10);
      if (!isNaN(num) && num > 0) {
        displayId = String(1000 + num);
      } else {
        const digits = displayId.replace(/\D/g, "");
        displayId = digits.length >= 4 ? digits.slice(-4) : "1001";
      }
    }
  }

  return {
    id: r.id,
    displayId,
    regNumber: displayId,
    name: r.name,
    email: r.email,
    phone: (r.phone || "").replace(/\D/g, "").slice(0, 10),
    dob: r.dob,
    age: r.age,
    ward: r.ward || "Ward 51",
    speciality: r.speciality,
    tshirtSize: r.tshirtSize,
    trackSize: r.trackSize,
    utrNumber: r.utrNumber,
    amount: r.amount || 100,
    paymentStatus: r.paymentStatus || "Pending",
    photoUrl: r.photoUrl || "/images/avatar-placeholder.svg",
    aadhaarFrontUrl: r.aadhaarFrontUrl || "/images/doc-placeholder.svg",
    aadhaarBackUrl: r.aadhaarBackUrl || "/images/doc-placeholder.svg",
    paymentProofUrl: r.paymentProofUrl || "/images/payment-placeholder.svg",
    teamId: r.teamId || null,
    notes: r.notes || "",
    registeredAt: r.registeredAt || r.createdAt || new Date().toISOString(),
    history: r.history || []
  };
}

async function getCalculatedStats(players) {
  const total = players.length;
  const approved = players.filter((p) => p.paymentStatus === "Approved").length;
  const rejected = players.filter((p) => p.paymentStatus === "Rejected").length;
  const pending = players.filter((p) => p.paymentStatus === "Pending").length;
  
  let teamsCount = 11;
  try {
    teamsCount = (await MongoTeam.countDocuments()) || 11;
  } catch (e) {}

  const maxCap = teamsCount * 14;

  return {
    totalRegistrations: total,
    totalRegistered: total,
    approved,
    rejected,
    pending,
    available: Math.max(0, maxCap - approved),
    remainingSlots: Math.max(0, maxCap - approved),
    maxCapacity: maxCap,
    totalTeams: teamsCount
  };
}

export async function GET(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    await connectToDatabase();
    const players = await MongoRegistration.find().sort({ createdAt: -1, registeredAt: -1 }).lean();
    const mapped = players.map(mapPlayer);
    const stats = await getCalculatedStats(mapped);
    return NextResponse.json({ success: true, players: mapped, stats }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error("[Admin Players GET Error]:", e.message);
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
    const { action, id, status, notes, playerData, teamId } = body;

    // 1. DELETE player
    if (action === "delete") {
      await MongoRegistration.findOneAndDelete({ id });
      await MongoTeam.updateMany({}, { $pull: { members: id } });
      const players = (await MongoRegistration.find().sort({ createdAt: -1, registeredAt: -1 }).lean()).map(mapPlayer);
      const stats = await getCalculatedStats(players);
      return NextResponse.json({ success: true, players, stats }, { headers: NO_CACHE_HEADERS });
    }

    // 2. ASSIGN / UNASSIGN TEAM
    if (action === "assignTeam") {
      await MongoTeam.updateMany({}, { $pull: { members: id } });
      if (teamId && teamId !== "unassign" && teamId !== "") {
        const team = await MongoTeam.findOne({ id: teamId });
        if (team && (team.members || []).length >= 14) {
          return NextResponse.json(
            { success: false, error: "Team is full (14/14 players)" },
            { status: 400, headers: NO_CACHE_HEADERS }
          );
        }
        await MongoTeam.findOneAndUpdate({ id: teamId }, { $addToSet: { members: id } });
        const updatedDoc = await MongoRegistration.findOneAndUpdate({ id }, { teamId }, { new: true }).lean();
        if (team && updatedDoc) {
          sendTeamAssignmentEmail(updatedDoc, team).catch(() => {});
        }
      } else {
        await MongoRegistration.findOneAndUpdate({ id }, { teamId: null });
      }
      const players = (await MongoRegistration.find().sort({ createdAt: -1, registeredAt: -1 }).lean()).map(mapPlayer);
      const stats = await getCalculatedStats(players);
      return NextResponse.json({ success: true, players, stats }, { headers: NO_CACHE_HEADERS });
    }

    // 3. EDIT player
    if (action === "edit" && id && playerData) {
      const cleanPlayerData = { ...playerData };
      delete cleanPlayerData._id;
      
      // If paymentStatus is set to Rejected, automatically remove from team
      if (cleanPlayerData.paymentStatus && cleanPlayerData.paymentStatus.toLowerCase() === "rejected") {
        await MongoTeam.updateMany({}, { $pull: { members: id } });
        cleanPlayerData.teamId = null;
      }

      const old = await MongoRegistration.findOne({ id }).lean();
      await MongoRegistration.findOneAndUpdate({ id }, { $set: cleanPlayerData });
      const updated = await MongoRegistration.findOne({ id }).lean();
      const mappedUpdated = mapPlayer(updated);

      if (
        cleanPlayerData.paymentStatus &&
        old?.paymentStatus !== cleanPlayerData.paymentStatus &&
        ["approved", "rejected"].includes(cleanPlayerData.paymentStatus.toLowerCase())
      ) {
        sendPlayerStatusEmail(mappedUpdated, cleanPlayerData.paymentStatus, cleanPlayerData.notes || "").catch(() => {});
      }

      const players = (await MongoRegistration.find().sort({ createdAt: -1, registeredAt: -1 }).lean()).map(mapPlayer);
      const stats = await getCalculatedStats(players);
      return NextResponse.json({ success: true, player: mappedUpdated, players, stats }, { headers: NO_CACHE_HEADERS });
    }

    // 4. UPDATE STATUS (Approve / Reject / Pending)
    if (id && status) {
      const isRejected = status.toLowerCase() === "rejected";
      
      // If status is Rejected, automatically remove player from any team
      if (isRejected) {
        await MongoTeam.updateMany({}, { $pull: { members: id } });
      }

      const old = await MongoRegistration.findOne({ id }).lean();
      const historyEntry = {
        timestamp: new Date().toISOString(),
        action: `STATUS_CHANGE_${status.toUpperCase()}`,
        notes: notes || `Status updated to ${status}${isRejected ? " (Removed from team)" : ""}`
      };

      await MongoRegistration.findOneAndUpdate(
        { id },
        {
          $set: {
            paymentStatus: status,
            notes: notes !== undefined ? notes : (old?.notes || ""),
            ...(isRejected ? { teamId: null } : {})
          },
          $push: { history: historyEntry }
        }
      );

      const updated = await MongoRegistration.findOne({ id }).lean();
      const mappedUpdated = mapPlayer(updated);

      if (["approved", "rejected"].includes(status.toLowerCase())) {
        sendPlayerStatusEmail(mappedUpdated, status, notes || "").catch(() => {});
      }

      const players = (await MongoRegistration.find().sort({ createdAt: -1, registeredAt: -1 }).lean()).map(mapPlayer);
      const stats = await getCalculatedStats(players);
      return NextResponse.json({ success: true, player: mappedUpdated, players, stats }, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400, headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error("[Admin Players POST Error]:", e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
