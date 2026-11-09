"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Search,
  Shield,
  Shirt,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

  // Unallocated auction pool count
  const unassignedPoolCount = useMemo(() => {
    return players.filter((p) => p.paymentStatus === "Approved" && (!p.teamId || p.teamId === "")).length;
  }, [players]);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-[#059669] selection:text-white flex flex-col justify-between">
      
      {/* Sticky Main Website Navigation Bar */}
      <Navbar
        settings={settings}
        onOpenStatusModal={() => setStatusModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex-1 space-y-8 sm:space-y-10">
        
        {/* Page Header (Clean White / Light Slate Theme) */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Radhe Radhe Chashak • Season 4</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#081a36] tracking-tight">
            Tournament Franchises &amp; Squads
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            10 verified franchise teams competing at Sambhaji Maidan, Goregaon East. Select a team below to view official franchise owners, team captain, and verified 14-player squad roster.
          </p>
        </div>

        {/* 10 TEAMS + AUCTION POOL SELECTOR GRID */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Select Franchise Team</span>
            <span>{teams.length} Teams Active</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {teams.map((team, idx) => {
              const isSelected = selectedTeamId === team.id;
              const squadCount = players.filter((p) => p.teamId === team.id).length;

              return (
                <button
                  key={team.id || idx}
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setSelectedRole("all");
                    setSearchQuery("");
                  }}
                  className={`relative p-3 sm:p-4 rounded-2xl bg-white transition-all duration-200 flex flex-col items-center text-center cursor-pointer border ${
                    isSelected
                      ? "ring-2 ring-offset-2 border-transparent shadow-md scale-102"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-xs shadow-2xs"
                  }`}
                  style={{
                    ringColor: isSelected ? (team.themeColor || "#0041b9") : undefined,
                  }}
                >
                  {/* Selected Indicator Pill */}
                  {isSelected && (
                    <span
                      className="absolute -top-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-xs"
                      style={{ backgroundColor: team.themeColor || "#0041b9" }}
                    >
                      Active
                    </span>
                  )}

                  {/* Team Logo */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center p-1 mb-2">
                    {team.logo ? (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Shield className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Team Name */}
                  <div className="font-bold text-xs sm:text-sm text-slate-900 leading-tight line-clamp-1 mb-1">
                    {team.name}
                  </div>

                  {/* Code & Strength Pill */}
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <span className="font-mono text-xs font-bold text-slate-700">{team.shortCode || "GPL"}</span>
                    <span>•</span>
                    <span className="text-[#059669] font-bold">{squadCount}/14</span>
                  </div>
                </button>
              );
            })}

            {/* Auction Draft Pool Card */}
            <button
              onClick={() => {
                setSelectedTeamId("all");
                setSelectedRole("all");
                setSearchQuery("");
              }}
              className={`p-3 sm:p-4 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer border ${
                selectedTeamId === "all"
                  ? "bg-emerald-50 border-2 border-[#059669] shadow-md scale-102 ring-2 ring-emerald-500/20"
                  : "bg-white hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-200 text-slate-700 shadow-2xs"
              }`}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100/70 border border-emerald-300 flex items-center justify-center text-[#059669] mb-2 shadow-2xs">
                <Users className="w-7 h-7" />
              </div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 leading-tight mb-1">
                Auction Draft Pool
              </div>
              <div className="text-[11px] font-bold text-[#059669]">
                {unassignedPoolCount} Available
              </div>
            </button>
          </div>
        </div>

        {/* SELECTED TEAM SHOWCASE BANNER */}
        {currentTeam ? (
          <div
            className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all"
            style={{
              borderLeftWidth: "6px",
              borderLeftColor: activeThemeColor
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Franchise Logo + Identity */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 border-2 p-2 flex items-center justify-center shrink-0 shadow-xs"
                  style={{ borderColor: activeThemeColor }}
                >
                  {currentTeam.logo ? (
                    <img
                      src={currentTeam.logo}
                      alt={currentTeam.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Shield className="w-10 h-10 text-slate-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div
                    className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black tracking-wider uppercase border"
                    style={{
                      backgroundColor: `${activeThemeColor}12`,
                      borderColor: `${activeThemeColor}30`,
                      color: activeThemeColor
                    }}
                  >
                    CODE: {currentTeam.shortCode}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#081a36] leading-tight">
                    {currentTeam.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Radhe Radhe Chashak GPL Season 4 Official Franchise
                  </p>
                </div>
              </div>

              {/* Franchise Details (4 Clean Boxes) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Owner</span>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {currentTeam.owner || "Mohsin & Ballu"}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Team Captain</span>
                  <div className="font-bold text-amber-700 text-xs sm:text-sm truncate">
                    {currentTeam.captain || "To be drafted"}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Titles</span>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>{currentTeam.championships || 0} Titles</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Squad Capacity</span>
                  <div className="font-mono font-bold text-[#059669] text-xs sm:text-sm">
                    {displayPlayers.length} / 14 Players
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Live Auction Pool Showcase Banner */
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold uppercase">
                  <Sparkles className="w-3 h-3 text-[#059669]" />
                  <span>Grand Auction Draft Pool</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#081a36]">
                  Verified Available Players
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Approved registered players from Ward 51 &amp; 54 available for franchise selection in the upcoming GPL Season 4 Auction.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-emerald-200 text-center shrink-0 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#059669]">
                  {unassignedPoolCount}
                </div>
                <div className="text-xs font-bold text-slate-600">
                  Players in Pool
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SQUAD FILTER BAR & SEARCH */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: "All Squad" },
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
                    ? "bg-[#081a36] text-white shadow-xs"
                    : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player name, ID, or ward..."
              className="w-full px-3.5 py-2 pl-9 rounded-xl bg-white border border-slate-300 focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

        </div>

        {/* SQUAD ROSTER CARDS GRID */}
        {displayPlayers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayPlayers.map((player) => (
              <div
                key={player.id || player.regNumber}
                className="bg-white rounded-2xl border border-slate-200 p-4 transition-all duration-200 space-y-3 shadow-xs hover:shadow-md hover:border-slate-300 relative group"
                style={{
                  borderTopWidth: "3px",
                  borderTopColor: activeThemeColor
                }}
              >
                {/* Header: Reg Number & Ward */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span
                    className="font-bold px-2 py-0.5 rounded-md border"
                    style={{
                      backgroundColor: `${activeThemeColor}12`,
                      borderColor: `${activeThemeColor}30`,
                      color: activeThemeColor
                    }}
                  >
                    #{player.regNumber}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                    {player.ward || "Ward 51"}
                  </span>
                </div>

                {/* Player Photo + Info */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-xl bg-slate-100 border-2 overflow-hidden flex items-center justify-center shrink-0 shadow-xs relative"
                    style={{ borderColor: activeThemeColor }}
                  >
                    {player.photoUrl && !player.photoUrl.includes("placeholder") ? (
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
                    <h3 className="font-extrabold text-sm text-slate-900 truncate leading-tight group-hover:text-[#0041b9] transition-colors">
                      {player.name}
                    </h3>
                    <div className="text-xs text-amber-800 font-semibold truncate mt-0.5">
                      {player.speciality || "Cricket Player"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1.5">
                      <Shirt className="w-3 h-3 text-slate-400" />
                      <span>Kit: {player.tshirtSize || "M"} / {player.trackSize || "M"}</span>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Squad Status:</span>
                  <span className="font-bold text-[#059669] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                    <span>{currentTeam ? "Verified Squad Member" : "In Auction Pool"}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Professional Empty Squad Notice */
          <div className="text-center py-16 px-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] mx-auto">
              <Users className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-slate-900">
                {searchQuery
                  ? "No matching players found"
                  : currentTeam
                  ? `${currentTeam.name} Squad Allocation In Progress`
                  : "Auction Draft Pool Empty"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                {searchQuery
                  ? `No squad players matched "${searchQuery}". Please check your search term or select another category.`
                  : currentTeam
                  ? `Official squad allocations for ${currentTeam.name} are currently underway. Verified players will be drafted during the GPL Grand Auction.`
                  : "All registered players have been allocated to tournament franchise teams."}
              </p>
            </div>

            {selectedTeamId !== "all" && unassignedPoolCount > 0 && !searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTeamId("all");
                  setSelectedRole("all");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#081a36] hover:bg-[#0041b9] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>View Auction Draft Pool ({unassignedPoolCount} Players)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

      </main>

      {/* Main Website Footer */}
      <Footer settings={settings} />

      {/* Check Status Modal */}
      <CheckStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
      />
    </div>
  );
}
