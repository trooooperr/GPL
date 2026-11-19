"use client";

import Link from "next/link";
import { Gavel, Calendar, MapPin, Trophy, ArrowRight, Sparkles, Users } from "lucide-react";

export default function AuctionStrip({ stats = {}, settings = {} }) {
  // Dynamically managed from Admin Console — zero hardcoding
  const draftTarget = Number(settings?.totalDraftPlayers) || 150;
  const maxCapacity = Number(settings?.maxCapacity) || Number(stats?.maxCapacity) || 200;
  const totalApproved = stats?.approved || stats?.totalRegistered || 0;

  return (
    <section className="relative w-full bg-gradient-to-b from-[#060e1f] via-[#09152e] to-[#060e1f] border-y border-slate-800/90 py-8 lg:py-10 overflow-hidden font-sans">
      {/* Sleek ambient stadium light beam */}
      <div className="absolute top-0 left-1/4 w-96 h-full bg-blue-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 relative z-10">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6 lg:gap-8 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-2xl">
          
          {/* Left Title & Editorial */}
          <div className="space-y-2 text-center xl:text-left shrink-0 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] sm:text-xs font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>GPL Season 4 Official Schedule</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white tracking-tight leading-tight">
              Grand Player Auction &amp; Fixtures
            </h3>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Live franchise bidding &amp; tournament league matches at Sambhaji Maidan, Goregaon Purv Vidhan Sabha.
            </p>
          </div>

          {/* Middle Schedule Cards: Clean, modern, high-contrast, responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:max-w-2xl">
            
            {/* Auction Date Card */}
            <div className="group bg-gradient-to-br from-amber-500/10 to-transparent hover:from-amber-500/20 border border-amber-500/20 hover:border-amber-400/50 rounded-2xl p-3.5 sm:p-4 transition-all duration-300 shadow-sm flex items-center sm:flex-col sm:items-start gap-3 sm:gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Gavel className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300/80 block">
                  Auction Date
                </span>
                <span className="text-sm sm:text-base font-black text-white block mt-0.5 whitespace-nowrap">
                  7th Dec 2026
                </span>
              </div>
            </div>

            {/* Match Dates Card */}
            <div className="group bg-gradient-to-br from-emerald-500/10 to-transparent hover:from-emerald-500/20 border border-emerald-500/20 hover:border-emerald-400/50 rounded-2xl p-3.5 sm:p-4 transition-all duration-300 shadow-sm flex items-center sm:flex-col sm:items-start gap-3 sm:gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300/80 block">
                  Tournament Matches
                </span>
                <span className="text-sm sm:text-base font-black text-white block mt-0.5 whitespace-nowrap">
                  16, 17, 23 &amp; 24 Jan
                </span>
              </div>
            </div>

            {/* Draft Target & Venue Card (Managed dynamically from console) */}
            <div className="group bg-gradient-to-br from-blue-500/10 to-transparent hover:from-blue-500/20 border border-blue-500/20 hover:border-blue-400/50 rounded-2xl p-3.5 sm:p-4 transition-all duration-300 shadow-sm flex items-center sm:flex-col sm:items-start gap-3 sm:gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300/80 block">
                  Auction Draft Target
                </span>
                <span className="text-sm sm:text-base font-black text-white block mt-0.5 whitespace-nowrap">
                  {draftTarget} Players • 10 Teams
                </span>
              </div>
            </div>

          </div>

          {/* Right CTA Action & Dynamic Registration Capacity */}
          <div className="flex flex-col items-center xl:items-end gap-2.5 shrink-0 w-full sm:w-auto">
            <Link
              href="/auction"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#059669] via-[#047857] to-[#065f46] hover:from-[#047857] hover:to-[#059669] text-white px-7 py-3.5 rounded-xl text-sm font-black shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/80 transition-all duration-300 active:scale-95 group border border-emerald-400/30 whitespace-nowrap"
            >
              <span>Explore Player Auction Pool</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Dynamic Status Counter Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[11px] font-bold text-slate-300">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>
                <strong className="text-white font-black">{totalApproved}</strong> Approved Players &bull; Max Capacity: <strong className="text-emerald-400 font-black">{maxCapacity}</strong>
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
