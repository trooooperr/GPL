"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2, X, CheckCircle2 } from "lucide-react";

/**
 * PlayerRegistrationCard
 * - Background features Shri Sandeep Jadhav blended into the stadium night sky
 * - Prominent "RADHE RADHE FOUNDATION PRESENTS" header
 * - "GOREGAON PURV VIDHAN SABHA" under Goregaon Premier League
 * - Clean, professional, sports broadcast layout (no heavy footer box)
 */
export default function PlayerRegistrationCard({ player, regNum, photo, onClose }) {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1080x1350 (4:5 high-res ratio)
    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    const loadImg = (src) =>
      new Promise((resolve, reject) => {
        if (!src) return reject(new Error("No source"));
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const roundRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    };

    const draw = async () => {
      // 1. Base Gradient Background (Midnight Navy)
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#060b18");
      bg.addColorStop(0.35, "#0a1326");
      bg.addColorStop(0.7, "#0c1730");
      bg.addColorStop(1, "#050914");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // 2. Ambient Lighting
      ctx.save();
      const radialCenter = ctx.createRadialGradient(W / 2, 600, 30, W / 2, 600, 420);
      radialCenter.addColorStop(0, "rgba(245, 158, 11, 0.14)");
      radialCenter.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = radialCenter;
      ctx.fillRect(0, 200, W, 800);

      const radialLeft = ctx.createRadialGradient(0, 0, 10, 0, 0, 360);
      radialLeft.addColorStop(0, "rgba(14, 165, 233, 0.16)");
      radialLeft.addColorStop(1, "rgba(14, 165, 233, 0)");
      ctx.fillStyle = radialLeft;
      ctx.fillRect(0, 0, 400, 400);

      const radialRight = ctx.createRadialGradient(W, 0, 10, W, 0, 360);
      radialRight.addColorStop(0, "rgba(245, 158, 11, 0.18)");
      radialRight.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = radialRight;
      ctx.fillRect(W - 400, 0, 400, 400);
      ctx.restore();

      // 3. BACKGROUND: Stadium with Sandeep Jadhav
      try {
        const bgStadium = await loadImg("/images/card-stadium-bg-overlay.jpg");
        ctx.drawImage(bgStadium, 0, 0, W, H);
      } catch (_) {
        try {
          const bgSandeep = await loadImg("/images/card-bg-sandeep.png");
          ctx.drawImage(bgSandeep, 0, 0, W, H);
        } catch (e) {}
      }

      // 4. Crisp Outer Card Borders
      const margin = 26;
      roundRect(margin, margin, W - 2 * margin, H - 2 * margin, 26);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.55)";
      ctx.lineWidth = 2;
      ctx.stroke();

      roundRect(margin + 6, margin + 6, W - 2 * (margin + 6), H - 2 * (margin + 6), 22);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 5. PROMINENT: RADHE RADHE FOUNDATION (REG. NO. E-0040526 GBR)
      const rrW = 720;
      const rrH = 44;
      const rrY = 48;
      roundRect(W / 2 - rrW / 2, rrY, rrW, rrH, 22);
      ctx.fillStyle = "rgba(180, 83, 9, 0.95)";
      ctx.fill();
      ctx.strokeStyle = "rgba(253, 224, 71, 0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px Arial, sans-serif";
      ctx.letterSpacing = "1.5px";
      ctx.fillText("★ RADHE RADHE FOUNDATION  |  REG. NO. E-0040526 (GBR) ★", W / 2, rrY + 28);

      // 6. Logo & Top Header
      try {
        const logo = await loadImg("/images/gpl-logo.png");
        const logoSize = 110;
        ctx.save();
        ctx.shadowColor = "rgba(255, 255, 255, 0.25)";
        ctx.shadowBlur = 18;
        ctx.drawImage(logo, W / 2 - logoSize / 2, 105, logoSize, logoSize);
        ctx.restore();
      } catch (_) {}

      // Title: GOREGAON PREMIER LEAGUE
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px Arial, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("GOREGAON PREMIER LEAGUE", W / 2, 230);

      // Subtitle: GOREGAON PURV VIDHAN SABHA
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 18px Arial, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("GOREGAON PURV VIDHAN SABHA", W / 2, 260);

      // 7. Red "SEASON 4" Stamp
      const s4W = 200;
      const s4H = 38;
      const s4Y = 290;
      roundRect(W / 2 - s4W / 2, s4Y, s4W, s4H, 10);
      ctx.fillStyle = "#dc2626";
      ctx.fill();
      ctx.strokeStyle = "rgba(248, 113, 113, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Impact, Arial Black, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("SEASON 4", W / 2, s4Y + 26);

      // 8. AUCTION POOL Title
      const apY = 372;
      ctx.font = "900 86px Impact, Arial Black, sans-serif";
      ctx.letterSpacing = "4px";

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillText("AUCTION POOL", W / 2 + 2, apY + 2);

      const goldGrad = ctx.createLinearGradient(0, apY - 60, 0, apY + 10);
      goldGrad.addColorStop(0, "#fef08a");
      goldGrad.addColorStop(0.5, "#f59e0b");
      goldGrad.addColorStop(1, "#b45309");
      ctx.fillStyle = goldGrad;
      ctx.fillText("AUCTION POOL", W / 2, apY);

      // 9. Clean "✔ QUALIFIED" Ribbon
      const qW = 290;
      const qH = 40;
      const qY = 422;
      roundRect(W / 2 - qW / 2, qY, qW, qH, 20);
      ctx.fillStyle = "rgba(185, 28, 28, 0.95)";
      ctx.fill();
      ctx.strokeStyle = "rgba(252, 165, 165, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 19px Impact, Arial, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("✔  QUALIFIED", W / 2, qY + 27);

      // 10. Hero Player Portrait
      const pSize = 360;
      const pX = W / 2 - pSize / 2;
      const pY = 488;
      const pRad = 32;

      ctx.save();
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 32;
      roundRect(pX - 5, pY - 5, pSize + 10, pSize + 10, pRad + 5);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      roundRect(pX, pY, pSize, pSize, pRad);
      ctx.clip();

      let photoDrawn = false;
      if (photo) {
        try {
          const playerImg = await loadImg(photo);
          ctx.drawImage(playerImg, pX, pY, pSize, pSize);
          photoDrawn = true;
        } catch (_) {}
      }

      if (!photoDrawn) {
        const avGrad = ctx.createLinearGradient(pX, pY, pX + pSize, pY + pSize);
        avGrad.addColorStop(0, "#0e1a33");
        avGrad.addColorStop(1, "#071124");
        ctx.fillStyle = avGrad;
        ctx.fillRect(pX, pY, pSize, pSize);

        const initials = (player?.name || "GPL")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        ctx.fillStyle = "rgba(245, 158, 11, 0.85)";
        ctx.font = "bold 110px Arial Black, sans-serif";
        ctx.fillText(initials, pX + pSize / 2, pY + pSize / 2 + 38);
      }
      ctx.restore();

      roundRect(pX - 10, pY - 10, pSize + 20, pSize + 20, pRad + 10);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 11. Player Full Name
      const playerName = (player?.name || "PLAYER NAME").toUpperCase();
      ctx.save();
      ctx.font = `900 ${playerName.length > 18 ? 42 : 48}px Arial Black, Impact, sans-serif`;
      ctx.letterSpacing = "2px";
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillText(playerName, W / 2 + 2, 898 + 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(playerName, W / 2, 898);
      ctx.restore();

      // 12. Clean ID Chip: GPL ID : GPL2026-XXXX
      const idStr = `GPL ID : GPL2026-${String(regNum || "0001").padStart(4, "0")}`;
      const chipW = 380;
      const chipH = 48;
      const chipY = 936;
      roundRect(W / 2 - chipW / 2, chipY, chipW, chipH, 24);
      ctx.fillStyle = "rgba(10, 20, 38, 0.85)";
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#fde047";
      ctx.font = "bold 22px Courier New, monospace";
      ctx.letterSpacing = "2px";
      ctx.fillText(idStr, W / 2, chipY + 32);

      // 13. 3 Clean Badges: WARD, ROLE, ZONE
      const badges = [
        { label: "📍 WARD", val: (player?.ward || "Ward 51").toUpperCase() },
        { label: "🏏 ROLE", val: (player?.speciality || "Batsman").toUpperCase() },
        { label: "🛡️ ZONE", val: "GOREGAON PURV" },
      ];

      const bW = 280;
      const bH = 86;
      const bGap = 24;
      const totalBW = 3 * bW + 2 * bGap;
      const startBX = (W - totalBW) / 2;
      const bY = 1014;

      badges.forEach((b, i) => {
        const bx = startBX + i * (bW + bGap);
        roundRect(bx, bY, bW, bH, 16);
        ctx.fillStyle = "rgba(14, 24, 46, 0.85)";
        ctx.fill();
        ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
        ctx.font = "bold 15px Arial, sans-serif";
        ctx.letterSpacing = "2px";
        ctx.fillText(b.label, bx + bW / 2, bY + 28);

        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${b.val.length > 14 ? 17 : 21}px Impact, Arial, sans-serif`;
        ctx.letterSpacing = "1px";
        ctx.fillText(b.val, bx + bW / 2, bY + 62);
      });

      // 14. Kit Size Strip
      const kitW = 580;
      const kitH = 46;
      const kitY = 1130;
      roundRect(W / 2 - kitW / 2, kitY, kitW, kitH, 23);
      ctx.fillStyle = "rgba(12, 22, 42, 0.8)";
      ctx.fill();
      ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 15px Arial, sans-serif";
      ctx.letterSpacing = "1.5px";
      ctx.fillText(`OFFICIAL KIT: T-SHIRT ${player?.tshirtSize || "M"} • TRACK ${player?.trackSize || "M"}  |  VERIFIED ENTRY`, W / 2, kitY + 28);

      // 15. Minimalist Baseline
      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.font = "bold 14px Arial, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("RADHE RADHE FOUNDATION (REG. NO. E-0040526 GBR)  •  GOREGAON PREMIER LEAGUE", W / 2, 1225);

      setRendered(true);
    };

    draw().catch(console.error);
  }, [player, regNum, photo]);

  const handleDownload = () => {
    setDownloading(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    const cleanName = (player?.name || "Player").replace(/[^a-zA-Z0-9]/g, "_");
    link.download = `GPL4_PlayerCard_${cleanName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setTimeout(() => setDownloading(false), 800);
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return handleDownload();
      const file = new File([blob], `GPL_Season4_${player?.name || "Player"}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "GPL Season 4 — Registered Player",
            text: `I just registered for Goregaon Premier League Season 4! 🏏 #GPL4 #Goregaon`,
          });
        } catch (_) {}
      } else {
        handleDownload();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-md bg-transparent flex flex-col items-center gap-3.5 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute -top-3 -right-2 z-20 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-white transition-all shadow-lg cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Registration Confirmed • Player Card Ready!</span>
          </div>
          <p className="text-white/70 text-xs">Download or share your official GPL Season 4 player card</p>
        </div>

        {/* Live Canvas Card Container */}
        <div
          className={`w-full rounded-2xl overflow-hidden shadow-2xl border border-amber-500/30 transition-all duration-300 ${
            rendered ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          style={{ boxShadow: "0 20px 50px -10px rgba(245, 158, 11, 0.35)" }}
        >
          <canvas ref={canvasRef} className="w-full h-auto block" />
        </div>

        {!rendered && (
          <div className="w-full aspect-[4/5] rounded-2xl bg-[#060b18] border border-amber-500/20 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-amber-300 text-xs font-bold">Generating Official Player Card…</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {rendered && (
          <div className="flex gap-2.5 w-full">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Share</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer text-slate-950"
              style={{ background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)" }}
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>{downloading ? "Saving Card…" : "Download Card"}</span>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-white underline pt-1 cursor-pointer"
        >
          View Registration Details
        </button>
      </div>
    </div>
  );
}
