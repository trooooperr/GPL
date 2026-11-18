import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { connectToDatabase, MongoRegistration, MongoTeam } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const isAuthed = await verifyAuthCookie(request);
    if (!isAuthed) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get("filter") || "all";

    await connectToDatabase();
    let query = {};
    if (filterType === "approved") query.paymentStatus = "Approved";
    else if (filterType === "pending") query.paymentStatus = "Pending";
    else if (filterType === "rejected") query.paymentStatus = "Rejected";
    else if (filterType === "sizing") query.teamId = { $ne: null, $nin: ["", "unassign", null] };

    const [players, teams] = await Promise.all([
      MongoRegistration.find(
        query,
        "regNumber id name phone email ward age dob speciality tshirtSize trackSize paymentStatus utrNumber instagramHandle teamId"
      ).lean(),
      MongoTeam.find().lean()
    ]);
    const teamMap = new Map((teams || []).map((t) => [t.id, t.name]));

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return "";
      const val = String(str).replace(/"/g, "\"\"");
      return `"${val}"`;
    };

    let headers = [];
    let rows = [];
    let filename = "GPL_Player_Roster.csv";

    if (filterType === "sizing") {
      filename = "GPL_Uniform_Kit_Sizing_Team_Wise.csv";
      headers = [
        "Team Name",
        "Player ID",
        "Player Name",
        "Mobile Phone",
        "T-Shirt Size",
        "Track Pant Size",
        "Ward",
        "Cricket Speciality"
      ];

      // Sort sold players team-wise, then by player name
      const sortedSoldPlayers = (players || []).slice().sort((a, b) => {
        const teamA = teamMap.get(a.teamId) || a.teamId || "";
        const teamB = teamMap.get(b.teamId) || b.teamId || "";
        const teamCmp = teamA.localeCompare(teamB);
        if (teamCmp !== 0) return teamCmp;
        return (a.name || "").localeCompare(b.name || "");
      });

      rows = sortedSoldPlayers.map((p) => [
        escapeCsv(p.teamId ? (teamMap.get(p.teamId) || p.teamId) : "Unassigned"),
        escapeCsv(p.regNumber || p.id),
        escapeCsv(p.name),
        escapeCsv(p.phone),
        escapeCsv(p.tshirtSize),
        escapeCsv(p.trackSize),
        escapeCsv(p.ward),
        escapeCsv(p.speciality)
      ]);
    } else {
      if (filterType === "approved") {
        filename = "GPL_Auction_Pool_Approved_Players.csv";
      }
      headers = [
        "Registration Number",
        "Player Name",
        "Mobile Phone",
        "Email Address",
        "Ward",
        "Age",
        "Date of Birth",
        "Cricket Speciality",
        "T-Shirt Size",
        "Track Pant Size",
        "Status",
        "Assigned Team"
      ];
      rows = (players || []).map((p) => [
        escapeCsv(p.regNumber || p.id),
        escapeCsv(p.name),
        escapeCsv(p.phone),
        escapeCsv(p.email),
        escapeCsv(p.ward),
        escapeCsv(p.age || ""),
        escapeCsv(p.dob || ""),
        escapeCsv(p.speciality),
        escapeCsv(p.tshirtSize),
        escapeCsv(p.trackSize),
        escapeCsv(p.paymentStatus),
        escapeCsv(p.teamId ? (teamMap.get(p.teamId) || p.teamId) : "Unassigned")
      ]);
    }

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    return new NextResponse("Export Failed: " + error.message, { status: 500 });
  }
}
