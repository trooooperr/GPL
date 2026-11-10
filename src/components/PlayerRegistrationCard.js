"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2, X, CheckCircle2 } from "lucide-react";

/**
 * drawPlayerCardToCanvas
 * High-resolution official GPL Season 4 Player Registration Card (935x1024):
 * - Stadium background with gold borders
 * - Dynamic Player Photo (uploaded photo or avatar silhouette)
 * - Dynamic Player Name in metallic chrome bold italic
 * - Dynamic Player ID inside golden oval pill
 * - Dynamic Ward and Role inside golden badge frame
 * - Dynamic Status Badge (Approved/Registered vs Pending)
 */
export async function drawPlayerCardToCanvas(canvas, { player, regNum, photo, status }) {
  if (!canvas) return;

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

    ctx.translate(x, y);
    ctx.transform(1, 0, shear, 1, 0, 0);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = "round";
    ctx.strokeText(text, 0, 0);

    const grad = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.55, "#e2e8f0");
    grad.addColorStop(1, "#b0bcc8");
    ctx.fillStyle = grad;
    ctx.fillText(text, 0, 0);

    ctx.restore();
  };

  try {
    const baseImg = await loadImg("/images/gpl-card-base.png?v=5");
    ctx.drawImage(baseImg, 0, 0, W, H);
  } catch (err) {
    console.error("Base image load error:", err);
  }

  const blkX = 70;
  const blkY = 562;
  const blkW = 505;
  const blkH = 185;
  const scaleP = blkW / 920;

  const px = blkX + 31 * scaleP;
  const py = blkY + 28 * scaleP;
  const pw = 270 * scaleP;
  const ph = 280 * scaleP;
  const pr = 26 * scaleP;

  roundRect(px, py, pw, ph, pr);
  ctx.fillStyle = "rgba(10, 14, 28, 0.96)";
  ctx.fill();

  let photoDrawn = false;
  const effectivePhoto = photo || player?.photoUrl;
  if (effectivePhoto && !effectivePhoto.includes("placeholder")) {
    try {
      const pImg = await loadImg(effectivePhoto);
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
    ctx.save();
    roundRect(px, py, pw, ph, pr);
    ctx.clip();
    ctx.fillStyle = "rgba(120, 136, 160, 0.85)";
    const cx = px + pw / 2;
    const cy = py + ph / 2;
    ctx.beginPath();
    ctx.arc(cx, cy - 24, 23, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 38, cy + 58);
    ctx.lineTo(cx + 38, cy + 58);
    ctx.lineTo(cx + 28, cy + 12);
    ctx.lineTo(cx - 28, cy + 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  try {
    const frameImg = await loadImg("/images/gpl-card-player-frame.png?v=4");
    ctx.drawImage(frameImg, blkX, blkY, blkW, blkH);
  } catch (err) {
    console.error("Player frame load error:", err);
  }

  const playerName = (player?.name || "PLAYER NAME").toUpperCase();
  const nameCX = blkX + 649 * scaleP;
  const nameCY = blkY + 76 * scaleP;
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

  const idVal = String(regNum || player?.displayId || player?.regNumber || player?.id || "1001");
  const idCX = blkX + 626 * scaleP;
  const idCY = blkY + 273 * scaleP;
  ctx.save();
  ctx.font = "900 24px 'Arial Black', Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
  ctx.fillText(idVal, idCX + 2, idCY + 2);
  ctx.fillStyle = "#fde047";
  ctx.fillText(idVal, idCX, idCY);
  ctx.restore();

  const wrX = 70;
  const wrY = 761;
  const wrW = 458;
  const wrH = 148;
  const scaleWR = wrW / 995;

  try {
    const wrFrameImg = await loadImg("/images/gpl-card-ward-role-frame.png?v=4");
    ctx.drawImage(wrFrameImg, wrX, wrY, wrW, wrH);
  } catch (err) {
    console.error("Ward/Role frame load error:", err);
  }

  const wardText = (player?.ward || "WARD 51").toUpperCase();
  const wx = wrX + 219 * scaleWR;
  const wy = wrY + 84 * scaleWR;
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

  const roleText = (player?.speciality || player?.role || "ALL-ROUNDER").toUpperCase();
  const rx = wrX + 219 * scaleWR;
  const ry = wrY + 245 * scaleWR;
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

  const rawStatus = String(status || player?.paymentStatus || player?.status || "").toLowerCase();
  const isApproved =
    rawStatus === "approved" ||
    rawStatus === "registered" ||
    player?.isApproved === true;

  const badgeSrc = isApproved
    ? "/images/gpl-badge-registered.png?v=4"
    : "/images/gpl-badge-pending.png?v=4";

  try {
    const badgeImg = await loadImg(badgeSrc);
    const bw = 220;
    const bh = Math.round(bw * (badgeImg.naturalHeight / badgeImg.naturalWidth));
    const bx = 822 - bw;
    const by = 104;
    ctx.drawImage(badgeImg, bx, by, bw, bh);
  } catch (err) {
    console.error("Status badge load error:", err);
  }
}

/**
 * renderPlayerCardToDataUrl
 * Renders the personalized player card offscreen and returns a high-res base64 PNG dataUrl
 */
export async function renderPlayerCardToDataUrl({ player, regNum, photo, status = "Approved" }) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  await drawPlayerCardToCanvas(canvas, {
    player,
    regNum: regNum || player?.displayId || player?.regNumber || player?.id,
    photo: photo || player?.photoUrl,
    status
  });
  return canvas.toDataURL("image/png", 0.95);
}

export default function PlayerRegistrationCard({ player, regNum, photo, status, onClose }) {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const rawStatus = String(status || player?.paymentStatus || player?.status || "").toLowerCase();
  const isApproved = rawStatus === "approved" || rawStatus === "registered" || player?.isApproved === true;

  useEffect(() => {
    let isMounted = true;
    if (canvasRef.current) {
      drawPlayerCardToCanvas(canvasRef.current, { player, regNum, photo, status })
        .then(() => {
          if (isMounted) setRendered(true);
        })
        .catch(console.error);
    }
    return () => {
      isMounted = false;
    };
  }, [player, regNum, photo, status]);

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

        {/* Status header */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
          isApproved
            ? "bg-emerald-950/70 border border-emerald-500/50 text-emerald-300"
            : "bg-amber-950/70 border border-amber-500/50 text-amber-300"
        } text-xs sm:text-sm font-semibold`}>
          <CheckCircle2 className={`w-4 h-4 ${isApproved ? "text-emerald-400" : "text-amber-400"}`} />
          <span>{isApproved ? "Official Player Card • Approved & Registered!" : "Registration Received • Status: Pending Verification"}</span>
        </div>
        <p className="text-xs text-slate-400">
          {isApproved
            ? "Official tournament card with verified registered status"
            : "Download or share your official pending registration card"}
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
