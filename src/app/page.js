import { db, dbReady } from "@/lib/db";
import { connectToDatabase, MongoTeam, MongoRegistration } from "@/lib/mongodb";
import Navbar from "@/components/Navbar";
import BannerCarousel from "@/components/BannerCarousel";
import Hero from "@/components/Hero";
import PrizesSection from "@/components/PrizesSection";
import TeamsGrid from "@/components/TeamsGrid";
import RulesSection from "@/components/RulesSection";
import RegistrationForm from "@/components/RegistrationForm";
import VenueMap from "@/components/VenueMap";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Goregaon Premier League (GPL) - Radhe Radhe Chashak",
  description: "Official website of Goregaon Premier League organised by Mohsin Patel & Balram Gupta (Ballu). Ward 51-54 Goregaon East.",
  keywords: ["Goregaon Premier League", "GPL", "Radhe Radhe Chashak", "Mohsin Patel & Balram Gupta (Ballu)", "Ward 51", "Ward 54", "Sambhaji Maidan"]
};

export default async function Home() {
  await dbReady;

  let teams = db.getAllTeams();
  let rules = db.getRules();
  let stats = db.getStats();
  let settings = db.getSettings();

  // Always read fresh from MongoDB for real-time data
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const mongoTeams = await MongoTeam.find().lean();
      const mongoRegs = await MongoRegistration.find().lean();

      if (mongoTeams && mongoTeams.length > 0) {
        teams = mongoTeams.map(t => ({
          id: t.id, name: t.name, shortCode: t.shortCode,
          owner: t.owner, captain: t.captain, established: t.established,
          championships: t.championships, logo: t.logo, members: t.members || [],
          memberDetails: (t.members || [])
            .map(mid => mongoRegs.find(r => r.id === mid))
            .filter(Boolean)
            .map(r => ({ id: r.id, name: r.name, speciality: r.speciality, ward: r.ward, tshirtSize: r.tshirtSize }))
        }));
        db.teams = mongoTeams;
      }

      if (mongoRegs) {
        db.registrations = mongoRegs;
        stats = db.getStats();
      }
    }
  } catch (e) {
    console.error("[Home Page MongoDB Error]:", e.message);
  }

  return (
    <main className="min-h-screen bg-[#f6f8f6] font-sans antialiased text-slate-900">
      <Navbar />
      <BannerCarousel />
      <Hero stats={stats} />
      <PrizesSection stats={stats} settings={settings} />
      <TeamsGrid teams={teams} />
      <RulesSection rules={rules} />
      <RegistrationForm stats={stats} settings={settings} />
      <VenueMap />
      <Footer />
    </main>
  );
}
