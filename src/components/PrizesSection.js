"use client";

import { INITIAL_AWARDS } from "@/lib/constants";

export default function PrizesSection({ stats, settings, awards: propAwards = [] }) {
  const teamsCount = stats?.totalTeams || 10;
  const rawAwards = propAwards && propAwards.length > 0 ? propAwards : INITIAL_AWARDS;

  const features = rawAwards.map((item) => {
    // If a custom value was configured in admin console, always preserve and display it directly!
    if (item.value && String(item.value).trim().length > 0) {
      return item;
    }
    // Only apply defaults when the value is empty or not set
    if (item.title === "Our Teams") {
      return { ...item, value: `${teamsCount} Teams` };
    }
    if (item.title === "Registered Players") {
      return { ...item, value: `${stats?.maxCapacity || 160} Players` };
    }
    return item;
  });

  return (
    <section id="awards" className="py-10 sm:py-16 lg:py-24 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-5xl mx-auto mb-6 sm:mb-12 lg:mb-16 space-y-1.5 sm:space-y-2">
          <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-600 tracking-wide">
            Goregaon Premier League
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-extrabold text-[#091e42] tracking-tight sm:whitespace-nowrap">
            Features &amp; Awards
          </h2>
        </div>

        {/* Responsive Grid: Tight padding and compact gaps on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-7">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl sm:rounded-2xl lg:rounded-[22px] p-4 sm:p-6 lg:p-8 border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Material Symbol Icon */}
              <div className="mb-2.5 sm:mb-4 lg:mb-5">
                <span
                  className="material-symbols-outlined text-[24px] sm:text-[28px] lg:text-[30px] text-[#059669] font-normal leading-none block select-none"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  {item.iconName}
                </span>
              </div>

              {/* Title & Secondary Value */}
              <div className="space-y-1">
                <h3 className="text-[15px] sm:text-[17px] lg:text-[19px] font-bold text-[#091e42] tracking-tight leading-snug">
                  {item.title}
                </h3>
                <p className="text-[13px] sm:text-[14px] lg:text-[15px] font-bold text-slate-700 leading-snug sm:leading-relaxed whitespace-pre-line">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
