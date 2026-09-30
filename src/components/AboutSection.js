"use client";

import { Target, CheckCircle2, Trophy, Flame, Sparkles } from "lucide-react";

export default function AboutSection({ stats, teams }) {
  const teamsCount = teams?.length || stats?.totalTeams || 11;
  const totalAuctionCapacity = teamsCount * 14;

  const points = [
    "Grassroots Cricket Mission: Discovering and elevating untapped talent from street cricket to stadium glory.",
    "Ward-Focused Selection: Strict representation ensuring true local pride from Ward 51 & Ward 54 (Goregaon East).",
    "Professional League Standard: 5-over dynamic matches with live digital scoring, certified umpires, and YouTube broadcasting.",
    "Equal Opportunity Rules: Special mandatory over participation for players Under 21 and Above 40."
  ];

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-[#080d19] via-[#091122] to-[#0a1428] text-white relative overflow-hidden border-t border-b border-slate-800/60">
      {/* Background Ambient Spotlights */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-[420px] h-[420px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: About Information & Key Pillars */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider shadow-inner">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>About Goregaon Premier League</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Elevating Street Champions to <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-emerald-400 bg-clip-text text-transparent">
                Grand Stadium Glory
              </span>
            </h2>

            <p className="text-slate-300 text-base leading-relaxed font-normal">
              The <strong>Goregaon Premier League (GPL) - Radhe Radhe Chashak</strong> is Goregaon East&#39;s premier cricketing battleground. Organised with elite professionalism by <strong>Mohsin Patel &amp; Balram Gupta (Ballu)</strong>, GPL provides an authentic IPL-grade tournament experience to local players.
            </p>

            <p className="text-slate-400 text-sm leading-relaxed">
              Every season unites residential talent from <strong>Ward 51 &amp; Ward 54</strong>, local franchise owners, and passionate sports fans into a three-day cricketing festival at <strong>Sambhaji Maidan</strong>.
            </p>

            {/* Badges Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
                <div className="text-2xl sm:text-3xl font-black text-amber-400">{teamsCount}</div>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Franchise Teams</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">{totalAuctionCapacity}</div>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Auction Pool ({teamsCount}×14)</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
                <div className="text-2xl sm:text-3xl font-black text-blue-400">HD</div>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">YouTube Live Telecast</div>
              </div>
            </div>

            {/* Mission Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {points.map((pt, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-3 hover:border-emerald-500/40 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300 leading-snug">{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: ANIMATED "GPL 4" LOGO EMBLEM */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
              
              {/* Outer Glow Halo */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-blue-600/20 rounded-full blur-2xl animate-pulse" />

              {/* Animated Outer Orbit Ring with Dash Spin */}
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-400/40 animate-[spin_20s_linear_infinite]" />

              {/* Animated Middle Orbit Ring - Counter Rotation */}
              <div className="absolute inset-6 rounded-full border border-emerald-400/30 animate-[spin_15s_linear_infinite_reverse]" />

              {/* Orbiting Satellite Star 1 */}
              <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24] absolute top-1 left-1/2 -translate-x-1/2" />
              </div>

              {/* Orbiting Satellite Star 2 */}
              <div className="absolute inset-0 animate-[spin_12s_linear_infinite_reverse]">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] absolute bottom-3 left-1/2 -translate-x-1/2" />
              </div>

              {/* Central Premium 3D Shield Badge */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-[#0e1e38] via-[#09152b] to-[#040b17] border-4 border-amber-400/60 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col items-center justify-center p-6 text-center overflow-hidden group hover:border-amber-400 transition-all duration-500">
                
                {/* Metallic Shimmer Sweep Animation */}
                <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 animate-[shimmer_4s_infinite]" />

                {/* Top Crown & Stars */}
                <div className="flex items-center gap-1.5 text-amber-400 mb-1 animate-bounce">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <Trophy className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </div>

                {/* Tournament Subhead */}
                <span className="text-[10px] sm:text-[11px] font-black tracking-[0.25em] uppercase text-amber-300/90 font-mono">
                  Radhe Radhe Chashak
                </span>

                {/* Animated GPL 4 Main Crest */}
                <div className="my-1 relative flex items-baseline justify-center gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black tracking-tighter bg-gradient-to-br from-white via-slate-100 to-slate-300 bg-clip-text text-transparent drop-shadow-md">
                    GPL
                  </span>
                  
                  {/* Glowing Number 4 with Flame Accent */}
                  <span className="text-5xl sm:text-6xl font-black italic bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] relative">
                    4
                    <Flame className="w-4 h-4 text-amber-400 absolute -top-1 -right-3 animate-pulse" />
                  </span>
                </div>

                {/* Season Ribbon */}
                <div className="mt-1 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/50 shadow-sm">
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-amber-200">
                    Season 4 • 2026-27
                  </span>
                </div>

                {/* Bottom Cricket Seam Motif */}
                <div className="mt-3 flex items-center gap-1.5 opacity-80">
                  <div className="h-0.5 w-8 bg-gradient-to-r from-transparent to-emerald-400" />
                  <span className="text-[9px] font-bold tracking-wider text-emerald-400 uppercase">
                    Goregaon East
                  </span>
                  <div className="h-0.5 w-8 bg-gradient-to-l from-transparent to-emerald-400" />
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
