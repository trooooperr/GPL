"use client";

import { Shield, Users, Zap, Calendar, Award, Tv } from "lucide-react";

export default function StatsCounter() {
  const highlights = [
    {
      icon: Users,
      value: "12 Teams",
      label: "Franchise Squads",
      color: "text-blue-400"
    },
    {
      icon: Shield,
      value: "168 Players",
      label: "Handpicked Talent",
      color: "text-emerald-400"
    },
    {
      icon: Zap,
      value: "5 Overs",
      label: "Fast-Paced Action",
      color: "text-amber-400"
    },
    {
      icon: Award,
      value: "₹70,000+",
      label: "Total Cash Prizes",
      color: "text-purple-400"
    },
    {
      icon: Calendar,
      value: "Fri • Sat • Sun",
      label: "Weekend League",
      color: "text-cyan-400"
    },
    {
      icon: Tv,
      value: "YouTube Live",
      label: "Full HD Streaming",
      color: "text-red-400"
    }
  ];

  return (
    <section className="relative bg-slate-900/80 border-y border-slate-800 py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all text-center group"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 mb-3 group-hover:scale-110 transition-transform">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {item.value}
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
