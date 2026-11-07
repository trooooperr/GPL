"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2, X, CheckCircle2 } from "lucide-react";

/**
 * PlayerRegistrationCard
 * High-definition IPL/ISPL broadcast style Auction Pool card.
 * Renders directly on HTML5 Canvas and exports a 1080x1350 PNG for players.
 */
export default function PlayerRegistrationCard({ player, regNum, photo, onClose }) {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1080x1350 (4:5 vertical sports poster ratio)
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
      // 1. Luxury Dark Navy Sports Background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#050c1e");
      bg.addColorStop(0.35, "#091733");
      bg.addColorStop(0.7, "#0d1f42");
      bg.addColorStop(1, "#040915");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // 2. Diagonal sports stadium lines
      ctx.save();
      ctx.strokeStyle = "rgba(245, 158, 11, 0.05)";
      ctx.lineWidth = 2;
      for (let i = -300; i < W + 500; i += 90) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 400, H);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Stadium Light Flares & Glow
      ctx.save();
      // Center gold glow
      const radialCenter = ctx.createRadialGradient(W / 2, 280, 50, W / 2, 280, 450);
      radialCenter.addColorStop(0, "rgba(245, 158, 11, 0.16)");
      radialCenter.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = radialCenter;
      ctx.fillRect(0, 0, W, 700);

      // Top corner blue floodlight flares
      const radialLeft = ctx.createRadialGradient(0, 0, 20, 0, 0, 380);
      radialLeft.addColorStop(0, "rgba(59, 130, 246, 0.22)");
      radialLeft.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = radialLeft;
      ctx.fillRect(0, 0, 450, 450);

      const radialRight = ctx.createRadialGradient(W, 0, 20, W, 0, 380);
      radialRight.addColorStop(0, "rgba(59, 130, 246, 0.22)");
      radialRight.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = radialRight;
      ctx.fillRect(W - 450, 0, 450, 450);
      ctx.restore();

      // Top & Bottom Gold Bars
      const goldBar = ctx.createLinearGradient(0, 0, W, 0);
      goldBar.addColorStop(0, "#f59e0b");
      goldBar.addColorStop(0.5, "#fde68a");
      goldBar.addColorStop(1, "#d97706");
      ctx.fillStyle = goldBar;
      ctx.fillRect(0, 0, W, 8);
      ctx.fillRect(0, H - 8, W, 8);

      // 4. Logo + Header
      try {
        const logo = await loadImg("/images/gpl-logo.png");
        const logoSize = 120;
        ctx.save();
        ctx.shadowColor = "rgba(255, 255, 255, 0.35)";
        ctx.shadowBlur = 24;
        ctx.drawImage(logo, W / 2 - logoSize / 2, 28, logoSize, logoSize);
        ctx.restore();
      } catch (_) {}

      ctx.textAlign = "center";
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 18px Arial, sans-serif";
      ctx.letterSpacing = "4px";
      ctx.fillText("RADHE RADHE CHASHAK", W / 2, 172);

      // 5. Slanted Red Stamp: ★ SEASON 4 ★
      ctx.save();
      ctx.translate(W / 2, 218);
      ctx.rotate(-0.03); // slight energetic slant
      roundRect(-130, -22, 260, 44, 8);
      ctx.fillStyle = "#dc2626";
      ctx.fill();
      ctx.strokeStyle = "#f87171";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px Impact, Arial Black, sans-serif";
      ctx.letterSpacing = "3px";
      ctx.fillText("★ SEASON 4 ★", 0, 8);
      ctx.restore();

      // 6. Giant 3D Metallic Gold: AUCTION POOL
      const apY = 312;
      ctx.font = "900 82px Impact, Arial Black, sans-serif";
      ctx.letterSpacing = "5px";

      // 3D Extrusion Shadows
      for (let s = 6; s >= 1; s--) {
        ctx.fillStyle = "rgba(60, 25, 0, 0.7)";
        ctx.fillText("AUCTION POOL", W / 2 + s, apY + s);
      }
      // Top metallic gradient fill
      const goldGrad = ctx.createLinearGradient(0, apY - 60, 0, apY + 20);
      goldGrad.addColorStop(0, "#fef08a");
      goldGrad.addColorStop(0.5, "#f59e0b");
      goldGrad.addColorStop(1, "#b45309");
      ctx.fillStyle = goldGrad;
      ctx.fillText("AUCTION POOL", W / 2, apY);

      // 7. Red Pill Ribbon: ✔ QUALIFIED & REGISTERED
      const ribW = 440;
      const ribH = 48;
      const ribY = 352;
      roundRect(W / 2 - ribW / 2, ribY, ribW, ribH, 12);
      ctx.fillStyle = "#b91c1c";
      ctx.fill();
      ctx.strokeStyle = "rgba(254, 202, 202, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px Impact, Arial, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("✔  QUALIFIED & REGISTERED", W / 2, ribY + 32);

      // 8. Player Photo Frame
      const pSize = 310;
      const pX = W / 2 - pSize / 2;
      const pY = 435;
      const pRadius = 28;

      // Glow behind photo
      ctx.save();
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 36;
      roundRect(pX - 6, pY - 6, pSize + 12, pSize + 12, pRadius + 6);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();

      // Clip and draw image or avatar
      ctx.save();
      roundRect(pX, pY, pSize, pSize, pRadius);
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
        // Fallback stylish avatar
        const avGrad = ctx.createLinearGradient(pX, pY, pX + pSize, pY + pSize);
        avGrad.addColorStop(0, "#0f2042");
        avGrad.addColorStop(1, "#071126");
        ctx.fillStyle = avGrad;
        ctx.fillRect(pX, pY, pSize, pSize);

        // Initials
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

      // Outer gold border
      roundRect(pX - 12, pY - 12, pSize + 24, pSize + 24, pRadius + 10);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 9. Big Bold Player Name (Slanted Athletic Style)
      const playerName = (player?.name || "PLAYER NAME").toUpperCase();
      ctx.save();
      ctx.font = `italic 900 ${playerName.length > 18 ? 44 : 52}px Arial Black, Impact, sans-serif`;
      ctx.letterSpacing = "2px";
      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillText(playerName, W / 2 + 3, 808 + 3);
      // White text
      ctx.fillStyle = "#ffffff";
      ctx.fillText(playerName, W / 2, 808);
      ctx.restore();

      // 10. Golden ID Chip: GPL ID : GPL2026-0042
      const idStr = `GPL ID : GPL2026-${String(regNum || "0001").padStart(4, "0")}`;
      const chipW = 420;
      const chipH = 50;
      const chipY = 840;
      roundRect(W / 2 - chipW / 2, chipY, chipW, chipH, 25);
      ctx.fillStyle = "rgba(10, 22, 45, 0.85)";
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = "#fde047";
      ctx.font = "bold 24px Courier New, monospace";
      ctx.letterSpacing = "2px";
      ctx.fillText(idStr, W / 2, chipY + 34);

      // 11. 3 Stat Badges: WARD, ROLE, ZONE
      const badges = [
        { label: "📍 WARD", val: (player?.ward || "Ward 51").toUpperCase() },
        { label: "🏏 ROLE", val: (player?.speciality || "Batsman").toUpperCase() },
        { label: "🛡️ ZONE", val: "GOREGAON PURV" },
      ];

      const bW = 290;
      const bH = 92;
      const bGap = 25;
      const totalBW = 3 * bW + 2 * bGap;
      const startBX = (W - totalBW) / 2;
      const bY = 925;

      badges.forEach((b, i) => {
        const bx = startBX + i * (bW + bGap);
        roundRect(bx, bY, bW, bH, 16);
        ctx.fillStyle = "rgba(15, 30, 60, 0.85)";
        ctx.fill();
        ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Top gold accent
        ctx.beginPath();
        ctx.moveTo(bx + 20, bY + 2);
        ctx.lineTo(bx + bW - 20, bY + 2);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = "rgba(203, 213, 225, 0.8)";
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.letterSpacing = "2px";
        ctx.fillText(b.label, bx + bW / 2, bY + 32);

        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${b.val.length > 14 ? 18 : 22}px Impact, Arial, sans-serif`;
        ctx.letterSpacing = "1px";
        ctx.fillText(b.val, bx + bW / 2, bY + 68);
      });

      // 12. Kit Size Strip
      const kitStr = `OFFICIAL KIT: T-SHIRT ${player?.tshirtSize || "M"}  •  TRACK ${player?.trackSize || "M"}   |   AUCTION POOL CONFIRMED`;
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 17px Arial, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText(kitStr, W / 2, 1060);

      // 13. Bottom Organizer Banner
      const botY = 1110;
      const botH = 170;
      ctx.fillStyle = "rgba(4, 10, 24, 0.95)";
      ctx.fillRect(0, botY, W, botH);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, botY);
      ctx.lineTo(W, botY);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px Impact, Arial Black, sans-serif";
      ctx.letterSpacing = "3px";
      ctx.fillText("GOREGAON PREMIER LEAGUE • SEASON 4", W / 2, botY + 44);

      ctx.fillStyle = "#fde047";
      ctx.font = "bold 22px Arial, sans-serif";
      ctx.letterSpacing = "1px";
      ctx.fillText("Organised by: Mohsin Patel & Balram Gupta (Ballu)", W / 2, botY + 85);

      ctx.fillStyle = "rgba(156, 163, 175, 0.85)";
      ctx.font = "16px Arial, sans-serif";
      ctx.letterSpacing = "1px";
      ctx.fillText("Ward 51 & Ward 54  •  Goregaon Purv Vidhan Sabha  •  goregaonpl.vercel.app", W / 2, botY + 125);

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
          className="absolute -top-3 -right-2 z-20 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-white transition-all shadow-lg"
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
          <div className="w-full aspect-[4/5] rounded-2xl bg-[#071126] border border-amber-500/20 flex items-center justify-center">
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
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold transition-all"
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
          className="text-xs text-slate-400 hover:text-white underline pt-1"
        >
          View Registration Details
        </button>
      </div>
    </div>
  );
}