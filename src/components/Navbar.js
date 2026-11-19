"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Trophy,
  Shield,
  MapPin,
  FileText,
  Gift,
  ArrowRight,
  Search,
  Users,
  HelpCircle,
  Gavel
} from "lucide-react";

export default function Navbar({ onOpenStatusModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/", icon: Trophy },
    { name: "Auction Pool", href: "/auction", icon: Gavel },
    { name: "Teams & Squads", href: "/teams", icon: Users },
    { name: "About", href: "/#about", icon: Shield },
    { name: "Awards", href: "/#awards", icon: Gift },
    { name: "Rules", href: "/#rules", icon: FileText },
    { name: "FAQ", href: "/#faq", icon: HelpCircle },
    { name: "Venue", href: "/#location", icon: MapPin },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80"
          : "bg-white/90 backdrop-blur-sm border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 lg:h-20 flex items-center justify-between gap-2">
        
        {/* Left: Tournament Brand & Logo — Fully responsive and collision-free */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 shrink">
          {/* Logo */}
          <img
            src="/images/gpl-logo.png"
            alt="Goregaon Premier League"
            className="h-9 sm:h-12 lg:h-14 w-auto object-contain shrink-0 drop-shadow-sm transition-transform group-hover:scale-105"
          />

          {/* Text block */}
          <div className="min-w-0 overflow-hidden">
            {/* Line 1: Name + Season 4 badge */}
            <div className="flex items-center gap-1.5 flex-nowrap">
              <span className="text-xs sm:text-base lg:text-lg font-black text-[#081a36] tracking-tight leading-tight group-hover:text-[#059669] transition-colors truncate">
                <span className="hidden sm:inline">Goregaon Premier League</span>
                <span className="sm:hidden">GPL Season 4</span>
              </span>
              {/* Season 4 highlight badge */}
              <span
                className="hidden min-[480px]:inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg font-black text-[9px] sm:text-xs text-white leading-tight shadow-xs shrink-0"
                style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 60%, #7c3aed 100%)" }}
              >
                ✦ S4
              </span>
            </div>
            {/* Line 2: Subtitle */}
            <p className="text-[8.5px] sm:text-[10px] lg:text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-tight mt-0.5 truncate">
              Goregaon Purv Vidhan Sabha
            </p>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-50/80 p-1 rounded-full border border-slate-200/60 shadow-inner">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                link.name === "Auction Pool"
                  ? "text-amber-700 bg-amber-50/80 hover:bg-amber-100 hover:text-amber-900 font-extrabold"
                  : "text-slate-700 hover:text-[#059669] hover:bg-white"
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Desktop Action Buttons (Auction + Check Status + Register) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Link
            href="/auction"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 transition-all border border-amber-200/90 shadow-2xs"
            title="View Live Player Auction Pool"
          >
            <Gavel className="w-3.5 h-3.5 text-amber-600" />
            <span>Auction Pool</span>
          </Link>

          <button
            type="button"
            onClick={onOpenStatusModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#081a36] hover:bg-slate-100 transition-all border border-slate-200/90 shadow-2xs cursor-pointer"
            title="Check verification and auction pool status"
          >
            <Search className="w-3.5 h-3.5 text-amber-500" />
            <span>Check Status</span>
          </button>

          <a
            href="/#register"
            className="inline-flex items-center gap-1.5 bg-[#059669] hover:bg-[#047857] text-white px-4 lg:px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
          >
            <span>Register Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Actions: Auction + Search + Register CTA + Hamburger (Shrink-0 guaranteed visible) */}
        <div className="flex items-center gap-1 sm:hidden shrink-0">
          <Link
            href="/auction"
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 shadow-2xs active:scale-95 transition-all"
            title="Auction Pool"
          >
            <Gavel className="w-3.5 h-3.5 text-amber-600" />
            <span>Auction</span>
          </Link>

          <button
            type="button"
            onClick={onOpenStatusModal}
            className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 active:scale-95"
            title="Check Status"
            aria-label="Check Status"
          >
            <Search className="w-4 h-4 text-amber-500" />
          </button>

          <a
            href="/#register"
            className="bg-[#059669] hover:bg-[#047857] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            Register
          </a>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors ml-0.5"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2.5 shadow-xl animate-in fade-in duration-200">
          <Link
            href="/auction"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 text-amber-950 font-bold text-xs shadow-xs"
          >
            <span className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-amber-600" />
              <span>Live Player Auction Pool</span>
            </span>
            <span className="text-[10px] uppercase font-mono bg-amber-200/80 text-amber-900 font-black px-2 py-0.5 rounded">
              7 Dec 2026
            </span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenStatusModal();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-600" />
              <span>Check Registration Status</span>
            </span>
            <span className="text-[10px] uppercase font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700">Find ID</span>
          </button>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-colors ${
                    link.name === "Auction Pool"
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "text-slate-700 hover:text-[#059669] hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{link.name}</span>
                </a>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <a
              href="/#register"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded-xl text-xs font-bold shadow-sm"
            >
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
