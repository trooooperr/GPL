"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2, X, CheckCircle2 } from "lucide-react";

/**
 * PlayerRegistrationCard
 * - Pure cricket stadium background (no clutter)
 * - Dual foreground hero portraits: Registered Player + Shri Sandeep Jadhav (with Trophy)
 * - High-impact 3D metallic typography for Instagram viral sharing
 * - Radhe Radhe Foundation Reg. No. E-0040526 (GBR)
 * - Goregaon Purv Vidhan Sabha
 */
export default function PlayerRegistrationCard({ player, regNum, photo, onClose }) {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1080x1350 (4:5 vertical sports poster ratio for Instagram)
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
      // 1. Draw pure cricket stadium background
      try {
        const stadiumBg = await loadImg("/images/stadium-pure-bg.jpg");
        ctx.drawImage(stadiumBg, 0, 0, W, H);
      } catch (_) {
        // fallback gradient
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, "#080310");
        bg.addColorStop(0.5, "#180824");
        bg.addColorStop(1, "#080310");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
      }

      // 2. Subtle contrast darkening overlay
      const topOverlay = ctx.createLinearGradient(0, 0, 0, 360);
      topOverlay.addColorStop(0, "rgba(8, 3, 16, 0.85)");
      topOverlay.addColorStop(1, "rgba(8, 3, 16, 0.45)");
      ctx.fillStyle = topOverlay;
      ctx.fillRect(0, 0, W, 360);

      const botOverlay = ctx.createLinearGradient(0, 820, 0, H);
      botOverlay.addColorStop(0, "rgba(8, 3, 16, 0.65)");
      botOverlay.addColorStop(1, "rgba(8, 3, 16, 0.95)");
      ctx.fillStyle = botOverlay;
      ctx.fillRect(0, 820, W, H - 820);

      // 3. Championship Gold Double Border
      const m = 22;
      roundRect(m, m, W - 2 * m, H - 2 * m, 24);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.78)";
      ctx.lineWidth = 3;
      ctx.stroke();

      roundRect(m + 6, m + 6, W - 2 * (m + 6), H - 2 * (m + 6), 20);
      ctx.strokeStyle = "rgba(253, 224, 71, 0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 4. TOP: RADHE RADHE FOUNDATION (REG. NO. E-0040526 GBR)
      const rrW = 760;
      const rrH = 42;
      const rrY = 38;
      roundRect(W / 2 - rrW / 2, rrY, rrW, rrH, 21);
      ctx.fillStyle = "rgba(180, 83, 9, 0.95)";
      ctx.fill();
      ctx.strokeStyle = "rgba(253, 224, 71, 0.95)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px Arial, sans-serif";
      ctx.letterSpacing = "1.5px";
      ctx.fillText("★ RADHE RADHE FOUNDATION  |  REG. NO. E-0040526 (GBR) ★", W / 2, rrY + 27);

      // 5. GPL Shield Logo
      try {
        const logo = await loadImg("/images/gpl-logo.png");
        const logoSize = 95;
        ctx.save();
        ctx.shadowColor = "rgba(255, 255, 255, 0.35)";
        ctx.shadowBlur = 18;
        ctx.drawImage(logo, W / 2 - logoSize / 2, 90, logoSize, logoSize);
        ctx.restore();
      } catch (_) {}

      // Title & Subtitle
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px Arial, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("GOREGAON PREMIER LEAGUE", W / 2, 202);

      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 18px Arial, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("GOREGAON PURV VIDHAN SABHA", W / 2, 230);

      // 6. Red "SEASON 4" Stamp
      const s4W = 180;
      const s4H = 34;
      const s4Y = 256;
      roundRect(W / 2 - s4W / 2, s4Y, s4W, s4H, 9);
      ctx.fillStyle = "#dc2626";
      ctx.fill();
      ctx.strokeStyle = "rgba(248, 113, 113, 0.9)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Impact, Arial Black, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("SEASON 4", W / 2, s4Y + 24);

      // 7. AUCTION POOL Title (Giant 3D Metallic Gold)
      const apY = 330;
      ctx.font = "900 82px Impact, Arial Black, sans-serif";
      ctx.letterSpacing = "4px";

      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.fillText("AUCTION POOL", W / 2 + 2, apY + 2);

      const goldGrad = ctx.createLinearGradient(0, apY - 60, 0, apY + 10);
      goldGrad.addColorStop(0, "#fef08a");
      goldGrad.addColorStop(0.5, "#f59e0b");
      goldGrad.addColorStop(1, "#b45309");
      ctx.fillStyle = goldGrad;
      ctx.fillText("AUCTION POOL", W / 2, apY);

      // 8. Red "✔ QUALIFIED & REGISTERED" Ribbon
      const qW = 320;
      const qH = 36;
      const qY = 372;
      roundRect(W / 2 - qW / 2, qY, qW, qH, 18);
      ctx.fillStyle = "rgba(185, 28, 28, 0.95)";
      ctx.fill();
      ctx.strokeStyle = "rgba(252, 165, 165, 0.75)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px Impact, Arial, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("✔  QUALIFIED & REGISTERED", W / 2, qY + 25);

      // 9. FOREGROUND DUAL HERO PORTRAITS (PLAYER + SHRI SANDEEP JADHAV)
      const cardW = 420;
      const cardH = 420;
      const cardRad = 28;
      const gap = 40;
      const startX = (W - (2 * cardW + gap)) / 2;
      const cardsY = 430;

      // --- LEFT FOREGROUND: REGISTERED PLAYER ---
      const pX = startX;
      const pY = cardsY;

      ctx.save();
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 28;
      roundRect(pX - 3, pY - 3, cardW + 6, cardH + 6, cardRad + 3);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      roundRect(pX, pY, cardW, cardH, cardRad);
      ctx.clip();

      let playerDrawn = false;
      if (photo) {
        try {
          const pImg = await loadImg(photo);
          ctx.drawImage(pImg, pX, pY, cardW, cardH);
          playerDrawn = true;
        } catch (_) {}
      }

      if (!playerDrawn) {
        const avGrad = ctx.createLinearGradient(pX, pY, pX + cardW, pY + cardH);
        avGrad.addColorStop(0, "#0e1a33");
        avGrad.addColorStop(1, "#071124");
        ctx.fillStyle = avGrad;
        ctx.fillRect(pX, pY, cardW, cardH);

        const initials = (player?.name || "GPL")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        ctx.fillStyle = "rgba(245, 158, 11, 0.85)";
        ctx.font = "bold 110px Arial Black, sans-serif";
        ctx.fillText(initials, pX + cardW / 2, pY + cardH / 2 + 38);
      }
      ctx.restore();

      // Player tag at bottom
      const ptagW = 240;
      const ptagH = 32;
      roundRect(pX + cardW / 2 - ptagW / 2, pY + cardH - 22, ptagW, ptagH, 16);
      ctx.fillStyle = "rgba(10, 20, 38, 0.95)";
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#fde047";
      ctx.font = "bold 13px Arial, sans-serif";
      ctx.letterSpacing = "1px";
      ctx.fillText("★ REGISTERED PLAYER ★", pX + cardW / 2, pY + cardH - 2);

      // --- RIGHT FOREGROUND: SHRI SANDEEP JADHAV ---
      const sX = startX + cardW + gap;
      const sY = cardsY;

      ctx.save();
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 28;
      roundRect(sX - 3, sY - 3, cardW + 6, cardH + 6, cardRad + 3);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      roundRect(sX, sY, cardW, cardH, cardRad);
      ctx.clip();

      try {
        const sandeepImg = await loadImg("/images/sandeep-excellence.jpg");
        // Crop centered upper-torso holding trophy (source 768x1024)
        const sx = 90;
        const sy = 160;
        const sSize = 588;
        ctx.drawImage(sandeepImg, sx, sy, sSize, sSize, sX, sY, cardW, cardH);
      } catch (_) {}
      ctx.restore();

      // Sandeep tag at bottom
      const stagW = 260;
      const stagH = 32;
      roundRect(sX + cardW / 2 - stagW / 2, sY + cardH - 22, stagW, stagH, 16);
      ctx.fillStyle = "rgba(10, 20, 38, 0.95)";
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#fde047";
      ctx.font = "bold 13px Arial, sans-serif";
      ctx.letterSpacing = "1px";
      ctx.fillText("★ संस्थापक: श्री. संदीप जाधव ★", sX + cardW / 2, sY + cardH - 2);

      // 10. PLAYER FULL NAME
      const playerName = (player?.name || "PLAYER NAME").toUpperCase();
      ctx.save();
      ctx.font = `900 ${playerName.length > 18 ? 40 : 46}px Arial Black, Impact, sans-serif`;
      ctx.letterSpacing = "2px";
      ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
      ctx.fillText(playerName, W / 2 + 2, 892 + 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(playerName, W / 2, 892);
      ctx.restore();

      // 11. Clean ID Chip: GPL ID : GPL2026-XXXX
      const idStr = `GPL ID : GPL2026-${String(regNum || "0001").padStart(4, "0")}`;
      const chipW = 380;
      const chipH = 48;
      const chipY = 930;
      roundRect(W / 2 - chipW / 2, chipY, chipW, chipH, 24);
      ctx.fillStyle = "rgba(10, 20, 38, 0.92)";
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#fde047";
      ctx.font = "bold 22px Courier New, monospace";
      ctx.letterSpacing = "2px";
      ctx.fillText(idStr, W / 2, chipY + 32);

      // 12. 3 Clean Badges: WARD, ROLE, ZONE
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
      const bY = 1008;

      badges.forEach((b, i) => {
        const bx = startBX + i * (bW + bGap);
        roundRect(bx, bY, bW, bH, 16);
        ctx.fillStyle = "rgba(14, 24, 46, 0.92)";
        ctx.fill();
        ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
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

      // 13. Kit Size Strip
      const kitW = 580;
      const kitH = 46;
      const kitY = 1120;
      roundRect(W / 2 - kitW / 2, kitY, kitW, kitH, 23);
      ctx.fillStyle = "rgba(12, 22, 42, 0.88)";
      ctx.fill();
      ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 15px Arial, sans-serif";
      ctx.letterSpacing = "1.5px";
      ctx.fillText(`OFFICIAL KIT: T-SHIRT ${player?.tshirtSize || "M"} • TRACK ${player?.trackSize || "M"}  |  VERIFIED ENTRY`, W / 2, kitY + 28);

      // 14. Minimalist Baseline
      ctx.fillStyle = "rgba(203, 213, 225, 0.85)";
      ctx.font = "bold 14px Arial, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("RADHE RADHE FOUNDATION (REG. NO. E-0040526 GBR)  •  GOREGAON PREMIER LEAGUE", W / 2, 1215);

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
      <div className="relative w-full max-w-lg bg-transparent flex flex-col items-center gap-3.5 my-auto">
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
