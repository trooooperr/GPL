"use client";

export default function PrizesSection({ stats, settings }) {
  const teamsCount = stats?.totalTeams || (settings?.maxCapacity ? Math.round(settings.maxCapacity / 14) : 10);
  const totalCapacity = (settings?.maxCapacity && Number(settings.maxCapacity) !== 168)
    ? Number(settings.maxCapacity)
    : (stats?.maxCapacity || (teamsCount * 14));

  const features = [
    {
      title: "Our Teams",
      value: `${teamsCount} Teams`,
      iconName: "groups",
    },
    {
      title: "Registered Players",
      value: `${totalCapacity} Players`,
      iconName: "sports_cricket",
    },
    {
      title: "Awards & Prizes",
      value: "Multiple Awards Throughout GPL",
      iconName: "emoji_events",
    },
    {
      title: "Registration Award",
      value: "Track & T-shirt for every registered player",
      iconName: "badge",
    },
    {
      title: "Man of the Match",
      value: "₹1000 Every Match",
      iconName: "sports",
    },
    {
      title: "Best Batsman",
      value: "₹5000",
      iconName: "sports_cricket",
    },
    {
      title: "Best Bowler",
      value: "₹5000",
      iconName: "stadium",
    },
    {
      title: "Man of the Series",
      value: "Mobile Phone",
      iconName: "emoji_events",
    },
    {
      title: "Winner & Runner-Up",
      value: "Winner: ₹40,000\nRunner-Up: ₹30,000",
      iconName: "military_tech",
    }
  ];

  return (
    <section id="awards" className="py-16 sm:py-24 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with 1-Line Heading */}
        <div className="text-center max-w-5xl mx-auto mb-12 sm:mb-16 space-y-2">
          <p className="text-sm sm:text-base md:text-lg font-semibold text-slate-600 tracking-wide">
            Radhe Radhe Chashak Goregaon Premier League
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-extrabold text-[#091e42] tracking-tight sm:whitespace-nowrap">
            Features &amp; Awards
          </h2>
        </div>

        {/* 3x3 Card Grid matching clean original layout with bold values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl sm:rounded-[22px] p-7 sm:p-8 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Material Symbol Icon */}
              <div className="mb-5">
                <span
                  className="material-symbols-outlined text-[28px] sm:text-[30px] text-[#0041b9] font-normal leading-none block select-none"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  {item.iconName}
                </span>
              </div>

              {/* Title & Bold Secondary Text */}
              <div className="space-y-1.5">
                <h3 className="text-[18px] sm:text-[19px] font-bold text-[#091e42] tracking-tight leading-snug">
                  {item.title}
                </h3>
                <p className="text-[14px] sm:text-[15px] font-bold text-slate-700 leading-relaxed whitespace-pre-line">
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
