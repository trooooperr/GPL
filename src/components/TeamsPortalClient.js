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
  Shirt,
  CheckCircle2
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#059669] selection:text-white transition-colors duration-500">
      
      {/* Top Ambient Franchise Glow (Subtle Light Tint) */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[320px] blur-[150px] pointer-events-none opacity-15 transition-all duration-700 -z-10"
        style={{ backgroundColor: activeThemeColor }}
      />

      {/* Navigation Header (Clean White Theme matching Main Site) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Back to Home</span>
            </Link>

            <div className="hidden sm:block h-5 w-[1px] bg-slate-200" />

            <div className="flex items-center gap-2">
              <img src="/images/gpl-logo.png" alt="GPL Logo" className="w-7 h-7 object-contain" />
              <div className="text-xs font-black tracking-wide text-slate-900">
                <span>GPL4</span>{" "}
                <span className="text-[#059669] font-bold hidden md:inline">• Radhe Radhe Chasak</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Search className="w-3.5 h-3.5 text-[#059669]" />
              <span>Check Status / Pass</span>
            </button>

            <Link
              href="/#register"
              className="px-3.5 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-sm hidden sm:inline-flex"
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
            <span>Radhe Radhe Chasak GPL4 Franchises &amp; Squads</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Select Franchise Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Click on any team below to view official team owners, captain, and verified squad roster.
          </p>
        </div>

        {/* TEAM SELECTOR CAROUSEL / GRID (White Cards) */}
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
                  className={`snap-start shrink-0 px-3.5 py-2.5 rounded-2xl border transition-all duration-300 flex items-center gap-2.5 text-left cursor-pointer ${
                    isSelected
                      ? "bg-white border-2 shadow-md scale-102"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs hover:border-slate-300"
                  }`}
                  style={{
                    borderColor: isSelected ? (team.themeColor || "#0041b9") : undefined,
                    boxShadow: isSelected ? `0 4px 16px ${team.themeColor || "#0041b9"}25` : undefined
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs"
                    style={{ borderColor: isSelected ? (team.themeColor || "#0041b9") : undefined }}
                  >
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Shield className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 leading-tight whitespace-nowrap">
                      {team.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono font-bold text-amber-600">{team.shortCode}</span>
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
              className={`snap-start shrink-0 px-3.5 py-2.5 rounded-2xl border transition-all duration-300 flex items-center gap-2.5 text-left cursor-pointer ${
                selectedTeamId === "all"
                  ? "bg-emerald-50 border-2 border-emerald-600 shadow-md scale-102"
                  : "bg-white hover:bg-emerald-50/50 border-slate-200 text-slate-700 shadow-xs"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100/80 border border-emerald-300 flex items-center justify-center shrink-0 text-[#059669] font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 leading-tight whitespace-nowrap">
                  Auction Draft Pool
                </div>
                <div className="text-[10px] text-[#059669] font-bold mt-0.5">
                  {players.filter((p) => p.paymentStatus === "Approved" && (!p.teamId || p.teamId === "")).length} Available
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ACTIVE TEAM HERO BANNER (White / Clean Card Theme) */}
        {currentTeam ? (
          <div
            className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 relative overflow-hidden transition-all duration-500 shadow-md"
            style={{
              borderLeftWidth: "6px",
              borderLeftColor: activeThemeColor
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
              
              {/* Franchise Logo & Brand Badge */}
              <div className="md:col-span-4 flex items-center gap-4 sm:gap-6">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 border-2 p-2.5 flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    borderColor: activeThemeColor
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
                      backgroundColor: `${activeThemeColor}15`,
                      borderColor: `${activeThemeColor}40`,
                      color: activeThemeColor
                    }}
                  >
                    CODE: {currentTeam.shortCode}
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                    {currentTeam.name}
                  </h2>
                  <div className="text-xs text-slate-500 font-semibold">
                    Radhe Radhe Chasak GPL4 Franchise
                  </div>
                </div>
              </div>

              {/* Franchise Intel Grid */}
              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs shadow-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Owner</span>
                  <div className="font-bold text-slate-900 truncate">{currentTeam.owner || "Mohsin & Ballu"}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Team Captain</span>
                  <div className="font-bold text-amber-700 truncate">{currentTeam.captain || "Franchise Captain"}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Championships</span>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>{currentTeam.championships || 0} Titles</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Squad Allocated</span>
                  <div className="font-mono font-bold text-[#059669]">
                    {displayPlayers.length} / 14 Players
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Auction Pool Header Banner */
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-6 sm:p-8 relative overflow-hidden shadow-md">
            <div className="max-w-xl space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase">
                <Sparkles className="w-3 h-3 text-[#059669]" />
                Live Auction Draft Pool
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Unallocated Verified Players
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                These players have completed registration verification and are ready for the franchise draft auction!
              </p>
            </div>
          </div>
        )}

        {/* FILTER & SEARCH TOOLBAR (Clean Light Theme) */}
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
                    ? "bg-[#081a36] text-white shadow-sm"
                    : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs"
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
              className="w-full px-3.5 py-2 pl-9 rounded-xl bg-white border border-slate-300 focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

        </div>

        {/* PLAYER SQUAD GRID (Crisp White Player Cards) */}
        {displayPlayers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayPlayers.map((player) => (
              <div
                key={player.id || player.regNumber}
                className="bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200 hover:border-slate-300 p-4 transition-all duration-300 space-y-3 relative group shadow-xs hover:shadow-md hover:-translate-y-0.5"
                style={{
                  borderTopWidth: "3px",
                  borderTopColor: activeThemeColor
                }}
              >
                {/* Top Badge: Reg Number & Ward */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span
                    className="font-black px-2 py-0.5 rounded-md border"
                    style={{
                      backgroundColor: `${activeThemeColor}12`,
                      borderColor: `${activeThemeColor}30`,
                      color: activeThemeColor
                    }}
                  >
                    #{player.regNumber}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                    {player.ward || "Ward 51/54"}
                  </span>
                </div>

                {/* Player Photo + Info */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-xl bg-slate-100 border-2 overflow-hidden flex items-center justify-center shrink-0 shadow-xs relative"
                    style={{ borderColor: activeThemeColor }}
                  >
                    {player.photoUrl ? (
                      <img
                        src={player.photoUrl}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 text-slate-700 font-black text-xl flex items-center justify-center">
                        {player.name?.[0] || "P"}
                      </div>
                    )}
                    {player.paymentStatus === "Approved" && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#059669] text-white flex items-center justify-center shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm text-slate-900 truncate leading-tight group-hover:text-[#059669] transition-colors">
                      {player.name}
                    </h3>
                    <div className="text-xs text-amber-700 font-semibold truncate mt-0.5">
                      {player.speciality || "Cricket Player"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1.5">
                      <Shirt className="w-3 h-3 text-slate-400" />
                      <span>Kit: {player.tshirtSize || "M"} / {player.trackSize || "M"}</span>
                    </div>
                  </div>
                </div>

                {/* Team Tag Strip */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <span className="font-bold text-[#059669] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                    <span>{currentTeam ? currentTeam.name : "Verified in Pool"}</span>
                  </span>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-3xl bg-white border border-dashed border-slate-300 space-y-3 shadow-xs">
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-base text-slate-900">No players found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
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
