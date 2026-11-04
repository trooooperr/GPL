"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Users, Search, Trophy, Shield, Filter, Award, Sparkles, ArrowRight } from "lucide-react";

export default function AuctionPool({ players = [], teams = [] }) {
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Only approved players enter the auction pool
  const approvedPlayers = useMemo(() => {
    return (players || []).filter((p) => p.paymentStatus === "Approved");
  }, [players]);

  // Build team map for quick lookup
  const teamMap = useMemo(() => {
    const map = {};
    (teams || []).forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [teams]);

  // Filtered pool
  const filteredPool = useMemo(() => {
    return approvedPlayers.filter((p) => {
      // Role filter
      if (roleFilter !== "ALL") {
        const spec = (p.speciality || "").toLowerCase();
        if (roleFilter === "batsman" && !spec.includes("batsman")) return false;
        if (roleFilter === "bowler" && !spec.includes("bowler")) return false;
        if (roleFilter === "all-rounder" && !spec.includes("all-rounder")) return false;
        if (roleFilter === "wicketkeeper" && !spec.includes("wicketkeeper")) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (p.name || "").toLowerCase().includes(q);
        const matchesReg = (p.regNumber || p.id || "").toLowerCase().includes(q);
        const matchesWard = (p.ward || "").toLowerCase().includes(q);
        if (!matchesName && !matchesReg && !matchesWard) return false;
      }

      return true;
    });
  }, [approvedPlayers, roleFilter, searchQuery]);

  return (
    <section id="auction-pool" className="py-16 sm:py-24 bg-white text-slate-900 border-b border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#059669] text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Official Draft Roster</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#081a36] tracking-tight">
            Player Auction Pool
          </h2>
          <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
            Verified players ready for the franchise draft bidding. All players meet the strict Ward 51/54 residency criteria.
          </p>

          {/* Stat Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#059669]" />
              <strong>{approvedPlayers.length}</strong> Verified Players
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-amber-600 font-bold">10 Franchises Bidding</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: "ALL", label: "All Roles" },
              { id: "batsman", label: "Batsmen" },
              { id: "bowler", label: "Bowlers" },
              { id: "all-rounder", label: "All-Rounders" },
              { id: "wicketkeeper", label: "Wicketkeepers" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  roleFilter === tab.id
                    ? "bg-[#081a36] text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player name or ward..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

        </div>

        {/* Players Grid */}
        {filteredPool.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredPool.slice(0, 8).map((player) => {
              const assignedTeam = player.teamId ? teamMap[player.teamId] : null;
              return (
                <div
                  key={player.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-lg transition-all duration-300 p-4 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    
                    {/* Top Row: Reg ID & Ward */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        #{player.regNumber || (player.id ? player.id.replace(/\D/g, "") : "")}
                      </span>
                      <span className="font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {player.ward}
                      </span>
                    </div>

                    {/* Avatar & Player Info */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center shrink-0 group-hover:border-[#059669] transition-colors">
                        {player.photoUrl && !player.photoUrl.includes("placeholder") ? (
                          <img
                            src={player.photoUrl}
                            alt={player.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="font-black text-lg text-slate-600">
                            {player.name?.[0] || "P"}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate group-hover:text-[#059669] transition-colors">
                          {player.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate font-medium">
                          {player.speciality}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Bottom: Team Allocation or Auction Draft status */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {assignedTeam ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#081a36] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 w-full truncate">
                        <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{assignedTeam.name}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/70 w-full justify-center">
                        <Award className="w-3 h-3 text-emerald-600" />
                        <span>Auction Draft Pool</span>
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Dedicated Subdomain / Portal CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <Link
              href="/teams"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#081a36] hover:bg-[#0d2854] text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            >
              <span>Explore All {approvedPlayers.length} Players on Custom Franchise Themed Pages</span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          </>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-700">No players found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No verified players matched your selected role or search keyword.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
