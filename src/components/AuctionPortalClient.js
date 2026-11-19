"use client";

import { useState } from "react";
import Link from "next/link";
import { Gavel, Calendar, MapPin, Users, Trophy, Shield, ArrowRight, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuctionPool from "@/components/AuctionPool";
import CheckStatusModal from "@/components/CheckStatusModal";

export default function AuctionPortalClient({
  teams = [],
  players = [],
  stats = {},
  settings = {}
}) {
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 selection:bg-[#059669] selection:text-white">
      {/* Sticky Navigation Bar */}
      <Navbar
        settings={settings}
        onOpenStatusModal={() => setStatusModalOpen(true)}
      />

      {/* Header Banner */}
      <header className="relative bg-gradient-to-br from-[#081a36] via-[#0d2754] to-[#0a1f44] text-white py-12 lg:py-16 border-b border-amber-500/30 overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb / Top Pill */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md">
              <Gavel className="w-3.5 h-3.5" />
              Official Bidding & Draft Pool
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white backdrop-blur-xs border border-white/15">
              Radhe Radhe Chasak GPL Season 4
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                GPL 4 Grand Player Auction
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Explore all verified registered players entering the official draft pool. 10 franchise teams will bid across Category A, B, and C players to select their 150-player rosters.
              </p>
            </div>

            {/* Quick CTA to Teams Portal */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/teams"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all backdrop-blur-xs"
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>View 10 Teams & Squads</span>
              </Link>
              <button
                type="button"
                onClick={() => setStatusModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-[#059669] hover:bg-[#047857] text-white shadow-lg shadow-emerald-900/30 transition-all"
              >
                <span>Check Player Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Key Schedule Badges */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Auction Date</p>
                <p className="text-sm font-black text-white">7th December 2026</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Tournament Matches</p>
                <p className="text-sm font-black text-white">16, 17, 23 & 24 Jan 2027</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Venue</p>
                <p className="text-sm font-black text-white truncate">Sambhaji Maidan, Goregaon (E)</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Draft Target</p>
                <p className="text-sm font-black text-white">150 Players (15 / Team)</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Auction Pool Directory */}
      <section className="py-8 bg-slate-50">
        <AuctionPool
          players={players}
          teams={teams}
          stats={stats}
          settings={settings}
        />
      </section>

      {/* Footer */}
      <Footer settings={settings} />

      {/* Check Status Modal */}
      <CheckStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
      />
    </main>
  );
}
