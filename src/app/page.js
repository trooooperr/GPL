import { db, dbReady } from "@/lib/db";
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
  const stats = db.getStats();
  const teams = db.getAllTeams();
  const rules = db.getRules();
  const settings = db.getSettings();

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
