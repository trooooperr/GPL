import {
  connectToDatabase,
  MongoTeam,
  MongoRegistration,
  MongoRule,
  MongoFaq,
  MongoSetting
} from "@/lib/mongodb";
import { INITIAL_TEAMS, INITIAL_RULES, INITIAL_FAQS, INITIAL_SETTINGS } from "@/lib/constants";
import HomeClient from "@/components/HomeClient";

export const revalidate = 30;

export const metadata = {
  title: "Goregaon Premier League (GPL) - Radhe Radhe Chashak",
  description: "Official website of Goregaon Premier League organised by Mohsin Patel & Balram Gupta (Ballu). Ward 51-54 Goregaon East.",
  keywords: [
    "Goregaon Premier League",
    "GPL",
    "Radhe Radhe Chashak",
    "Mohsin Patel & Balram Gupta (Ballu)",
    "Ward 51",
    "Ward 54",
    "Sambhaji Maidan"
  ]
};

export default async function Home() {
  let teams = INITIAL_TEAMS;
  let rules = INITIAL_RULES;
  let faqs = INITIAL_FAQS;
  let settings = INITIAL_SETTINGS;
  let players = [];
  let stats = {
    totalRegistrations: 0,
    totalRegistered: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    available: 140,
    remainingSlots: 140,
    totalTeams: 10,
    maxCapacity: 140,
    registrationFee: 100,
    upiId: "shahbazkhandm@okhdfcbank"
  };

  try {
    await connectToDatabase();

    const [
      mongoTeams,
      mongoRegs,
      ruleDoc,
      faqDoc,
      settingDoc,
      totalCount,
      approvedCount,
      rejectedCount,
      pendingCount
    ] = await Promise.all([
      MongoTeam.find().lean(),
      MongoRegistration.find(
        { paymentStatus: "Approved" },
        "id regNumber name speciality ward tshirtSize trackSize paymentStatus photoUrl teamId"
      ).lean(),
      MongoRule.findOne().lean(),
      MongoFaq.findOne().lean(),
      MongoSetting.findOne({ key: "global_settings" }).lean(),
      MongoRegistration.countDocuments().catch(() => 0),
      MongoRegistration.countDocuments({ paymentStatus: "Approved" }).catch(() => 0),
      MongoRegistration.countDocuments({ paymentStatus: "Rejected" }).catch(() => 0),
      MongoRegistration.countDocuments({ paymentStatus: "Pending" }).catch(() => 0)
    ]);

    if (settingDoc && settingDoc.value) {
      settings = { ...INITIAL_SETTINGS, ...settingDoc.value };
    }

    if (ruleDoc && ruleDoc.rules && Array.isArray(ruleDoc.rules) && ruleDoc.rules.length > 0) {
      rules = ruleDoc.rules;
    }

    if (faqDoc && faqDoc.faqs && Array.isArray(faqDoc.faqs) && faqDoc.faqs.length > 0) {
      faqs = faqDoc.faqs;
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
        members: t.members || [],
        memberDetails: (t.members || [])
          .map((mid) => regs.find((r) => r.id === mid))
          .filter(Boolean)
          .map((r) => ({
            id: r.id,
            name: r.name,
            speciality: r.speciality,
            ward: r.ward,
            tshirtSize: r.tshirtSize
          }))
      }));
    }

    const total = totalCount || regs.length;
    const approved = approvedCount || regs.length;
    const rejected = rejectedCount || 0;
    const pending = pendingCount || 0;
    const totalTeamsCount = teams.length || 10;
    const cap = totalTeamsCount * 14;

    stats = {
      totalRegistrations: total,
      totalRegistered: total,
      approved,
      rejected,
      pending,
      available: Math.max(0, cap - approved),
      remainingSlots: Math.max(0, cap - approved),
      totalTeams: totalTeamsCount,
      maxCapacity: cap,
      registrationFee: settings.registrationFee || 100,
      upiId: settings.upiId || "shahbazkhandm@okhdfcbank"
    };
  } catch (e) {
    console.error("[Home Page MongoDB Error]:", e.message);
  }

  return (
    <HomeClient
      teams={teams}
      rules={rules}
      faqs={faqs}
      settings={settings}
      stats={stats}
      players={players}
    />
  );
}
