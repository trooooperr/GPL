"use client";

import Link from "next/link";
import { Gavel, Calendar, MapPin, Users, ArrowRight, Sparkles } from "lucide-react";

export default function AuctionStrip({ stats, settings }) {
  const totalRegistered = stats?.totalRegistrations || stats?.totalRegistered || 10;
  const poolCap = 150; // Official draft pool capacity across 10 teams × 15

  return (
    <section className="relative w-full py-8 sm:py-12 bg-[#081325] border-y border-amber-500/20 overflow-hidden">
      {/* Ambient background stadium glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-[#0c1e3d] via-[#112a55] to-[#0c1e3d] border-2 border-amber-400/40 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left Details */}
          <div className="space-y-3.5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>GPL Season 4 Official Schedule</span>
            </div>

            <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Grand Player Auction &amp; Tournament Dates
            </h3>

            {/* Date Badges Grid */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4 pt-1">
              
              {/* Auction Date Badge */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-bold shadow-xs">
                <Gavel className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Auction Date: <strong className="text-white font-extrabold">7th Dec 2026</strong></span>
              </div>

              {/* Match Dates Badge */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-bold shadow-xs">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Match Dates: <strong className="text-white font-extrabold">16, 17, 23 &amp; 24 Jan 2027</strong></span>
              </div>

              {/* Venue Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs sm:text-sm font-bold shadow-xs">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Venue: <strong className="text-white font-extrabold">Sambhaji Maidan</strong></span>
              </div>

            </div>

            <p className="text-slate-300 text-xs sm:text-sm font-medium">
              150 Verified Players from Ward 51 &amp; 54 will be drafted across 10 tournament franchises (15 players/team).
            </p>
          </div>

          {/* Right Action / CTA Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/auction"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065f46] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm font-extrabold shadow-lg hover:shadow-emerald-900/50 transition-all duration-200 active:scale-95 border border-emerald-400/30 group"
            >
              <span>Explore Player Auction Pool</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300/80">
              <Users className="w-3.5 h-3.5" />
              <span>{totalRegistered} Registered Players &bull; {poolCap} Draft Target</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
