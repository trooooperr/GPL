"use client";

import { useState, useEffect } from "react";
import { Clock, Shield, Sparkles, AlertCircle, ArrowRight, Search, CheckCircle2 } from "lucide-react";

export default function CountdownBanner({ stats, onOpenStatusModal }) {
  // Target tournament date (can be adjusted by organizers)
  const targetDate = new Date("2026-11-28T09:00:00+05:30").getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const maxCapacity = stats?.maxCapacity || 140;
  const approved = stats?.approved || 0;
  const fillPercentage = Math.min(100, Math.round((approved / maxCapacity) * 100));

  return (
    <div className="bg-gradient-to-r from-[#081a36] via-[#0d2347] to-[#081a36] text-white border-y border-blue-900/40 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -left-20 top-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left: Tournament Event Title & Capacity */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Season 2026 Kickoff Countdown</span>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
              Sambhaji Maidan Grand Tournament
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ward 51 &amp; Ward 54 cricket extravaganza organized by <strong>Mohsin Patel &amp; Balram Gupta (Ballu)</strong>.
            </p>

            {/* Capacity Fill Progress */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Player Slots Filled:
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {approved} / {maxCapacity} ({fillPercentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${Math.max(5, fillPercentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Live Countdown Units + Quick Action CTAs */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-center justify-between lg:justify-end gap-6">
            
            {/* Countdown Flip Units */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full sm:w-auto text-center">
              {[
                { label: "DAYS", value: timeLeft.days },
                { label: "HOURS", value: timeLeft.hours },
                { label: "MINS", value: timeLeft.minutes },
                { label: "SECS", value: timeLeft.seconds },
              ].map((unit, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 sm:p-3 min-w-[65px] sm:min-w-[76px] shadow-lg"
                >
                  <div className="font-mono font-black text-xl sm:text-3xl text-amber-400 leading-tight">
                    {String(unit.value).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-wider mt-0.5">
                    {unit.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs: Register or Check Status */}
            <div className="flex flex-col sm:flex-col gap-2.5 w-full sm:w-auto shrink-0">
              <a
                href="#register"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <span>Register Player</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onOpenStatusModal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Check Status</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
