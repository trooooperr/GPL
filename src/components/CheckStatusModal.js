"use client";

import { useState, useRef } from "react";
import {
  Search,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  Printer,
  Download,
  Shield,
  ArrowRight,
  Loader2,
  HelpCircle,
  Check
} from "lucide-react";

export default function CheckStatusModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
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

  // Direct PNG Download via HTML5 Canvas
  const handleDownloadPass = async () => {
    if (!player) return;
    setDownloading(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");

      // Card Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 800, 1000);
      grad.addColorStop(0, "#081a36");
      grad.addColorStop(0.5, "#0d2854");
      grad.addColorStop(1, "#07162e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 1000);

      // Gold Border
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 6;
      ctx.strokeRect(16, 16, 768, 968);

      // Lanyard Notch Mockup
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(340, 24, 120, 14, 7);
      ctx.fill();

      // Top Header Bar
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 18px sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("OFFICIAL TOURNAMENT PASS", 50, 75);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 32px sans-serif";
      ctx.fillText("GOREGAON PREMIER LEAGUE", 50, 115);

      ctx.fillStyle = "#fcd34d";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("RADHE RADHE CHASAK GPL4 • SEASON 2026", 50, 145);

      // Reg badge pill
      ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
      ctx.fillRect(610, 50, 140, 48);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.strokeRect(610, 50, 140, 48);
      ctx.fillStyle = "#fcd34d";
      ctx.font = "900 24px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`#${player.regNumber || "0000"}`, 680, 82);
      ctx.textAlign = "left";

      // Divider
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 175);
      ctx.lineTo(750, 175);
      ctx.stroke();

      // Photo or Placeholder Avatar
      const drawPhotoOrInitials = () => {
        return new Promise((resolve) => {
          if (player.photoUrl) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(50, 210, 220, 260, 16);
              ctx.clip();
              ctx.drawImage(img, 50, 210, 220, 260);
              ctx.restore();
              ctx.strokeStyle = "#f59e0b";
              ctx.lineWidth = 4;
              ctx.strokeRect(50, 210, 220, 260);
              resolve();
            };
            img.onerror = () => {
              // fallback
              drawInitials();
              resolve();
            };
            img.src = player.photoUrl;
          } else {
            drawInitials();
            resolve();
          }
        });
      };

      const drawInitials = () => {
        ctx.fillStyle = "#1e3a8a";
        ctx.beginPath();
        ctx.roundRect(50, 210, 220, 260, 16);
        ctx.fill();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 4;
        ctx.strokeRect(50, 210, 220, 260);
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 80px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(player.name?.[0]?.toUpperCase() || "P", 160, 370);
        ctx.textAlign = "left";
      };

      await drawPhotoOrInitials();

      // Player Details
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 36px sans-serif";
      ctx.fillText(player.name || "Player Name", 300, 255);

      ctx.fillStyle = "#fcd34d";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(player.speciality || "Cricket Player", 300, 295);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(`Ward: ${player.ward || "Ward 51/54"}`, 300, 340);
      ctx.fillText(`Jersey Size: ${player.tshirtSize || "M"} / Track: ${player.trackSize || "M"}`, 300, 375);

      // Status Badge
      const isApproved = player.paymentStatus === "Approved";
      ctx.fillStyle = isApproved ? "#059669" : "#d97706";
      ctx.beginPath();
      ctx.roundRect(300, 410, 260, 44, 8);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(isApproved ? "✓ OFFICIAL VERIFIED" : "⏳ VERIFICATION REVIEW", 320, 438);

      // Allocated Team Box
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.roundRect(50, 510, 700, 120, 14);
      ctx.fill();
      ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 510, 700, 120);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("FRANCHISE ALLOCATION", 75, 545);

      ctx.fillStyle = player.team ? "#fcd34d" : "#34d399";
      ctx.font = "900 28px sans-serif";
      const teamLabel = player.team
        ? player.team.name
        : isApproved
        ? "GPL Official Auction Pool (Pending Franchise Draft)"
        : "Pending Document Verification";
      ctx.fillText(teamLabel, 75, 595);

      // Verification Watermark / Barcode Simulation
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(50, 660, 700, 70);

      // Draw barcode lines
      ctx.fillStyle = "#ffffff";
      for (let x = 70; x < 730; x += 14) {
        const barW = (x % 5 === 0) ? 5 : (x % 3 === 0) ? 3 : 2;
        ctx.fillRect(x, 675, barW, 40);
      }

      // Security text
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`VERIFY: GPL4-AUTH-${player.regNumber || "0000"}-${(player.phone || "0000").slice(-4)}`, 400, 765);
      ctx.textAlign = "left";

      // Footer
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, 810);
      ctx.lineTo(750, 810);
      ctx.stroke();

      ctx.fillStyle = "#fcd34d";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("Venue: Sambhaji Maidan, Goregaon East, Mumbai", 50, 855);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "16px sans-serif";
      ctx.fillText("Organized by Mohsin Patel & Balram Gupta (Ballu)", 50, 895);
      ctx.fillText("Non-transferable official accreditation badge for Radhe Radhe Chasak GPL4.", 50, 925);

      // Trigger download
      const link = document.createElement("a");
      link.download = `GPL4-Pass-${player.regNumber || "player"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("[Download Pass Error]:", err);
      // Fallback to print
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl relative my-auto border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#081a36] text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">Check Registration Status</h3>
              <p className="text-[11px] text-blue-200/80">Radhe Radhe Chasak GPL4 • Mohsin Patel &amp; Balram Gupta</p>
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
                Enter your <strong>Phone Number</strong> or <strong>Registration Number</strong> (e.g. <code>#1024</code>) to view verification status and access your official digital pass.
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
                  <div className="text-xs font-black uppercase tracking-wider">
                    {player.paymentStatus === "Approved"
                      ? "Application Approved & Verified"
                      : player.paymentStatus === "Rejected"
                      ? "Application Rejected"
                      : "Verification Under Review"}
                  </div>
                  <p className="text-xs mt-0.5 font-medium leading-tight">
                    {player.paymentStatus === "Approved"
                      ? "Documents verified. You are enrolled in the Radhe Radhe Chasak GPL4 auction pool!"
                      : player.paymentStatus === "Rejected"
                      ? player.notes || "Aadhaar address must be from Ward 51 or Ward 54. Please contact committee for appeal."
                      : "Your Aadhaar address and Instagram follow proof are currently being verified by the committee."}
                  </p>
                </div>
              </div>

              {/* REJECTED NOTICE (No Pass Issued) */}
              {player.paymentStatus === "Rejected" ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">No Official Pass Available</h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                    Only verified players from Ward 51 &amp; Ward 54 with confirmed Instagram follow screenshot can receive an official accreditation pass. If this is an error, please reach out directly to the organizers.
                  </p>
                  <div className="pt-2 text-xs font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                    <div>Organizers: <strong>Mohsin Patel &amp; Balram Gupta (Ballu)</strong></div>
                    <div className="text-[11px] text-slate-500 mt-1">Ground: Sambhaji Maidan, Goregaon East</div>
                  </div>
                </div>
              ) : (
                /* OFFICIAL DIGITAL PLAYER PASS (Approved or Pending) */
                <div
                  id="digital-player-pass"
                  className="bg-gradient-to-br from-[#081a36] via-[#0d2854] to-[#07162e] text-white rounded-2xl p-4 sm:p-5 shadow-xl border-2 border-amber-400/80 relative overflow-hidden space-y-3"
                >
                  {/* Lanyard Clip Hole Visual */}
                  <div className="w-16 h-2 rounded-full bg-white/20 mx-auto -mt-1 mb-2 border border-white/20" />

                  {/* Pass Top Bar */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/images/gpl-logo.png"
                        alt="GPL Logo"
                        className="w-11 h-11 object-contain shrink-0 drop-shadow-md"
                      />
                      <div>
                        <div className="font-black text-sm text-white tracking-wide">
                          Goregaon Premier League
                        </div>
                        <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                          Radhe Radhe Chasak GPL4
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-amber-400 bg-amber-400/15 px-2 py-0.5 rounded-md border border-amber-400/40">
                        #{player.regNumber}
                      </span>
                      <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                        OFFICIAL PASS
                      </div>
                    </div>
                  </div>

                  {/* Pass Body: Photo + Details */}
                  <div className="flex items-center gap-3.5 pt-1">
                    <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-slate-800 border-2 border-amber-400 overflow-hidden flex items-center justify-center shrink-0 shadow-lg relative">
                      {player.photoUrl ? (
                        <img
                          src={player.photoUrl}
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-900/80 text-white font-black text-3xl flex items-center justify-center">
                          {player.name?.[0] || "P"}
                        </div>
                      )}
                      {player.paymentStatus === "Approved" && (
                        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-black text-base sm:text-lg text-white leading-tight truncate">
                        {player.name}
                      </h4>
                      <div className="text-xs text-amber-300 font-semibold truncate">
                        {player.speciality}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-white/10 font-bold border border-white/10">
                          {player.ward}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-300">
                          Kit: {player.tshirtSize}/{player.trackSize}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Team Allocation Strip */}
                  <div
                    className="rounded-xl p-2.5 border border-white/10 flex items-center justify-between text-xs"
                    style={{
                      backgroundColor: player.team?.themeColor
                        ? `${player.team.themeColor}33`
                        : "rgba(0,0,0,0.35)",
                      borderColor: player.team?.themeColor
                        ? `${player.team.themeColor}88`
                        : "rgba(255,255,255,0.15)"
                    }}
                  >
                    <span className="text-slate-300 text-[11px] font-semibold">Franchise Squad:</span>
                    {player.team ? (
                      <div className="flex items-center gap-2 font-black text-amber-300">
                        {player.team.logo && (
                          <img
                            src={player.team.logo}
                            alt={player.team.name}
                            className="w-5 h-5 object-contain"
                          />
                        )}
                        <span>{player.team.name}</span>
                      </div>
                    ) : (
                      <span className="text-emerald-400 font-bold text-[11px]">
                        {player.paymentStatus === "Approved"
                          ? "Official Auction Draft Pool"
                          : "Pending Verification"}
                      </span>
                    )}
                  </div>

                  {/* Security Verification Bar */}
                  <div className="flex items-center justify-between pt-1 text-[9px] font-mono text-slate-400">
                    <span>AUTH: GPL4-{player.regNumber}</span>
                    <span>VENUE: SAMBHAJI MAIDAN</span>
                  </div>

                  {/* Pass Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-300 font-medium">
                    <span>Radhe Radhe Chasak GPL4</span>
                    <span className="text-amber-300/90 font-bold">Mohsin Patel &amp; Balram Gupta</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Check Another Number
                </button>

                {player.paymentStatus !== "Rejected" && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownloadPass}
                      disabled={downloading}
                      className="flex-1 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Download Pass as Image"
                    >
                      {downloading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Download Pass</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="py-2.5 px-3 rounded-xl bg-[#081a36] hover:bg-[#0d2854] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title="Print Pass"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Print</span>
                    </button>
                  </>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
