import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { sendPlayerStatusEmail, sendTeamAssignmentEmail } from "@/lib/email";
import { connectToDatabase, MongoRegistration, MongoTeam, MongoSetting, syncRegistrationCounter } from "@/lib/mongodb";

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
    utrNumber: (r.utrNumber && !r.utrNumber.toUpperCase().includes("FREE")) ? r.utrNumber : "",
    instagramHandle: (r.instagramHandle && !r.instagramHandle.toUpperCase().includes("FREE"))
      ? r.instagramHandle.replace(/^@/, "")
      : (r.utrNumber && !r.utrNumber.toUpperCase().includes("FREE") && r.utrNumber.startsWith("@") ? r.utrNumber.slice(1) : ""),
    amount: r.amount !== undefined ? r.amount : 0,
    paymentStatus: r.paymentStatus || "Pending",
    photoUrl: r.photoUrl || "/images/avatar-placeholder.svg",
    aadhaarFrontUrl: r.aadhaarFrontUrl || "/images/doc-placeholder.svg",
    aadhaarBackUrl: r.aadhaarBackUrl || "/images/doc-placeholder.svg",
    paymentProofUrl: r.paymentProofUrl || "/images/payment-placeholder.svg",
    teamId: r.teamId || null,
    cardUrl: r.cardUrl || null,
    notes: r.notes || "",
    registeredAt: r.registeredAt || r.createdAt || new Date().toISOString(),
    history: r.history || []
  };
}

async function getCalculatedStats(playersList, teamsCount = 11) {
  let approved = 0;
  let rejected = 0;
  let pending = 0;
  let total = 0;

  try {
    if (!Array.isArray(playersList)) {
      const [regs, tCount] = await Promise.all([
        MongoRegistration.find({}, "paymentStatus").lean().exec().catch(() => []),
        MongoTeam.countDocuments().exec().catch(() => 11)
      ]);
      playersList = Array.isArray(regs) ? regs : [];
      teamsCount = tCount || 11;
    }

    if (Array.isArray(playersList)) {
      total = playersList.length;
      for (let i = 0; i < playersList.length; i++) {
        const item = playersList[i];
        if (!item) continue;
        const st = String(item.paymentStatus || "").toLowerCase();
        if (st === "approved") {
          approved++;
        } else if (st === "rejected") {
          rejected++;
        } else {
          pending++;
        }
      }
    }
  } catch (err) {
    console.error("[getCalculatedStats Error]:", err);
  }

  const maxCap = (teamsCount || 11) * 14;

  return {
    totalRegistrations: total,
    totalRegistered: total,
    approved,
    rejected,
    pending,
    available: Math.max(0, maxCap - approved),
    remainingSlots: Math.max(0, maxCap - approved),
    maxCapacity: maxCap,
    totalTeams: teamsCount || 11
  };
}

