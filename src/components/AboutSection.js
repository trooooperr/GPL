"use client";

import { Award, Target, Users, MapPin, CheckCircle2 } from "lucide-react";

export default function AboutSection() {
  const points = [
    "Grassroots Cricket Mission: Discovering and elevating untapped talent from street cricket to stadium glory.",
    "Ward-Focused Selection: Strict representation ensuring true local pride from Ward 51 & Ward 54 (Goregaon East).",
    "Professional League Standard: 5-over dynamic matches with live scoring, umpire protocols, and YouTube broadcasting.",
    "Equal Opportunity Rules: Special mandatory over participation for players Under 21 and Above 40."
  ];

  return (
    <section id="about" className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
              
              <div className="inline-block px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6 border border-amber-400/20">
                Radhe Radhe Chashak
              </div>

              <h3 className="text-3xl font-black text-white leading-tight mb-4">
                Where Goregaon&#39;s <br />
                <span className="text-amber-400">Street Talent</span> Rises
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Organized with precision by <strong>Mohsin Patel & Balram Gupta (Ballu)</strong> GPL brings IPL-grade atmosphere to our local grounds.
              </p>

              {/* Badges */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    10
                  </div>
                  <span>Franchise Teams competing for the Cup</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    140
                  </div>
                  <span>Players entering the official auction (10 Teams × 14 Players)</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    HD
                  </div>
                  <span>Matches telecasted live on YouTube with commentary</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Mission and Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>About The Tournament</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Discovering, Nurturing &amp; Elevating <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">
                Local Cricketing Superstars
              </span>
            </h2>

            <p className="text-slate-300 text-base leading-relaxed font-light">
              The <strong>Goregaon Premier League (GPL)</strong> is a pioneering cricket initiative born with the mission to give local cricketers the structure, respect, and grand stage they deserve.
            </p>

            <p className="text-slate-400 text-sm leading-relaxed">
              Too often, exceptional tennis and leather ball cricketers in Mumbai lack a systematic pathway to showcase their explosive bowling, batting resilience, and fielding athletics. GPL unites local residential talent, businesses, and team owners into an electrifying seasonal spectacle at <strong>Sambhaji Maidan</strong>.
            </p>

            {/* Feature Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {points.map((pt, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300 leading-snug">{pt}</span>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
