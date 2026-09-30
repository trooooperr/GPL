import {
  connectToDatabase,
  MongoTeam,
  MongoRegistration,
  MongoRule,
  MongoSetting
} from "@/lib/mongodb";
import { INITIAL_TEAMS, INITIAL_RULES, INITIAL_SETTINGS } from "@/lib/constants";
import Navbar from "@/components/Navbar";
import BannerCarousel from "@/components/BannerCarousel";
import Hero from "@/components/Hero";
import PrizesSection from "@/components/PrizesSection";
import AboutSection from "@/components/AboutSection";
import TeamsGrid from "@/components/TeamsGrid";
import RulesSection from "@/components/RulesSection";
import RegistrationForm from "@/components/RegistrationForm";
import VenueMap from "@/components/VenueMap";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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
  let settings = INITIAL_SETTINGS;
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

    const [mongoTeams, mongoRegs, ruleDoc, settingDoc] = await Promise.all([
      MongoTeam.find().lean(),
      MongoRegistration.find().lean(),
      MongoRule.findOne().lean(),
      MongoSetting.findOne({ key: "global_settings" }).lean(),
    ]);

    if (settingDoc && settingDoc.value) {
      settings = { ...INITIAL_SETTINGS, ...settingDoc.value };
    }

    if (ruleDoc && ruleDoc.rules && Array.isArray(ruleDoc.rules) && ruleDoc.rules.length > 0) {
      rules = ruleDoc.rules;
    }

    const regs = mongoRegs || [];

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

    const total = regs.length;
    const approved = regs.filter((p) => p.paymentStatus === "Approved").length;
    const rejected = regs.filter((p) => p.paymentStatus === "Rejected").length;
    const pending = regs.filter((p) => p.paymentStatus === "Pending").length;
    const totalTeamsCount = teams.length || 11;
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
    <main className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0d1526] to-[#111b2e] font-sans antialiased text-white">
      <Navbar settings={settings} />
      <BannerCarousel />
      <Hero stats={stats} settings={settings} />
      <PrizesSection stats={stats} settings={settings} />
      <AboutSection stats={stats} teams={teams} />
      <TeamsGrid teams={teams} />
      <RulesSection rules={rules} />
      <RegistrationForm stats={stats} settings={settings} />
      <VenueMap />
      <Footer settings={settings} />
    </main>
  );
}
