import { NextResponse } from "next/server";
import { connectToDatabase, MongoRegistration, MongoTeam } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("query") || "").trim();

    if (!query) {
      return NextResponse.json({ success: false, error: "Please enter a phone number or registration ID." }, { status: 400 });
    }

    await connectToDatabase();

    // Clean query - check if phone digits or reg number
    const cleanPhone = query.replace(/\D/g, "");
    const cleanQuery = query.toLowerCase();

    // Search query conditions: exact phone match, registration number, or ID
    const conditions = [];
    if (cleanPhone.length >= 7) {
      conditions.push({ phone: { $regex: cleanPhone, $options: "i" } });
    }
    conditions.push({ regNumber: { $regex: `^${query}$`, $options: "i" } });
    conditions.push({ id: { $regex: `^${query}$`, $options: "i" } });
    
    // Also try numeric ID match
    if (cleanPhone) {
      conditions.push({ regNumber: cleanPhone });
    }

    const player = await MongoRegistration.findOne(
      { $or: conditions },
      "id regNumber name phone ward speciality tshirtSize trackSize paymentStatus photoUrl teamId notes createdAt"
    ).lean();

    if (!player) {
      return NextResponse.json({
        success: false,
        error: "No registration found matching your phone number or ID. Please check the details and try again."
      }, { status: 404 });
    }

    // If player is assigned to a team, fetch team name & logo
    let teamInfo = null;
    if (player.teamId) {
      const team = await MongoTeam.findOne({ id: player.teamId }, "id name shortCode logo").lean();
      if (team) {
        teamInfo = {
          id: team.id,
          name: team.name,
          shortCode: team.shortCode,
          logo: team.logo
        };
      }
    }

    // Return safe public details
    return NextResponse.json({
      success: true,
      player: {
        id: player.id,
        regNumber: player.regNumber || (player.id ? player.id.replace(/\D/g, "") : ""),
        name: player.name,
        phone: player.phone ? player.phone.slice(-4).padStart(player.phone.length, "*") : "",
        rawPhone: player.phone,
        ward: player.ward,
        speciality: player.speciality,
        tshirtSize: player.tshirtSize,
        trackSize: player.trackSize,
        paymentStatus: player.paymentStatus || "Pending",
        photoUrl: player.photoUrl && !player.photoUrl.includes("placeholder") ? player.photoUrl : null,
        team: teamInfo,
        notes: player.paymentStatus === "Rejected" ? (player.notes || "Incomplete documentation or address verification issue") : null,
        createdAt: player.createdAt
      }
    });
  } catch (error) {
    console.error("[Status API Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to look up registration status." }, { status: 500 });
  }
}
