import {
  connectToDatabase,
  MongoTeam,
  MongoRegistration,
  MongoSetting
} from "@/lib/mongodb";
import { INITIAL_TEAMS, INITIAL_SETTINGS } from "@/lib/constants";
import AuctionPortalClient from "@/components/AuctionPortalClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Player Auction Pool & Draft Roster - Radhe Radhe Chasak GPL4",
  description:
    "Official player auction pool of Goregaon Premier League Season 4. Auction on 7th December 2026. Match dates: 16, 17, 23 & 24 January 2027 at Sambhaji Maidan, Goregaon Purv Vidhan Sabha.",
  keywords: [
    "GPL Auction",
    "GPL Auction Pool",
    "Radhe Radhe Chasak GPL4",
    "Sandeep Jadhav",
    "Tournament Managed by Balram Gupta (Ballu) & Mohsin Patel",
    "Goregaon Premier League Draft",
    "Sambhaji Maidan"
  ]
};

export default async function AuctionPage() {
  let teams = INITIAL_TEAMS;
  let settings = INITIAL_SETTINGS;
  let players = [];
  let stats = {
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    remaining: 200,
    maxCapacity: 200
  };

  try {
    await connectToDatabase();

    const [mongoTeams, mongoRegs, settingDoc, totalCount, approvedCount, rejectedCount, pendingCount] =
      await Promise.all([
        MongoTeam.find().lean(),
        MongoRegistration.find(
          { paymentStatus: "Approved" },
          "id regNumber name speciality ward tshirtSize trackSize paymentStatus photoUrl teamId soldPrice"
        ).lean(),
        MongoSetting.findOne({ key: "global_settings" }).lean(),
        MongoRegistration.countDocuments().catch(() => 0),
        MongoRegistration.countDocuments({ paymentStatus: "Approved" }).catch(() => 0),
        MongoRegistration.countDocuments({ paymentStatus: "Rejected" }).catch(() => 0),
        MongoRegistration.countDocuments({ paymentStatus: "Pending" }).catch(() => 0)
      ]);

    if (settingDoc && settingDoc.value) {
      settings = { ...INITIAL_SETTINGS, ...settingDoc.value };
    }

    stats = {
      total: totalCount || 0,
      approved: approvedCount || 0,
      rejected: rejectedCount || 0,
      pending: pendingCount || 0,
      remaining: Math.max(0, (settings.maxCapacity || 200) - (approvedCount || 0)),
      maxCapacity: settings.maxCapacity || 200
    };

    const regs = (mongoRegs || []).map((r) => {
      let photoUrl = "/images/avatar-placeholder.svg";
      if (r.photoUrl && !r.photoUrl.includes("placeholder")) {
        photoUrl = r.photoUrl.startsWith("data:") ? `/api/player-photo?id=${r.id}` : r.photoUrl;
      }
      return {
        id: r.id,
        regNumber: r.regNumber || (r.id ? r.id.replace(/\D/g, "") : ""),
        name: r.name,
        speciality: r.speciality,
        ward: r.ward,
        tshirtSize: r.tshirtSize,
        trackSize: r.trackSize,
        paymentStatus: r.paymentStatus,
        photoUrl,
        teamId: r.teamId,
        soldPrice: Number(r.soldPrice) || 0
      };
    });
    players = regs;

    const defaultPurse = Number(settings.defaultTeamPurse) || 10000000;
    const rawTeams = mongoTeams && mongoTeams.length > 0 ? mongoTeams : INITIAL_TEAMS;

    teams = rawTeams.map((t) => {
      const initialPurse = typeof t.initialPurse === "number" ? t.initialPurse : defaultPurse;
      const teamMembers = (t.members || [])
        .map((mid) => regs.find((r) => r.id === mid))
        .filter(Boolean);
      const spentPurse = teamMembers.reduce((sum, m) => sum + (Number(m.soldPrice) || 0), 0);
      const remainingPurse = Math.max(0, initialPurse - spentPurse);

      return {
        id: t.id,
        name: t.name,
        shortCode: t.shortCode,
        owner: t.owner,
        captain: t.captain,
        established: t.established || "2024",
        championships: t.championships || 0,
        logo: t.logo?.startsWith("data:") ? `/api/team-logo?id=${t.id}` : (t.logo || "/images/teams/team-csk.png"),
        themeColor: t.themeColor || "#0041b9",
        initialPurse,
        spentPurse,
        remainingPurse,
        members: t.members || []
      };
    });
  } catch (err) {
    console.error("[Auction Page MongoDB Fetch Error]:", err.message);
  }

  return (
    <AuctionPortalClient
      teams={teams}
      players={players}
      stats={stats}
      settings={settings}
    />
  );
}
