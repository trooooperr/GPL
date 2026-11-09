"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2, X, CheckCircle2 } from "lucide-react";

/**
 * PlayerRegistrationCard
 * High-resolution official GPL Season 4 Player Registration Card:
 * - Ultra-crisp official stadium background with gold borders
 * - Radhe Radhe Foundation header & official registration number
 * - Official GPL logo with peacock feather and flute
 * - Goregaon Premier League - Season 4 - Player Registration Card title graphic
 * - Sandeep Jadhav official portrait in bottom-right corner
 * - Completely dynamic Player Photo (uploaded photo or avatar) inside gold frame
 * - Completely dynamic Player Name in metallic bold italic chrome with black outline
 * - Completely dynamic Player ID inside golden oval pill
 * - Completely dynamic Ward and Role inside golden badge pills
 */
export default function PlayerRegistrationCard({ player, regNum, photo, onClose }) {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Match master template resolution (935x1024)
    const W = 935;
    const H = 1024;
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

    /** Render metallic bold italic text with black stroke outline and shear */
    const drawMetallicText = ({
      text,
      x,
      y,
      baseSize = 28,
      maxW = 280,
      align = "center",
      shear = -0.20,
      strokeWidth = 6,
    }) => {
      ctx.save();
      let size = baseSize;
      ctx.font = `900 ${size}px 'Arial Black', Impact, sans-serif`;
      while (ctx.measureText(text).width > maxW && size > 16) {
        size -= 2;
        ctx.font = `900 ${size}px 'Arial Black', Impact, sans-serif`;
      }

      ctx.textAlign = align;
      ctx.textBaseline = "middle";

      // Apply italic shear transform around (x, y)
      ctx.translate(x, y);
      ctx.transform(1, 0, shear, 1, 0, 0);

      // Black stroke outline
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = strokeWidth;
      ctx.lineJoin = "round";
      ctx.strokeText(text, 0, 0);

      // Metallic chrome silver-white gradient
      const grad = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.55, "#e2e8f0");
      grad.addColorStop(1, "#b0bcc8");
      ctx.fillStyle = grad;
      ctx.fillText(text, 0, 0);

      ctx.restore();
    };

    const draw = async () => {
      try {
        // ─── 1. BASE TEMPLATE ──────────────────────────────────────────────
        const baseImg = await loadImg("/images/gpl-card-base.png?v=4");
        ctx.drawImage(baseImg, 0, 0, W, H);
      } catch (err) {
        console.error("Base image load error:", err);
      }

      // ─── 2. DYNAMIC PLAYER INFO BLOCK ──────────────────────────────────
      const blkX = 70;
      const blkY = 562;
      const blkW = 505;
      const blkH = 185;
      const scaleP = blkW / 920; // 0.5489

      // A) Photo Box inner bounds
      const px = blkX + 31 * scaleP; // ~87
      const py = blkY + 28 * scaleP; // ~577
      const pw = 270 * scaleP;       // ~148
      const ph = 280 * scaleP;       // ~154
      const pr = 26 * scaleP;        // ~14

      // Draw dark background inside photo box
      roundRect(px, py, pw, ph, pr);
      ctx.fillStyle = "rgba(10, 14, 28, 0.96)";
      ctx.fill();

      // Draw player photo or silhouette placeholder
      let photoDrawn = false;
      if (photo) {
        try {
          const pImg = await loadImg(photo);
          ctx.save();
          roundRect(px, py, pw, ph, pr);
          ctx.clip();

          const srcW = pImg.naturalWidth;
          const srcH = pImg.naturalHeight;
          const sq = Math.min(srcW, srcH);
          const sx = (srcW - sq) / 2;
          const sy = (srcH - sq) / 2;
          ctx.drawImage(pImg, sx, sy, sq, sq, px, py, pw, ph);
          ctx.restore();
          photoDrawn = true;
        } catch (_) {}
      }

      if (!photoDrawn) {
        // Silhouette avatar placeholder
        ctx.save();
        roundRect(px, py, pw, ph, pr);
        ctx.clip();
        ctx.fillStyle = "rgba(120, 136, 160, 0.85)";
        const cx = px + pw / 2;
        const cy = py + ph / 2;
        // Head
        ctx.beginPath();
        ctx.arc(cx, cy - 24, 23, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.beginPath();
        ctx.moveTo(cx - 38, cy + 58);
        ctx.lineTo(cx + 38, cy + 58);
        ctx.lineTo(cx + 28, cy + 12);
        ctx.lineTo(cx - 28, cy + 12);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // B) Draw Player Frame overlay
      try {
        const frameImg = await loadImg("/images/gpl-card-player-frame.png?v=4");
        ctx.drawImage(frameImg, blkX, blkY, blkW, blkH);
      } catch (err) {
        console.error("Player frame load error:", err);
      }

      // C) Dynamic Player Name (Metallic Bold Italic Chrome)
      const playerName = (player?.name || "PLAYER NAME").toUpperCase();
      const nameCX = blkX + 649 * scaleP; // ~426
      const nameCY = blkY + 76 * scaleP;  // ~604
      drawMetallicText({
        text: playerName,
        x: nameCX,
        y: nameCY,
        baseSize: 28,
        maxW: 290,
        align: "center",
        shear: -0.22,
        strokeWidth: 5,
      });

      // D) Dynamic Player ID (Registration Number) inside Gold Oval Pill
      const idVal = String(regNum || player?.registrationNumber || "1001");
      const idCX = blkX + 626 * scaleP; // ~414
      const idCY = blkY + 273 * scaleP; // ~712
      ctx.save();
      ctx.font = "900 24px 'Arial Black', Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Drop shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
      ctx.fillText(idVal, idCX + 2, idCY + 2);
      // Vibrant gold fill
      ctx.fillStyle = "#fde047";
      ctx.fillText(idVal, idCX, idCY);
      ctx.restore();

      // ─── 3. DYNAMIC WARD & ROLE BLOCK ──────────────────────────────────
      const wrX = 70;
      const wrY = 761;
      const wrW = 458;
      const wrH = 148;
      const scaleWR = wrW / 995; // 0.4603

      // A) Draw Ward & Role Frame overlay
      try {
        const wrFrameImg = await loadImg("/images/gpl-card-ward-role-frame.png?v=4");
        ctx.drawImage(wrFrameImg, wrX, wrY, wrW, wrH);
      } catch (err) {
        console.error("Ward/Role frame load error:", err);
      }

      // B) Dynamic Ward Value
      const wardText = (player?.ward || "WARD 51").toUpperCase();
      const wx = wrX + 219 * scaleWR; // ~171
      const wy = wrY + 84 * scaleWR;  // ~800
      drawMetallicText({
        text: wardText,
        x: wx,
        y: wy,
        baseSize: 32,
        maxW: 270,
        align: "left",
        shear: -0.22,
        strokeWidth: 5,
      });

      // C) Dynamic Role Value
      const roleText = (player?.speciality || player?.role || "ALL-ROUNDER").toUpperCase();
      const rx = wrX + 219 * scaleWR; // ~171
      const ry = wrY + 245 * scaleWR; // ~874
      drawMetallicText({
        text: roleText,
        x: rx,
        y: ry,
        baseSize: 28,
        maxW: 270,
        align: "left",
        shear: -0.22,
        strokeWidth: 5,
      });

      setRendered(true);
    };

    draw().catch(console.error);
  }, [player, regNum, photo]);

  const handleDownload = () => {
    setDownloading(true);
    const canvas = canvasRef.current;
    if (!canvas) {
      setDownloading(false);
      return;
    }

    try {
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      const safeName = (player?.name || "Player").replace(/[^a-zA-Z0-9]/g, "_");
      const safeId = String(regNum || "0001");
      link.download = `GPL4_PlayerCard_${safeId}_${safeName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const safeName = (player?.name || "Player").replace(/[^a-zA-Z0-9]/g, "_");
      const safeId = String(regNum || "0001");
      const filename = `GPL4_PlayerCard_${safeId}_${safeName}.png`;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], filename, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "GPL Season 4 Official Player Registration Card",
            text: `Check out my official Goregaon Premier League (Season 4) Player Card! Registration #${safeId}`,
          });
        } else {
          // Fallback to download
          handleDownload();
        }
      }, "image/png");
    } catch (err) {
      console.error("Share failed:", err);
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-[540px] my-auto bg-slate-950/95 border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-amber-500/20 text-center space-y-4">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Success header */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Registration Confirmed • Player Card Ready!</span>
        </div>
        <p className="text-xs text-slate-400">
          Download or share your official GPL Season 4 player card
        </p>

        {/* Card Canvas Container with realistic card aspect ratio */}
        <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-black">
          <canvas
            ref={canvasRef}
            className="w-full h-auto block"
            style={{ maxHeight: "72vh", objectFit: "contain" }}
          />
          {!rendered && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-amber-400 gap-2">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold tracking-wider">GENERATING OFFICIAL CARD...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleShare}
            disabled={!rendered}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm transition-all border border-slate-700 active:scale-95 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={!rendered || downloading}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/30 active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? "Saving..." : "Download Card"}</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 underline pt-1 block mx-auto transition-colors"
          >
            View Registration Details
          </button>
        )}
      </div>
    </div>
  );
}
