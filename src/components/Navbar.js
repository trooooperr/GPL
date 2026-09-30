"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Trophy, Shield, MapPin, FileText, Gift, ArrowRight } from "lucide-react";

export default function Navbar() {
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
    { name: "Home", href: "#", icon: Trophy },
    { name: "About", href: "#about", icon: Shield },
    { name: "Awards", href: "#awards", icon: Gift },
    { name: "Teams", href: "#teams", icon: Trophy },
    { name: "Rules", href: "#rules", icon: FileText },
    { name: "Venue", href: "#location", icon: MapPin },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80"
          : "bg-white/90 backdrop-blur-sm border-b border-slate-100"
      }`}
    >
      {/* Reduced navbar height on mobile (h-14), original h-20 on large screens */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 lg:h-20 flex items-center justify-between">
        
        {/* Left: Tournament Brand & Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Mobile Only: Big Crisp Logo directly on navbar without text or outer box */}
          <img
            src="/images/logo.png"
            alt="Goregaon Premier League"
            className="block sm:hidden h-11 w-auto max-h-12 object-contain shrink-0"
          />

          {/* Large Device Only: Full logo box + brand text (Unchanged for desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-white p-1 border border-slate-100 shadow-sm flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/images/logo.png"
                alt="Goregaon Premier League"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-[#081a36] tracking-tight group-hover:text-[#059669] transition-colors">
                  Goregaon Premier League
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                <span>Radhe Radhe Chashak</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-medium">Ward 51-54</span>
              </p>
            </div>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-50/80 p-1 rounded-full border border-slate-200/60 shadow-inner">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-bold text-slate-700 hover:text-[#059669] hover:bg-white transition-all duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Desktop Register CTA Button */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="#register"
            className="inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
          >
            <span>Register Now</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile Actions: Register CTA + Hamburger Icon */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="#register"
            className="bg-[#059669] hover:bg-[#047857] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            Register
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 shadow-xl animate-fadeIn">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:text-[#059669] hover:bg-slate-50 font-bold text-sm transition-colors"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{link.name}</span>
              </a>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <a
              href="#register"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white py-3 rounded-xl text-sm font-bold shadow-sm"
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
