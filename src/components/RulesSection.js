"use client";

import { Gavel } from "lucide-react";

export default function RulesSection({ rules = [] }) {
  const rulesList = Array.isArray(rules) ? rules : [];

  return (
    <section id="rules" className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Rules & Regulations list dynamically managed via Admin Panel */}
          <div className="lg:col-span-6 space-y-5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#091e42] tracking-tight">
              Rules and Regulation
            </h3>

            {rulesList.length === 0 ? (
              <p className="text-slate-500 text-sm italic">
                Official tournament rules will be announced soon.
              </p>
            ) : (
              <div className="space-y-3.5">
                {rulesList.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="text-[#059669] shrink-0 mt-0.5">
                      <Gavel className="w-4 h-4" />
                    </div>
                    <span className="text-[14px] sm:text-[15px] font-medium text-slate-800 leading-snug">
                      {rule}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: GPL Poster */}
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
