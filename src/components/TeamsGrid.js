"use client";

import { useState } from "react";
import { X, Users, UserCheck } from "lucide-react";

export default function TeamsGrid({ teams = [] }) {
  const [selectedTeam, setSelectedTeam] = useState(null);

  return (
    <section id="teams" className="py-14 sm:py-20 lg:py-24 bg-[#081a36] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-14 space-y-2 sm:space-y-3">
          <p className="text-xs sm:text-base md:text-xl text-slate-200 font-medium tracking-wide">
            Radhe Radhe Chashak 
          </p>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            GPL Teams
          </h2>
        </div>

        {/* 5-Column Grid on Desktop / 2-Column on Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
          {teams.map((team, idx) => (
            <div
              key={team.id || idx}
              onClick={() => setSelectedTeam(team)}
              className="group relative rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 transition-all duration-300 p-2.5 sm:p-4 flex flex-col items-center justify-center cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1.5 aspect-square border border-slate-100"
            >
              {/* Maximized Team Badge Logo with 0 Background Artifacts */}
              <div className="w-full h-full flex items-center justify-center p-1">
                <img
                  src={team.logo || "/images/teams/team-csk.png"}
                  alt={team.name}
                  className="max-h-[92%] max-w-[92%] object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Team Name Label on Hover */}
              <div className="absolute bottom-2.5 inset-x-2.5 text-center bg-[#081a36]/95 backdrop-blur-md rounded-lg sm:rounded-xl py-1 px-2 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg border border-white/10 pointer-events-none">
                <span className="text-[11px] sm:text-xs font-bold text-white block truncate">
                  {team.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Team Details & Registered Squad Count with Clean Mobile Border Radius */}
        {selectedTeam && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white text-slate-900 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative max-h-[88vh] overflow-y-auto animate-scaleUp">
              
              <button
                onClick={() => setSelectedTeam(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 pr-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 border border-slate-200 p-1.5 shrink-0 flex items-center justify-center">
                  <img
                    src={selectedTeam.logo || "/images/teams/team-csk.png"}
                    alt={selectedTeam.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{selectedTeam.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Code: <span className="text-[#0041b9] font-bold">{selectedTeam.shortCode}</span>
                  </p>
                </div>
              </div>

              {/* Team Owner & Captain */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs">
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Owner</span>
                  <span className="font-bold text-slate-800 truncate block">{selectedTeam.owner}</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Captain</span>
                  <span className="font-bold text-slate-800 truncate block">{selectedTeam.captain}</span>
                </div>
              </div>

              {/* Squad Registered Players Count: Clean balanced border radius and flex layout */}
              <div className="space-y-3 mb-4 sm:mb-5">
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-blue-50 border border-blue-100 gap-2">
                  <div className="flex items-center gap-2 shrink-0">
                    <Users className="w-4 h-4 text-[#0041b9] shrink-0" />
                    <span className="text-xs font-bold text-[#081a36]">Registered Squad</span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-[#0041b9] text-white whitespace-nowrap shrink-0 shadow-sm">
                    {selectedTeam.memberDetails ? selectedTeam.memberDetails.length : (selectedTeam.members ? selectedTeam.members.length : 0)} / 14 Players
                  </span>
                </div>

                {selectedTeam.memberDetails && selectedTeam.memberDetails.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedTeam.memberDetails.map((player, idx) => (
                      <div
                        key={player.id || idx}
                        className="p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div>
                            <div className="font-bold text-slate-900">{player.name}</div>
                            <div className="text-[10px] text-slate-500">{player.speciality} • {player.ward}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#0041b9] bg-blue-50 px-1.5 py-0.5 rounded">
                          {player.tshirtSize}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedTeam(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Close
              </button>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
