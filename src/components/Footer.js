"use client";

export default function Footer() {
  return (
    <footer className="bg-[#0b1220] text-[#cbd5e1] py-3.5 sm:py-5 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-6">
        
        {/* Brand & Organizer details: Hidden on small devices (< sm), visible on desktop/tablet */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="h-9 w-auto bg-white p-1 rounded-md flex items-center justify-center">
            <img
              src="/images/logo.png"
              alt="GPL Logo"
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="text-xs text-slate-400 text-left leading-tight">
            <strong className="text-white block font-semibold">Goregaon Premier League</strong>
            Organised by Mohsin Patel &amp; Balram Gupta (Ballu)
          </div>
        </div>

        {/* Copyright notice: Minimal, compact height on mobile */}
        <div className="text-[11px] sm:text-xs text-slate-400 text-center sm:text-right w-full sm:w-auto py-0.5">
          <p>© {new Date().getFullYear()} Goregaon Premier League. All Rights Reserved.</p>
        </div>

      </div>
    </footer>
  );
}
