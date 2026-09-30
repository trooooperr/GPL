"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ShieldCheck, RefreshCw, X, CheckCircle2, ArrowRight } from "lucide-react";

export default function VerificationCaptcha({ isOpen, onClose, onSuccess }) {
  // Random target position between 45% and 82%
  const [targetX, setTargetX] = useState(65);
  const [sliderVal, setSliderVal] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("idle"); // 'idle' | 'success' | 'failed'
  const [errorMessage, setErrorMessage] = useState("");
  const trackRef = useRef(null);

  const generateNewChallenge = useCallback(() => {
    // Generate random target percentage between 40% and 80%
    const randomPos = Math.floor(Math.random() * 40) + 40;
    setTargetX(randomPos);
    setSliderVal(0);
    setStatus("idle");
    setErrorMessage("");
  }, []);

  useEffect(() => {
    if (isOpen) {
      generateNewChallenge();
    }
  }, [isOpen, generateNewChallenge]);

  const handleVerify = (val) => {
    // Check if sliderVal is within tolerance (±4% of target)
    const tolerance = 4.5;
    const diff = Math.abs(val - targetX);

    if (diff <= tolerance) {
      setStatus("success");
      setErrorMessage("");
      setTimeout(() => {
        onSuccess();
      }, 700);
    } else {
      setStatus("failed");
      setErrorMessage("Alignment missed! Please try again.");
      setTimeout(() => {
        setSliderVal(0);
        setStatus("idle");
      }, 900);
    }
  };

  const handlePointerDown = (e) => {
    if (status === "success") return;
    setIsDragging(true);
    updateSlider(e);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || status === "success") return;
    updateSlider(e);
  };

  const handlePointerUp = () => {
    if (!isDragging || status === "success") return;
    setIsDragging(false);
    handleVerify(sliderVal);
  };

  const updateSlider = (e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (offsetX / rect.width) * 100;
    setSliderVal(percentage);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative overflow-hidden select-none animate-scaleUp">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#059669] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-none">Security Verification</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Drag piece to complete registration</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={generateNewChallenge}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh Challenge"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Puzzle Visual Display Box */}
        <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden bg-gradient-to-br from-[#0c1a30] via-[#162744] to-[#24123a] border border-slate-800 shadow-inner flex items-center justify-center">
          
          {/* Ambient Stadium Lighting Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,183,3,0.15),transparent_70%)]" />
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-emerald-950/40 to-transparent" />

          {/* Pitch & Stumps Backdrop Graphic */}
          <div className="absolute bottom-4 inset-x-6 h-7 bg-amber-950/40 rounded-full border border-amber-500/20 blur-[1px]" />
          
          <div className="text-center z-10 pointer-events-none">
            <p className="text-[12px] font-bold tracking-wider text-amber-300 uppercase">
              Radhe Radhe Chashak
            </p>
            <p className="text-[10px] text-slate-300 font-medium mt-0.5">
              Move the cricket ball into the target wickets slot
            </p>
          </div>

          {/* Target Slot (Missing Piece Silhouette) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl border-2 border-dashed border-amber-400/80 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.3)] flex items-center justify-center transition-all"
            style={{ left: `${targetX}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className="w-7 h-7 rounded-full border border-dashed border-amber-300/60 flex items-center justify-center text-[10px] font-bold text-amber-300">
              🎯
            </div>
          </div>

          {/* Moving Puzzle Piece (Cricket Ball Icon) */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-gradient-to-tr from-[#991b1b] via-[#dc2626] to-[#f87171] border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-lg cursor-grab active:cursor-grabbing transition-transform ${
              status === "success" ? "ring-4 ring-emerald-400 scale-110" : ""
            }`}
            style={{
              left: `${sliderVal}%`,
              transform: "translate(-50%, -50%)",
              transition: isDragging ? "none" : "left 0.2s ease-out"
            }}
          >
            🏏
          </div>

          {/* Success Overlay Banner */}
          {status === "success" && (
            <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-fadeIn z-20">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce mb-1" />
              <span className="text-sm font-extrabold text-emerald-200">Verified Successfully!</span>
              <span className="text-[11px] text-emerald-300/80">Submitting registration...</span>
            </div>
          )}
        </div>

        {/* Error / Instruction Feedback */}
        <div className="h-6 flex items-center justify-center mt-2">
          {errorMessage ? (
            <span className="text-xs font-semibold text-red-600 animate-shake">{errorMessage}</span>
          ) : (
            <span className="text-[11px] text-slate-500 font-medium">
              Slide the button below to align the pieces
            </span>
          )}
        </div>

        {/* Interactive Slider Track */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative w-full h-12 rounded-xl bg-slate-100 border transition-all cursor-pointer touch-none flex items-center overflow-hidden ${
            status === "success"
              ? "border-emerald-400 bg-emerald-50"
              : status === "failed"
              ? "border-red-300 bg-red-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          {/* Filled Progress Bar */}
          <div
            className={`h-full transition-colors ${
              status === "success"
                ? "bg-emerald-400/30"
                : status === "failed"
                ? "bg-red-400/20"
                : "bg-blue-500/20"
            }`}
            style={{ width: `${sliderVal}%` }}
          />

          {/* Center Hint Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-bold text-slate-400 tracking-wider">
            {status === "success" ? (
              <span className="text-emerald-700 font-extrabold">VERIFIED ✓</span>
            ) : (
              <span className="flex items-center gap-1.5">
                SLIDE TO VERIFY <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </span>
            )}
          </div>

          {/* Draggable Slider Thumb Button */}
          <div
            className={`absolute top-1 bottom-1 w-11 rounded-lg flex items-center justify-center text-white shadow-md transition-transform ${
              status === "success"
                ? "bg-emerald-600 ring-2 ring-emerald-300"
                : status === "failed"
                ? "bg-red-600"
                : "bg-[#059669] hover:bg-[#047857]"
            }`}
            style={{
              left: `calc(${sliderVal}% - ${sliderVal * 0.44}px)`,
              transition: isDragging ? "none" : "left 0.2s ease-out"
            }}
          >
            {status === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
