"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2, X, CheckCircle2 } from "lucide-react";

/**
 * PlayerRegistrationCard
 * Matches the ISPL-style reference card:
 * - Stadium background (purple)
 * - New GPL logo (white bg removed) centered top
 * - RADHE RADHE FOUNDATION | REG. NO. E-0040526 (GBR) top bar
 * - GOREGAON PREMIER LEAGUE + GOREGAON PURV VIDHAN SABHA
 * - SEASON 4 red badge
 * - PLAYER (giant gold) + REGISTRATION CARD
 * - Left: Player photo box (dark, gold border)
 * - Right of photo box: Player name (large white bold italic) + PLAYER ID in gold oval
 * - Right side FOREGROUND: Sandeep Jadhav full cutout (not in box, overlapping)
 * - Bottom: WARD + ROLE badges only (no ZONE)
 * - Sandeep attribution text in Hindi near him
 * - Bottom gold decorative strip
 */
export default function PlayerRegistrationCard({ player, regNum, photo, onClose }) {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1080x1350 — 4:5 Instagram portrait
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

    /** Draw a rounded rectangle path */
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

    /** Stroke text with shadow for readability */
    const strokeText = (text, x, y, strokeColor = "rgba(0,0,0,0.9)", strokeW = 4) => {
      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeW;
      ctx.lineJoin = "round";
      ctx.strokeText(text, x, y);
      ctx.restore();
    };

    const draw = async () => {
      // ─── 1. STADIUM BACKGROUND ───────────────────────────────────────────
      try {
        const stadiumBg = await loadImg("/images/stadium-pure-bg.jpg");
        ctx.drawImage(stadiumBg, 0, 0, W, H);
      } catch (_) {
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, "#0a0118");
        bg.addColorStop(0.5, "#1a0535");
        bg.addColorStop(1, "#0a0118");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
      }

      // Dark gradient overlay over upper region for readability
      const topGrad = ctx.createLinearGradient(0, 0, 0, 500);
      topGrad.addColorStop(0, "rgba(5, 2, 15, 0.82)");
      topGrad.addColorStop(1, "rgba(5, 2, 15, 0.0)");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, W, 500);

      // Dark gradient over bottom region
      const botGrad = ctx.createLinearGradient(0, 850, 0, H);
      botGrad.addColorStop(0, "rgba(5, 2, 15, 0.0)");
      botGrad.addColorStop(0.4, "rgba(5, 2, 15, 0.75)");
      botGrad.addColorStop(1, "rgba(5, 2, 15, 0.97)");
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, 850, W, H - 850);

      // ─── 2. OUTER GOLD BORDER ────────────────────────────────────────────
      const bm = 18;
      roundRect(bm, bm, W - 2 * bm, H - 2 * bm, 20);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
      ctx.lineWidth = 3;
      ctx.stroke();

      roundRect(bm + 7, bm + 7, W - 2 * (bm + 7), H - 2 * (bm + 7), 15);
      ctx.strokeStyle = "rgba(253, 224, 71, 0.22)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // ─── 3. TOP BAR: RADHE RADHE FOUNDATION ─────────────────────────────
      const barW = 820;
      const barH = 44;
      const barY = 36;
      const barX = W / 2 - barW / 2;

      // Dark bar with gold border
      roundRect(barX, barY, barW, barH, 22);
      ctx.fillStyle = "rgba(10, 6, 2, 0.88)";
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = "#fde047";
      ctx.font = "bold 16px Arial, sans-serif";
      ctx.letterSpacing = "1.5px";
      ctx.fillText("RADHE RADHE FOUNDATION  |  REG. NO. E-0040526 (GBR)", W / 2, barY + 29);

      // ─── 4. GPL LOGO (new, white bg removed) ────────────────────────────
      try {
        const logo = await loadImg("/images/gpl-logo-new.png");
        const logoH = 230;
        const logoW = logoH; // 1024x1024 square
        ctx.save();
        ctx.shadowColor = "rgba(255, 215, 0, 0.6)";
        ctx.shadowBlur = 30;
        ctx.drawImage(logo, W / 2 - logoW / 2, 92, logoW, logoH);
        ctx.restore();
      } catch (_) {
        // fallback: try old logo
        try {
          const logo = await loadImg("/images/gpl-logo.png");
          ctx.save();
          ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
          ctx.shadowBlur = 20;
          ctx.drawImage(logo, W / 2 - 90, 95, 180, 180);
          ctx.restore();
        } catch (__) {}
      }

      // ─── 5. "GOREGAON PREMIER LEAGUE" ───────────────────────────────────
      ctx.textAlign = "center";
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px 'Arial Black', Impact, sans-serif";
      ctx.letterSpacing = "1px";
      ctx.fillText("GOREGAON PREMIER LEAGUE", W / 2, 306);
      ctx.restore();

      // Decorative gold line + subtitle
      const lineY = 336;
      ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, lineY);
      ctx.lineTo(W / 2 - 195, lineY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W / 2 + 195, lineY);
      ctx.lineTo(W - 100, lineY);
      ctx.stroke();

      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 20px Arial, sans-serif";
      ctx.letterSpacing = "3px";
      ctx.fillText("GOREGAON PURV VIDHAN SABHA", W / 2, 336);

      // ─── 6. SEASON 4 BADGE (clean breathing room) ───────────────────────
      const s4W = 210;
      const s4H = 38;
      const s4Y = 366;
      roundRect(W / 2 - s4W / 2, s4Y, s4W, s4H, 10);
      ctx.fillStyle = "#b91c1c";
      ctx.fill();
      ctx.strokeStyle = "rgba(248, 113, 113, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px 'Arial Black', Impact, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("SEASON 4", W / 2, s4Y + 26);

      // ─── 7. "PLAYER" GIANT GOLD METALLIC (cleanly below Season 4) ────────
      const playerTitleY = 472;
      ctx.font = "900 94px Impact, 'Arial Black', sans-serif";
      ctx.letterSpacing = "5px";
      ctx.textAlign = "center";

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.9)";
      ctx.fillText("PLAYER", W / 2 + 3, playerTitleY + 3);

      // Gold gradient
      const goldG = ctx.createLinearGradient(0, playerTitleY - 80, 0, playerTitleY + 8);
      goldG.addColorStop(0, "#fff176");
      goldG.addColorStop(0.3, "#fbbf24");
      goldG.addColorStop(0.65, "#f59e0b");
      goldG.addColorStop(1, "#92400e");
      ctx.fillStyle = goldG;
      ctx.fillText("PLAYER", W / 2, playerTitleY);

      // ─── 8. "REGISTRATION CARD" spaced text ──────────────────────────────
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px Arial, sans-serif";
      ctx.letterSpacing = "8px";
      ctx.fillText("REGISTRATION CARD", W / 2, 518);

      // ─── 9. INFO SECTION ─────────────────────────────────────────────────
      // Player photo box — left side, starts x=60
      const photoX = 55;
      const photoY = 575;
      const photoW = 300;
      const photoH = 320;
      const photoR = 20;

      // Gold glow behind photo box
      ctx.save();
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 32;
      roundRect(photoX - 4, photoY - 4, photoW + 8, photoH + 8, photoR + 4);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // Photo box dark background
      roundRect(photoX, photoY, photoW, photoH, photoR);
      ctx.fillStyle = "rgba(10, 14, 28, 0.92)";
      ctx.fill();

      // Draw player photo (clipped)
      ctx.save();
      roundRect(photoX, photoY, photoW, photoH, photoR);
      ctx.clip();

      let playerPhotoDrawn = false;
      if (photo) {
        try {
          const pImg = await loadImg(photo);
          // Smart crop: square from center
          const pSrc = pImg.naturalWidth;
          const pSrcH = pImg.naturalHeight;
          const sq = Math.min(pSrc, pSrcH);
          const sx = (pSrc - sq) / 2;
          const sy = pSrcH > pSrc ? 0 : (pSrcH - sq) / 2;
          ctx.drawImage(pImg, sx, sy, sq, sq, photoX, photoY, photoW, photoH);
          playerPhotoDrawn = true;
        } catch (_) {}
      }

      if (!playerPhotoDrawn) {
        // Silhouette placeholder
        ctx.fillStyle = "rgba(10, 14, 28, 0.95)";
        ctx.fillRect(photoX, photoY, photoW, photoH);

        // Person silhouette (head + body)
        ctx.fillStyle = "rgba(100, 116, 139, 0.6)";
        const cx = photoX + photoW / 2;
        const cy = photoY + photoH / 2;
        // Head circle
        ctx.beginPath();
        ctx.arc(cx, cy - 60, 52, 0, Math.PI * 2);
        ctx.fill();
        // Body trapezoid
        ctx.beginPath();
        ctx.moveTo(cx - 70, cy + 125);
        ctx.lineTo(cx + 70, cy + 125);
        ctx.lineTo(cx + 55, cy - 10);
        ctx.lineTo(cx - 55, cy - 10);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // ─── 10. PLAYER NAME & ID (right of photo box) ───────────────────────
      const infoX = photoX + photoW + 32;
      const infoW = W / 2 - infoX - 20; // leaves space on right for Sandeep
      // Actually let's give more space since sandeep overlaps from right
      const infoWide = 390;

      const playerName = (player?.name || "PLAYER NAME").toUpperCase();

      // Player name — large white bold italic
      ctx.textAlign = "left";
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.95)";
      ctx.shadowBlur = 12;

      const nameFontSize = playerName.length > 14 ? 44 : playerName.length > 10 ? 50 : 56;

      // Split name into words and render on two lines if needed
      const nameParts = playerName.split(" ");
      ctx.font = `900 italic ${nameFontSize}px 'Arial Black', Impact, sans-serif`;
      ctx.letterSpacing = "1px";
      ctx.fillStyle = "#ffffff";

      if (nameParts.length >= 2) {
        // Two lines
        const line1 = nameParts[0];
        const line2 = nameParts.slice(1).join(" ");
        ctx.fillText(line1, infoX, photoY + 70);
        ctx.fillText(line2, infoX, photoY + 70 + nameFontSize + 10);
      } else {
        ctx.fillText(playerName, infoX, photoY + 70);
      }
      ctx.restore();

      // "PLAYER ID" label
      const idLabelY = photoY + 185;
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(203, 213, 225, 0.85)";
      ctx.font = "bold 18px Arial, sans-serif";
      ctx.letterSpacing = "3px";
      ctx.fillText("PLAYER ID", infoX, idLabelY);

      // Player ID in gold oval
      const idVal = String(regNum || "0001");
      const ovalY = idLabelY + 14;
      const ovalH = 56;
      const ovalW = Math.max(160, idVal.length * 28 + 60);

      roundRect(infoX, ovalY, ovalW, ovalH, 28);
      ctx.fillStyle = "rgba(10, 14, 28, 0.9)";
      ctx.fill();

      // Gold gradient oval border
      const ovalBorderG = ctx.createLinearGradient(infoX, ovalY, infoX + ovalW, ovalY + ovalH);
      ovalBorderG.addColorStop(0, "#fbbf24");
      ovalBorderG.addColorStop(0.5, "#f59e0b");
      ovalBorderG.addColorStop(1, "#d97706");
      ctx.strokeStyle = ovalBorderG;
      ctx.lineWidth = 3;
      ctx.stroke();

      // ID number text
      ctx.textAlign = "center";
      ctx.fillStyle = "#fde047";
      ctx.font = `bold 32px 'Courier New', monospace`;
      ctx.letterSpacing = "3px";
      ctx.fillText(idVal, infoX + ovalW / 2, ovalY + 38);

      // ─── 11. SANDEEP JADHAV — RIGHT SIDE FOREGROUND CUTOUT ───────────────
      try {
        const sanImg = await loadImg("/images/sandeep-jadhav-transparent.png");
        const targetH = 800;
        const targetW = sanImg.naturalWidth * (targetH / sanImg.naturalHeight);
        const sandeepDestX = W - targetW + 35;
        const sandeepDestY = 510;

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = -8;
        ctx.shadowOffsetY = 8;
        ctx.drawImage(sanImg, sandeepDestX, sandeepDestY, targetW, targetH);
        ctx.restore();
      } catch (e) {
        console.error("Sandeep cutout load error:", e);
      }

      // ─── 12. BOTTOM BADGES: WARD + ROLE only (clean gold pill badges) ─────
      const badgeData = [
        { tag: "WARD", val: (player?.ward || "Ward 51").toUpperCase() },
        { tag: "ROLE", val: (player?.speciality || "Batsman").toUpperCase() },
      ];

      const bW = 430;
      const bH = 72;
      const bGap = 18;
      const bStartX = 75;
      const bY1 = 880;

      badgeData.forEach((b, i) => {
        const bY = bY1 + i * (bH + bGap);

        // Badge main background
        roundRect(bStartX, bY, bW, bH, 16);
        ctx.fillStyle = "rgba(10, 14, 28, 0.94)";
        ctx.fill();
        ctx.strokeStyle = "rgba(245, 158, 11, 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Left Tag Pill (Gold background, dark bold text)
        const tagW = 95;
        const tagH = 42;
        const tagX = bStartX + 16;
        const tagY = bY + (bH - tagH) / 2;
        roundRect(tagX, tagY, tagW, tagH, 10);
        ctx.fillStyle = "#f59e0b";
        ctx.fill();

        ctx.textAlign = "center";
        ctx.fillStyle = "#0a0602";
        ctx.font = "bold 15px Arial, sans-serif";
        ctx.letterSpacing = "1.5px";
        ctx.fillText(b.tag, tagX + tagW / 2, tagY + 26);

        // Right Value (clean, bold white text)
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${b.val.length > 16 ? 20 : 25}px 'Arial Black', Impact, sans-serif`;
        ctx.letterSpacing = "1px";
        ctx.fillText(b.val, bStartX + 130, bY + 45);
      });

      // ─── 13. SANDEEP ATTRIBUTION (Hindi text, elegant & crisp) ────────────
      const attrCX = 780;
      const attrY = 1200;

      ctx.textAlign = "center";
      ctx.fillStyle = "#fde047";
      ctx.font = "bold 20px 'Arial Unicode MS', Arial, sans-serif";
      ctx.letterSpacing = "1px";
      ctx.fillText("शुभेच्छुक", attrCX, attrY);

      // Name in red with white stroke
      ctx.save();
      const nameText = "श्री. संदीप जाधव";
      ctx.font = "bold 38px 'Arial Unicode MS', Arial, sans-serif";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.strokeText(nameText, attrCX, attrY + 40);
      ctx.fillStyle = "#dc2626";
      ctx.fillText(nameText, attrCX, attrY + 40);
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 17px 'Arial Unicode MS', Arial, sans-serif";
      ctx.letterSpacing = "0.5px";
      ctx.fillText("संस्थापक-राधे राधे फाऊंडेशन", attrCX, attrY + 76);

      // ─── FOOTER COMPLETELY REMOVED! ──────────────────────────────────────

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
            title: "GPL Season 4 — Player Registration Card",
            text: `मी Goregaon Premier League Season 4 साठी नोंदणी केली! 🏏 #GPL4 #GoregaonPremierLeague #RadheRadheFoundation`,
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

        {/* Loader while drawing */}
        {!rendered && (
          <div className="w-full aspect-[4/5] rounded-2xl bg-[#060b18] border border-amber-500/20 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-[3px] border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-amber-300 text-xs font-bold">Generating Official Player Card…</p>
            </div>
          </div>
        )}

        {/* Canvas Card */}
        <div
          className={`w-full rounded-2xl overflow-hidden shadow-2xl border border-amber-500/30 transition-all duration-300 ${
            rendered ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute pointer-events-none"
          }`}
          style={{ boxShadow: "0 20px 50px -10px rgba(245, 158, 11, 0.4)" }}
        >
          <canvas ref={canvasRef} className="w-full h-auto block" />
        </div>

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
