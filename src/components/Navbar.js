"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Trophy, Shield, MapPin, FileText, Gift, ArrowRight, Search, Users, HelpCircle } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 lg:h-20 flex items-center justify-between">
        
        {/* Left: Tournament Brand & Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          {/* Mobile: Logo + Title Text */}
          <img
            src="/images/gpl-logo.png"
            alt="Goregaon Premier League"
            className="block sm:hidden h-10 w-auto max-h-11 object-contain shrink-0 drop-shadow-sm"
          />
          <div className="block sm:hidden min-w-0">
            <div className="text-[11px] font-black text-[#081a36] leading-tight tracking-tight">
              Goregaon Premier League{" "}
              <span className="text-amber-500 bg-amber-50 px-1 py-0.5 rounded font-black">Season 4</span>
            </div>
            <div className="text-[9px] font-semibold text-slate-500 leading-tight mt-0.5 truncate">
              Goregaon Purv Vidhan Sabha
            </div>
          </div>

          {/* Desktop Logo + Text */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 drop-shadow-sm">
              <img
                src="/images/gpl-logo.png"
                alt="Goregaon Premier League"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base lg:text-lg font-black text-[#081a36] tracking-tight group-hover:text-[#059669] transition-colors">
                  Goregaon Premier League
                </span>
              </div>
              <p className="text-[10px] lg:text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                <span>Radhe Radhe Chashak</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-medium">Ward 51-54</span>
              </p>
            </div>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-50/80 p-1 rounded-full border border-slate-200/60 shadow-inner">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-[#059669] hover:bg-white transition-all duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Desktop Action Buttons (Check Status + Register) */}
        <div className="hidden sm:flex items-center gap-2.5">
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
            href="#register"
            className="inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-4 lg:px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
          >
            <span>Register Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Actions: Check Status + Register CTA + Hamburger */}
        <div className="flex items-center gap-1.5 sm:hidden">
          <button
            type="button"
            onClick={onOpenStatusModal}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200"
            title="Check Status"
            aria-label="Check Status"
          >
            <Search className="w-4 h-4 text-amber-500" />
          </button>

          <a
            href="#register"
            className="bg-[#059669] hover:bg-[#047857] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            Register
          </a>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 shadow-xl animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenStatusModal();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-600" />
              <span>Check Registration Status</span>
            </span>
            <span className="text-[10px] uppercase font-mono bg-amber-200/60 px-2 py-0.5 rounded">Find ID</span>
          </button>

          <div className="grid grid-cols-2 gap-1 pt-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-[#059669] hover:bg-slate-50 font-bold text-xs transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{link.name}</span>
                </a>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <a
              href="#register"
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
