"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Search,
  Shield,
  ArrowLeft,
  Sparkles,
  MapPin,
  Calendar,
  Shirt,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import CheckStatusModal from "@/components/CheckStatusModal";

export default function TeamsPortalClient({ teams = [], players = [], settings = {} }) {
  // Currently selected team ID ('all' for auction pool or team.id)
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || "team-1");
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Current active team
  const currentTeam = useMemo(() => {
    if (selectedTeamId === "all") return null;
    return teams.find((t) => t.id === selectedTeamId) || teams[0] || null;
  }, [selectedTeamId, teams]);

  // Current active theme color
  const activeThemeColor = currentTeam?.themeColor || "#0041b9";

  // Filtered players for current view
  const displayPlayers = useMemo(() => {
    let list = [];
    if (selectedTeamId === "all") {
      // Unallocated auction pool
      list = players.filter((p) => p.paymentStatus === "Approved" && (!p.teamId || p.teamId === ""));
    } else {
      // Assigned to current team
      list = players.filter((p) => p.teamId === selectedTeamId);
    }

    // Filter by role
    if (selectedRole !== "all") {
      list = list.filter((p) => {
        const spec = (p.speciality || "").toLowerCase();
        if (selectedRole === "batsman") return spec.includes("bat");
        if (selectedRole === "bowler") return spec.includes("bowl");
        if (selectedRole === "allrounder") return spec.includes("all");
        if (selectedRole === "wicketkeeper") return spec.includes("keeper") || spec.includes("wk");
        return true;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.regNumber || "").toLowerCase().includes(q) ||
          (p.ward || "").toLowerCase().includes(q) ||
          (p.speciality || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedTeamId, selectedRole, searchQuery, players]);

  return (
    <div
      className="min-h-screen text-white font-sans selection:bg-amber-400 selection:text-slate-900 transition-colors duration-500"
      style={{
        background: `radial-gradient(circle at 50% 0%, ${activeThemeColor}30 0%, #0a0f1d 45%, #050811 100%)`
      }}
    >
      {/* Top Floating Glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] blur-[140px] pointer-events-none opacity-40 transition-all duration-700 -z-10"
        style={{ backgroundColor: activeThemeColor }}
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#081022]/85 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <div className="hidden sm:block h-5 w-[1px] bg-white/10" />

            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="GPL Logo" className="w-7 h-7 object-contain" />
              <div className="text-xs font-black tracking-wide">
                <span className="text-white">GPL4</span>{" "}
                <span className="text-amber-400 font-bold hidden md:inline">• Radhe Radhe Chasak</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Check Status / Pass</span>
            </button>

            <Link
              href="/#register"
              className="px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-sm hidden sm:inline-flex"
            >
              Register Now
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Page Title & Context */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Radhe Radhe Chasak GPL4 Franchises &amp; Squads</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Select Franchise Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Click on any team below to customize the page theme, view official team owners, captain, and verified squad roster.
          </p>
        </div>

        {/* TEAM SELECTOR CAROUSEL / GRID */}
        <div className="relative">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
            {teams.map((team) => {
              const isSelected = selectedTeamId === team.id;
              const squadCount = players.filter((p) => p.teamId === team.id).length;
              return (
                <button
                  key={team.id}
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setSelectedRole("all");
                  }}
                  className={`snap-start shrink-0 px-3.5 py-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2.5 text-left cursor-pointer ${
                    isSelected
                      ? "bg-white/15 border-white shadow-lg scale-102"
                      : "bg-[#0b1426]/70 hover:bg-white/10 border-white/10 opacity-75 hover:opacity-100"
                  }`}
                  style={{
                    borderColor: isSelected ? (team.themeColor || "#f59e0b") : undefined,
                    boxShadow: isSelected ? `0 0 20px ${team.themeColor || "#f59e0b"}40` : undefined
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg bg-black/30 border border-white/10 p-1 flex items-center justify-center shrink-0"
                    style={{ borderColor: isSelected ? (team.themeColor || "#f59e0b") : "rgba(255,255,255,0.1)" }}
                  >
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Shield className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-black text-white leading-tight whitespace-nowrap">
                      {team.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-amber-300">{team.shortCode}</span>
                      <span>•</span>
                      <span>{squadCount}/14</span>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Auction Pool Tab */}
            <button
              onClick={() => {
                setSelectedTeamId("all");
                setSelectedRole("all");
              }}
              className={`snap-start shrink-0 px-3.5 py-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2.5 text-left cursor-pointer ${
                selectedTeamId === "all"
                  ? "bg-emerald-500/20 border-emerald-400 shadow-lg scale-102"
                  : "bg-[#0b1426]/70 hover:bg-white/10 border-white/10 opacity-75 hover:opacity-100"
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-400 font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white leading-tight whitespace-nowrap">
                  Auction Draft Pool
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                  {players.filter((p) => p.paymentStatus === "Approved" && (!p.teamId || p.teamId === "")).length} Available
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ACTIVE TEAM HERO BANNER */}
        {currentTeam ? (
          <div
            className="rounded-3xl border border-white/20 p-6 sm:p-8 relative overflow-hidden transition-all duration-500 shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${activeThemeColor}25 0%, rgba(13, 24, 46, 0.95) 60%, rgba(8, 16, 32, 0.98) 100%)`,
              borderColor: `${activeThemeColor}66`,
              boxShadow: `0 10px 40px ${activeThemeColor}20`
            }}
          >
            {/* Background Brand Watermark */}
            <div
              className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: activeThemeColor }}
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
              
              {/* Franchise Logo & Brand Badge */}
              <div className="md:col-span-4 flex items-center gap-4 sm:gap-6">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-black/40 border-2 p-2.5 flex items-center justify-center shrink-0 shadow-xl"
                  style={{
                    borderColor: activeThemeColor,
                    boxShadow: `0 0 30px ${activeThemeColor}40`
                  }}
                >
                  {currentTeam.logo ? (
                    <img
                      src={currentTeam.logo}
                      alt={currentTeam.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Shield className="w-12 h-12 text-slate-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div
                    className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black tracking-wider uppercase border"
                    style={{
                      backgroundColor: `${activeThemeColor}25`,
                      borderColor: `${activeThemeColor}88`,
                      color: "#ffffff"
                    }}
                  >
                    CODE: {currentTeam.shortCode}
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                    {currentTeam.name}
                  </h2>
                  <div className="text-xs text-slate-300 font-semibold">
                    Radhe Radhe Chasak GPL4 Franchise
                  </div>
                </div>
              </div>

              {/* Franchise Intel Grid */}
              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Owner</span>
                  <div className="font-bold text-white truncate">{currentTeam.owner || "Mohsin & Ballu"}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Team Captain</span>
                  <div className="font-bold text-amber-300 truncate">{currentTeam.captain || "Franchise Captain"}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Championships</span>
                  <div className="font-bold text-white flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentTeam.championships || 0} Titles</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Squad Allocated</span>
                  <div className="font-mono font-bold text-emerald-400">
                    {displayPlayers.length} / 14 Players
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Auction Pool Header Banner */
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-[#0d2347] to-emerald-950/40 p-6 sm:p-8 relative overflow-hidden shadow-xl">
            <div className="max-w-xl space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase">
                <Sparkles className="w-3 h-3" />
                Live Auction Draft Pool
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Unallocated Verified Players
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                These players have completed Aadhaar verification and registration fee payment. They are ready for the franchise draft auction!
              </p>
            </div>
          </div>
        )}

        {/* FILTER & SEARCH TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          
          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: "All Roles" },
              { id: "batsman", label: "Batsmen" },
              { id: "bowler", label: "Bowlers" },
              { id: "allrounder", label: "All-Rounders" },
              { id: "wicketkeeper", label: "Keepers" }
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedRole === role.id
                    ? "bg-white text-slate-900 shadow-md"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player name or ward..."
              className="w-full px-3.5 py-2 pl-9 rounded-xl bg-white/5 border border-white/10 focus:border-amber-400 focus:bg-white/10 text-xs font-semibold text-white placeholder-slate-400 outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

        </div>

        {/* PLAYER SQUAD GRID */}
        {displayPlayers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayPlayers.map((player) => (
              <div
                key={player.id || player.regNumber}
                className="bg-[#0b1426]/80 hover:bg-[#0f1b33] rounded-2xl border p-4 transition-all duration-300 space-y-3 relative group shadow-sm hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  borderColor: `${activeThemeColor}40`
                }}
              >
                {/* Top Badge: Reg Number & Ward */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span
                    className="font-black px-2 py-0.5 rounded-md border"
                    style={{
                      backgroundColor: `${activeThemeColor}20`,
                      borderColor: `${activeThemeColor}50`,
                      color: "#fcd34d"
                    }}
                  >
                    #{player.regNumber}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    {player.ward || "Ward 51/54"}
                  </span>
                </div>

                {/* Player Photo + Info */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-xl bg-slate-800 border-2 overflow-hidden flex items-center justify-center shrink-0 shadow-md relative"
                    style={{ borderColor: activeThemeColor }}
                  >
                    {player.photoUrl ? (
                      <img
                        src={player.photoUrl}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-900/60 text-white font-black text-xl flex items-center justify-center">
                        {player.name?.[0] || "P"}
                      </div>
                    )}
                    {player.paymentStatus === "Approved" && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm text-white truncate leading-tight group-hover:text-amber-300 transition-colors">
                      {player.name}
                    </h3>
                    <div className="text-xs text-amber-200/90 font-semibold truncate mt-0.5">
                      {player.speciality || "Cricket Player"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                      <Shirt className="w-3 h-3 text-slate-400" />
                      <span>Kit: {player.tshirtSize || "M"} / {player.trackSize || "M"}</span>
                    </div>
                  </div>
                </div>

                {/* Team Tag Strip */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{currentTeam ? currentTeam.name : "Verified in Pool"}</span>
                  </span>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <Users className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="font-bold text-base text-white">No players found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No players matched "${searchQuery}". Try a different search term or reset the role filter.`
                : currentTeam
                ? `No players are currently allocated to ${currentTeam.name}. Check the Auction Draft Pool tab to see available players!`
                : "No unallocated players in the auction pool right now."}
            </p>
          </div>
        )}

      </main>

      {/* Check Status Modal */}
      <CheckStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
      />
    </div>
  );
}
