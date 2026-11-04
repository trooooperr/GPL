"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck, Mail, MapPin } from "lucide-react";
import { INITIAL_FAQS } from "@/lib/constants";

export default function FaqSection({ faqs: propFaqs = [] }) {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = propFaqs && propFaqs.length > 0 ? propFaqs : INITIAL_FAQS;

  return (
    <section id="faq" className="py-16 sm:py-24 bg-slate-50 text-slate-900 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#059669] text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#081a36] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about eligibility, documentation, player auction, and tournament kit distribution.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-emerald-100 text-[#059669]" : "text-slate-500"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Strip */}
        <div className="bg-gradient-to-r from-[#081a36] to-[#0d2854] text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-sm sm:text-base">Still have questions?</h4>
            <p className="text-xs text-blue-200/80">
              Our tournament coordinators are here to assist you with registration and verification.
            </p>
          </div>
          <a
            href="mailto:goregaonpremierleague11@gmail.com"
            className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Email Admin Desk</span>
          </a>
        </div>

      </div>
    </section>
  );
}
