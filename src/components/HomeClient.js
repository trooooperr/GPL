"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import BannerCarousel from "@/components/BannerCarousel";
import CountdownBanner from "@/components/CountdownBanner";
import Hero from "@/components/Hero";
import PrizesSection from "@/components/PrizesSection";
import AuctionPool from "@/components/AuctionPool";
import TeamsGrid from "@/components/TeamsGrid";
import RulesSection from "@/components/RulesSection";
import RegistrationForm from "@/components/RegistrationForm";
import FaqSection from "@/components/FaqSection";
import VenueMap from "@/components/VenueMap";
import Footer from "@/components/Footer";
import CheckStatusModal from "@/components/CheckStatusModal";

export default function HomeClient({ teams, rules, faqs, settings, stats, players }) {
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0d1526] to-[#111b2e] font-sans antialiased text-white selection:bg-[#059669] selection:text-white">
      {/* Sticky Navigation Bar with Check Status & Register CTAs */}
      <Navbar
        settings={settings}
        onOpenStatusModal={() => setStatusModalOpen(true)}
      />

      {/* Hero Carousel */}
      <BannerCarousel />

      {/* Dynamic Tournament Countdown & Slot Urgency Bar */}
      <CountdownBanner
        stats={stats}
        onOpenStatusModal={() => setStatusModalOpen(true)}
      />

      {/* About GPL & Organizers */}
      <Hero stats={stats} settings={settings} />

      {/* Tournament Awards & Cash Prizes */}
      <PrizesSection stats={stats} settings={settings} />

      {/* Live Auction Pool / Verified Players Directory */}
      <AuctionPool players={players} teams={teams} />

      {/* 10 Tournament Franchises & Squads */}
      <TeamsGrid teams={teams} />

      {/* Official Rules & Regulations */}
      <RulesSection rules={rules} />

      {/* Player Registration Portal */}
      <RegistrationForm stats={stats} settings={settings} />

      {/* Interactive FAQ Section */}
      <FaqSection faqs={faqs} />

      {/* Venue Location & Ground Map */}
      <VenueMap />

      {/* Footer */}
      <Footer settings={settings} />

      {/* Public "Check Registration Status" & Digital Player Pass Modal */}
      <CheckStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
      />
    </main>
  );
}
