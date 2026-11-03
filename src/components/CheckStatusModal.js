"use client";

import { useState } from "react";
import { Search, X, CheckCircle2, Clock, XCircle, Printer, Trophy, Shield, User, ArrowRight, Loader2 } from "lucide-react";

export default function CheckStatusModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [player, setPlayer] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) {
      setError("Please enter your registered phone number or registration number.");
      return;
    }

    setLoading(true);
    setError("");
    setPlayer(null);

    try {
      const res = await fetch(`/api/status?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "No registration found. Please verify your phone or registration number.");
      } else {
        setPlayer(data.player);
      }
    } catch (err) {
      setError("Unable to connect to verification server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPlayer(null);
    setQuery("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl relative my-auto border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#081a36] text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">Check Registration Status</h3>
              <p className="text-[11px] text-blue-200/80">Goregaon Premier League • Radhe Radhe Chashak</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Lookup Form */}
          {!player && (
            <form onSubmit={handleSearch} className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Enter the <strong>Phone Number</strong> you used during registration or your <strong>Registration Number</strong> (e.g. <code>#1024</code>) to check your verification and auction pool status.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number or Registration Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setError("");
                    }}
                    placeholder="e.g. 9876543210 or 1024"
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-300 focus:border-[#059669] focus:ring-2 focus:ring-emerald-100 text-sm font-semibold outline-none transition-all text-slate-900"
                    autoFocus
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {error && (
                  <p className="text-xs font-semibold text-red-600 mt-2 bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-start gap-1.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] disabled:bg-slate-300 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <span>Check Status</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Result Card: When player record is found */}
          {player && (
            <div className="space-y-4">
              
              {/* Status Header Badge */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                  player.paymentStatus === "Approved"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : player.paymentStatus === "Rejected"
                    ? "bg-red-50 border-red-200 text-red-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    player.paymentStatus === "Approved"
                      ? "bg-emerald-600 text-white"
                      : player.paymentStatus === "Rejected"
                      ? "bg-red-600 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {player.paymentStatus === "Approved" ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : player.paymentStatus === "Rejected" ? (
                    <XCircle className="w-6 h-6" />
                  ) : (
                    <Clock className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {player.paymentStatus === "Approved"
                      ? "Verified & Approved"
                      : player.paymentStatus === "Rejected"
                      ? "Application Rejected"
                      : "Verification Under Review"}
                  </div>
                  <p className="text-xs mt-0.5 font-medium leading-tight">
                    {player.paymentStatus === "Approved"
                      ? "Player documents verified. You are officially enrolled in the GPL Auction Pool!"
                      : player.paymentStatus === "Rejected"
                      ? player.notes || "Address or document verification issue. Contact committee for review."
                      : "Your Aadhaar address and payment UTR are currently being verified by the committee."}
                  </p>
                </div>
              </div>

              {/* DIGITAL PLAYER PASS / ID CARD (If Approved or Pending) */}
              <div
                id="digital-player-pass"
                className="bg-gradient-to-br from-[#081a36] via-[#0d2854] to-[#081a36] text-white rounded-2xl p-4 sm:p-5 shadow-xl border-2 border-amber-400/50 relative overflow-hidden space-y-4"
              >
                {/* Decorative Tournament Badge & Watermark */}
                <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-amber-400/5 blur-xl pointer-events-none" />
                <div className="absolute top-2 right-3 font-mono text-[10px] text-amber-300/60 uppercase tracking-widest font-black">
                  OFFICIAL PASS
                </div>

                {/* Pass Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <img src="/images/logo.png" alt="GPL" className="w-9 h-9 object-contain shrink-0 bg-white/10 p-1 rounded-lg" />
                    <div>
                      <div className="font-black text-sm text-white tracking-wide">Goregaon Premier League</div>
                      <div className="text-[10px] font-bold text-amber-300 uppercase">Radhe Radhe Chashak • Season 2026</div>
                    </div>
                  </div>
                  <span className="font-mono font-black text-sm text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                    #{player.regNumber}
                  </span>
                </div>

                {/* Pass Body: Photo + Specs */}
                <div className="flex items-center gap-3.5">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-slate-800 border-2 border-amber-400 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                    {player.photoUrl ? (
                      <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-900/60 text-white font-extrabold text-2xl flex items-center justify-center">
                        {player.name?.[0] || "P"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-black text-base sm:text-lg text-white leading-tight truncate">
                      {player.name}
                    </h4>
                    <div className="text-xs text-amber-200/90 font-semibold truncate">
                      {player.speciality}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-white/10 font-bold">{player.ward}</span>
                      <span>•</span>
                      <span className="font-mono">Kit: {player.tshirtSize}/{player.trackSize}</span>
                    </div>
                  </div>
                </div>

                {/* Team Allocation Strip */}
                <div className="bg-black/30 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-300 text-[11px] font-semibold">Allocated Team:</span>
                  {player.team ? (
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      {player.team.logo && (
                        <img src={player.team.logo} alt={player.team.name} className="w-5 h-5 object-contain" />
                      )}
                      <span>{player.team.name}</span>
                    </div>
                  ) : (
                    <span className="text-emerald-400 font-bold">
                      {player.paymentStatus === "Approved" ? "Auction Draft Pool (Pending Bidding)" : "Pending Verification"}
                    </span>
                  )}
                </div>

                {/* Pass Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-400 font-medium">
                  <span>Sambhaji Maidan, Goregaon (E)</span>
                  <span>Mohsin Patel &amp; Balram Gupta</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Check Another Number
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl bg-[#081a36] hover:bg-[#0d2854] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Print or Save Digital Pass"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print / Save Pass</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
