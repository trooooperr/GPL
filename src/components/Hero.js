"use client";

import { useState } from "react";
import { X, ArrowRight } from "lucide-react";

export default function Hero() {
  const [showModal, setShowModal] = useState(false);

  return (
    <section id="about" className="bg-white text-slate-900 py-12 sm:py-20 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Clean Editorial Info */}
          <div className="lg:col-span-5 space-y-6">
            
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              About GPL
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Radhe Radhe Chashak season this time is coming up with unique concept of <strong>Goregaon Premier league</strong> organised by <strong>Mohsin Patel & Balram Gupta (Ballu)</strong>.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#0041b9] hover:bg-[#003399] text-white px-7 py-3 rounded-md text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-98"
              >
                Read More...
              </button>

              <a
                href="#register"
                className="text-[#0041b9] hover:underline font-bold text-sm flex items-center gap-1.5 transition-colors"
              >
                <span>Register Player</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

          </div>

          {/* Right Column: High Definition Posters with Full Responsive Mobile & Tablet Layout */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full max-w-2xl">
              
              {/* Place 1: Official GPL Logo / Stadium Poster (GPL Ward 51-54) */}
              <div className="rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-slate-900 border border-slate-200">
                <img
                  src="/images/gpl-card-1.jpg"
                  alt="GPL Ward 51-54 Radhe Radhe Chashak Poster"
                  className="w-full h-auto object-cover block"
                  loading="lazy"
                />
              </div>

              {/* Place 2: Shri Mohsin Patel & Balram Gupta (Ballu) - A Link Between You & Your Dream */}
              <div className="rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-slate-900 border border-slate-200">
                <img
                  src="/images/gpl-card-2.jpg"
                  alt="A Link Between You & Your Dream - Mohsin Patel & Balram Gupta (Ballu)"
                  className="w-full h-auto object-cover block"
                  loading="lazy"
                />
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Clean Read More Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-scaleUp text-slate-800 space-y-4">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900">
              GPL Radhe Radhe Chashak
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed">
              The Goregaon Premier League is a pioneering cricket league with a primary mission to discover, nurture, and elevate cricketers from grassroots levels. It endeavors to unite the finest local cricket talent in Goregaon, creating a comprehensive platform for players to showcase their skills.
            </p>

            <p className="text-sm text-slate-600 leading-relaxed">
              As the organizer, GPL is committed to bridging the gap between street cricket and stadium glory, aiming to bring the raw energy and talent of street cricket onto the grand stage across <strong>Ward 51 &amp; Ward 54, Goregaon East</strong>.
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Organised by: <strong>Mohsin Patel & Balram Gupta (Ballu)</strong></span>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </section>
  );
}
