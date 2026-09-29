import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import { db, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  await dbReady;
  try {
    const isAuthed = await verifyAuthCookie(request);
    if (!isAuthed) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const players = db.getAllRegistrations();
    const teams = db.getAllTeams();
    const teamMap = new Map(teams.map(t => [t.id, t.name]));

    const headers = [
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
      "Payment Status",
      "UTR / Transaction ID",
      "Assigned Team"
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return "";
      const val = String(str).replace(/"/g, "\"\"");
      return `"${val}"`;
    };

    const rows = players.map(p => [
      escapeCsv(p.id),
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
      escapeCsv(p.utrNumber || ""),
      escapeCsv(p.teamId ? (teamMap.get(p.teamId) || p.teamId) : "Unassigned")
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"GPL_Player_Roster.csv\""
      }
    });
  } catch (error) {
    return new NextResponse("Export Failed", { status: 500 });
  }
}
