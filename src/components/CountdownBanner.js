"use client";

import { useState, useEffect } from "react";
import { Clock, Shield, Sparkles, AlertCircle, ArrowRight, Search, CheckCircle2 } from "lucide-react";

export default function CountdownBanner({ stats, settings, onOpenStatusModal }) {
  // Target countdown date configurable via admin settings (defaults to 2026-11-28)
  const deadlineStr = settings?.registrationDeadline || "2026-11-28T09:00";
  let targetDate;
  try {
    const parsed = new Date(deadlineStr).getTime();
    targetDate = isNaN(parsed) ? new Date("2026-11-28T09:00:00+05:30").getTime() : parsed;
  } catch {
    targetDate = new Date("2026-11-28T09:00:00+05:30").getTime();
  }

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
          
          {/* Left: Tournament Event Title & Capacity */}
          <div className="w-full lg:max-w-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Season 2026 Kickoff</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Sambhaji Maidan, Goregaon (E)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                Radhe Radhe Chasak GPL4
              </h3>
              <span className="text-xs text-slate-300 font-medium">
                Organized by <strong className="text-white">Mohsin Patel &amp; Balram Gupta (Ballu)</strong>
              </span>
            </div>

            {/* Capacity Fill Progress - Compact Bar */}
            <div className="flex items-center gap-3 pt-0.5">
              <div className="flex-1 max-w-xs h-2 rounded-full bg-white/10 overflow-hidden border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${Math.max(5, fillPercentage)}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-300 font-medium whitespace-nowrap">
                Slots: <span className="text-emerald-400 font-mono font-bold">{approved}/{maxCapacity}</span> ({fillPercentage}%)
              </span>
            </div>
          </div>

          {/* Right: Live Countdown Units + Quick Action CTAs */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center justify-between lg:justify-end gap-3 sm:gap-4">
            
            {/* Countdown Flip Units */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center w-full sm:w-auto">
              {[
                { label: "DAYS", value: timeLeft.days },
                { label: "HOURS", value: timeLeft.hours },
                { label: "MINS", value: timeLeft.minutes },
                { label: "SECS", value: timeLeft.seconds },
              ].map((unit, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-[56px] sm:min-w-[62px] shadow-sm text-center"
                >
                  <div className="font-mono font-black text-lg sm:text-xl text-amber-400 leading-none">
                    {String(unit.value).padStart(2, "0")}
                  </div>
                  <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-wider mt-1">
                    {unit.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs: Register or Check Status */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <a
                href="#register"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span>Register Player</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={onOpenStatusModal}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Search className="w-3 h-3 text-amber-400" />
                <span>Check Status</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