export async function GET(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    await connectToDatabase();

    // Auto-sanitize legacy free-follow strings in MongoDB in the background
    MongoRegistration.updateMany(
      { $or: [{ utrNumber: /FREE/i }, { instagramHandle: /FREE/i }] },
      { $set: { utrNumber: "", instagramHandle: "" } }
    ).catch(() => {});

    // Query players and teams count concurrently
    const [players, teamsCount] = await Promise.all([
      MongoRegistration.find()
        .sort({ createdAt: -1, registeredAt: -1 })
        .lean(),
      MongoTeam.countDocuments().catch(() => 11)
    ]);

    const mapped = players.map(mapPlayer);
    const stats = await getCalculatedStats(mapped, teamsCount || 11);

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
    const { action, id, ids, status, notes, playerData, teamId, cardDataUrl, cardsMap } = body;

    // 0. BATCH UPDATE STATUS (Multiple Players)
    if (action === "batchStatus" && Array.isArray(ids) && ids.length > 0 && status) {
      const isRejected = status.toLowerCase() === "rejected";
      if (isRejected) {
        await MongoTeam.updateMany({}, { $pull: { members: { $in: ids } } });
      }

      const historyEntry = {
        timestamp: new Date().toISOString(),
        action: `BATCH_STATUS_${status.toUpperCase()}`,
        notes: notes || `Batch status updated to ${status}${isRejected ? " (Removed from team)" : ""}`
      };

      await MongoRegistration.updateMany(
        { id: { $in: ids } },
        {
          $set: {
            paymentStatus: status,
            ...(notes !== undefined ? { notes } : {}),
            ...(isRejected ? { teamId: null } : {})
          },
          $push: { history: historyEntry }
        }
      );

      if (status.toLowerCase() === "approved") {
        if (cardsMap && typeof cardsMap === "object") {
          for (const [pid, cardUrl] of Object.entries(cardsMap)) {
            if (cardUrl) {
              await MongoRegistration.updateOne({ id: pid }, { $set: { cardUrl } }).catch(() => {});
            }
          }
        }
        for (const pid of ids) {
          MongoRegistration.findOne({ id: pid }).lean().then((p) => {
            if (p) {
              const customCard = cardsMap?.[pid] || p.cardUrl;
              sendPlayerStatusEmail(mapPlayer(p), "Approved", notes || "", customCard).catch(() => {});
            }
          }).catch(() => {});
        }
      }

      const stats = await getCalculatedStats();
      return NextResponse.json({ success: true, count: ids.length, stats }, { headers: NO_CACHE_HEADERS });
    }

    // 1. DELETE player
    if (action === "delete") {
      await MongoRegistration.findOneAndDelete({ id });
      await MongoTeam.updateMany({}, { $pull: { members: id } });
      await syncRegistrationCounter();
      const stats = await getCalculatedStats();
      return NextResponse.json({ success: true, deletedId: id, stats }, { headers: NO_CACHE_HEADERS });
    }

    // 1b. BATCH DELETE players
    if (action === "batchDelete" && Array.isArray(ids) && ids.length > 0) {
      await MongoRegistration.deleteMany({ id: { $in: ids } });
      await MongoTeam.updateMany({}, { $pull: { members: { $in: ids } } });
      await syncRegistrationCounter();
      const stats = await getCalculatedStats();
      return NextResponse.json({ success: true, count: ids.length, stats }, { headers: NO_CACHE_HEADERS });
    }

    // 1c. SYNC REGISTRATION COUNTER
    if (action === "syncCounter") {
      const maxId = await syncRegistrationCounter();
      return NextResponse.json({ success: true, maxId, nextId: maxId + 1 }, { headers: NO_CACHE_HEADERS });
    }

    // 1d. RESEQUENCE PLAYERS CONSECUTIVELY (1001, 1002...)
    if (action === "resequence") {
      const players = await MongoRegistration.find().sort({ createdAt: 1, registeredAt: 1 });
      let currentNum = 1001;
      for (const p of players) {
        const newId = String(currentNum);
        p.id = newId;
        p.regNumber = newId;
        await p.save();
        currentNum++;
      }
      await syncRegistrationCounter();
      const stats = await getCalculatedStats();
      return NextResponse.json({ success: true, count: players.length, stats }, { headers: NO_CACHE_HEADERS });
    }

    // 2. ASSIGN / UNASSIGN TEAM
    if (action === "assignTeam") {
      const regPlayer = await MongoRegistration.findOne({ id }, "id paymentStatus").lean();
      if (!regPlayer) {
        return NextResponse.json({ success: false, error: "Player not found" }, { status: 404, headers: NO_CACHE_HEADERS });
      }

      if (teamId && teamId !== "unassign" && teamId !== "") {
        if (regPlayer.paymentStatus !== "Approved") {
          return NextResponse.json(
            { success: false, error: "Only approved players can be assigned to a team. Please approve the player first." },
            { status: 400, headers: NO_CACHE_HEADERS }
          );
        }

        const team = await MongoTeam.findOne({ id: teamId });
        if (team && (team.members || []).length >= 14) {
          return NextResponse.json(
            { success: false, error: "Team is full (14/14 players)" },
            { status: 400, headers: NO_CACHE_HEADERS }
          );
        }
        await MongoTeam.updateMany({}, { $pull: { members: id } });
        await MongoTeam.findOneAndUpdate({ id: teamId }, { $addToSet: { members: id } });
        const updatedDoc = await MongoRegistration.findOneAndUpdate({ id }, { teamId }, { new: true }).lean();
        if (team && updatedDoc) {
          sendTeamAssignmentEmail(updatedDoc, team).catch(() => {});
        }
      } else {
        await MongoTeam.updateMany({}, { $pull: { members: id } });
        await MongoRegistration.findOneAndUpdate({ id }, { teamId: null });
      }
      const stats = await getCalculatedStats();
      return NextResponse.json({ success: true, id, teamId, stats }, { headers: NO_CACHE_HEADERS });
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

      const old = await MongoRegistration.findOne({ id }, "paymentStatus notes").lean();
      const updated = await MongoRegistration.findOneAndUpdate(
        { id },
        { $set: cleanPlayerData },
        { new: true }
      ).lean();
      const mappedUpdated = mapPlayer(updated);

      if (
        cleanPlayerData.paymentStatus &&
        old?.paymentStatus !== cleanPlayerData.paymentStatus &&
        ["approved", "rejected"].includes(cleanPlayerData.paymentStatus.toLowerCase())
      ) {
        sendPlayerStatusEmail(mappedUpdated, cleanPlayerData.paymentStatus, cleanPlayerData.notes || "").catch(() => {});
      }

      const stats = await getCalculatedStats();
      return NextResponse.json({ success: true, player: mappedUpdated, stats }, { headers: NO_CACHE_HEADERS });
    }

    // 4. UPDATE STATUS (Approve / Reject / Pending)
    if (id && status) {
      const isRejected = status.toLowerCase() === "rejected";
      
      // If status is Rejected, automatically remove player from any team
      if (isRejected) {
        await MongoTeam.updateMany({}, { $pull: { members: id } });
      }

      const old = await MongoRegistration.findOne({ id }, "notes").lean();
      const historyEntry = {
        timestamp: new Date().toISOString(),
        action: `STATUS_CHANGE_${status.toUpperCase()}`,
        notes: notes || `Status updated to ${status}${isRejected ? " (Removed from team)" : ""}`
      };

      const updateFields = {
        paymentStatus: status,
        notes: notes !== undefined ? notes : (old?.notes || ""),
        ...(isRejected ? { teamId: null } : {}),
        ...(cardDataUrl ? { cardUrl: cardDataUrl } : {})
      };

      const updated = await MongoRegistration.findOneAndUpdate(
        { id },
        {
          $set: updateFields,
          $push: { history: historyEntry }
        },
        { new: true }
      ).lean();

      const mappedUpdated = mapPlayer(updated);

      if (["approved", "rejected"].includes(status.toLowerCase())) {
        sendPlayerStatusEmail(mappedUpdated, status, notes || "", cardDataUrl || updated?.cardUrl).catch(() => {});
      }

      const stats = await getCalculatedStats();
      return NextResponse.json({ success: true, player: mappedUpdated, stats }, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400, headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error("[Admin Players POST Error]:", e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
