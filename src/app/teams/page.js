import {
  connectToDatabase,
  MongoTeam,
  MongoRegistration,
  MongoSetting
} from "@/lib/mongodb";
import { INITIAL_TEAMS, INITIAL_SETTINGS } from "@/lib/constants";
import TeamsPortalClient from "@/components/TeamsPortalClient";

export const revalidate = 30;

export const metadata = {
  title: "Franchise Teams & Squads - Radhe Radhe Chasak GPL4",
  description: "Official team rosters, owners, captains, and auction pool players of Goregaon Premier League Season 4.",
  keywords: [
    "GPL Teams",
    "GPL Squads",
    "Radhe Radhe Chasak GPL4",
    "Mohsin Patel",
    "Balram Gupta",
    "Sambhaji Maidan"
  ]
};

export default async function TeamsPage() {
  let teams = INITIAL_TEAMS;
  let settings = INITIAL_SETTINGS;
  let players = [];

  try {
    await connectToDatabase();

    const [mongoTeams, mongoRegs, settingDoc] = await Promise.all([
      MongoTeam.find().lean(),
      MongoRegistration.find(
        { $or: [{ teamId: { $exists: true, $ne: null, $ne: "" } }, { paymentStatus: "Approved" }] },
        "id regNumber name speciality ward tshirtSize trackSize paymentStatus photoUrl teamId"
      ).lean(),
      MongoSetting.findOne({ key: "global_settings" }).lean(),
    ]);

    if (settingDoc && settingDoc.value) {
      settings = { ...INITIAL_SETTINGS, ...settingDoc.value };
    }

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
        teamId: r.teamId
      };
    });
    players = regs;

    if (mongoTeams && mongoTeams.length > 0) {
      teams = mongoTeams.map((t) => ({
        id: t.id,
        name: t.name,
        shortCode: t.shortCode,
        owner: t.owner,
        captain: t.captain,
        established: t.established || "2024",
        championships: t.championships || 0,
        logo: t.logo || "/images/teams/team-csk.png",
        themeColor: t.themeColor || "#0041b9",
        members: t.members || []
      }));
    }
  } catch (err) {
    console.error("[Teams Page MongoDB Fetch Error]:", err.message);
  }

  return (
    <TeamsPortalClient
      teams={teams}
      players={players}
      settings={settings}
    />
  );
}
