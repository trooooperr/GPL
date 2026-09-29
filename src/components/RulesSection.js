"use client";

import { Gavel } from "lucide-react";

export default function RulesSection({ rules: customRules }) {
  const defaultRules = [
    "It's going to be a league matches",
    "Match Will Be on Friday, Saturday & Sunday",
    "Every match will be 5 over match",
    "Under 21 and above 40 – first match (1 over bowling or batting compulsory)",
    "Player Aadhaar card or voter ID should be from ward 51 or 54 Goregaon East",
    "Umpire decision will be final decision",
    "5 runs penalty if the team is not present on time",
    "Teams who will not take full list of players will face 3 runs penalty in all the league match",
    "Teams who has short players will have to follow powerplay rule and 5-4 rules",
    "Youtube live",
    "No player will be shifted or given any replacement once the auction is done",
    "Foul language or misbehavior with the management or umpire will lead to penalty of 5 runs"
  ];

  const rulesList = customRules && customRules.length > 0 ? customRules : defaultRules;

  return (
    <section id="rules" className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Rules & Regulations list with balanced sizing */}
          <div className="lg:col-span-6 space-y-5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#091e42] tracking-tight">
              Rules and Regulation
            </h3>

            <div className="space-y-3.5">
              {rulesList.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="text-[#0041b9] shrink-0 mt-0.5">
                    <Gavel className="w-4 h-4" />
                  </div>
                  <span className="text-[14px] sm:text-[15px] font-medium text-slate-800 leading-snug">
                    {rule}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Bigger Auction Poster with NO Border Radius */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-xl shadow-2xl bg-slate-900 border border-slate-200">
              <img
                src="/images/gpl-auction.jpg"
                alt="Radhe Radhe Chashak Registration & Auction Poster"
                className="w-full h-auto object-cover block"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
