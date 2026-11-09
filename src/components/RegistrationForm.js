"use client";

import { useState, useEffect } from "react";
import { Check, AlertCircle, UploadCloud, Loader2, CheckCircle2, Copy, Trophy } from "lucide-react";
import QRCode from "qrcode";
import PlayerRegistrationCard from "./PlayerRegistrationCard";

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export default function RegistrationForm({ stats, settings = {}, onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    tshirtSize: "—Please choose an option—",
    trackSize: "—Please choose an option—",
    speciality: "Right-hand batsman",
    ward: "Ward 51",
    instagramHandle: "",
    utrNumber: ""
  });

  const [files, setFiles] = useState({
    profilePhoto: null,
    aadhaarFront: null,
    aadhaarBack: null,
    paymentProof: null
  });
  const [photoPreview, setPhotoPreview] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [showPlayerCard, setShowPlayerCard] = useState(false);
  const [savedPlayerPhoto, setSavedPlayerPhoto] = useState("");
  const [dynamicQrDataUrl, setDynamicQrDataUrl] = useState("");

  // Dynamic capacity & remaining slots calculation based on teams count (totalTeams * 14)
  const calcTotalTeams = stats?.totalTeams || 11;
  const calcMaxCap = calcTotalTeams * 14;
  const calcApproved = stats?.approved !== undefined ? stats.approved : (stats?.totalRegistered || 0);
  const calcRemaining = Math.max(0, calcMaxCap - calcApproved);

  const [remainingSlots, setRemainingSlots] = useState(calcRemaining);
  const [maxCapacity, setMaxCapacity] = useState(calcMaxCap);

  // Dynamic Instagram Handle from database settings
  const IG_HANDLE = (settings.instagramUsername || stats?.instagramUsername || "mi_sandeep_jadhav").replace(/^@/, "");
  const IG_URL = `https://instagram.com/${IG_HANDLE}`;

  // Generate Dynamic Instagram Profile QR Code
  useEffect(() => {
    async function generateInstagramQR() {
      try {
        const dataUrl = await QRCode.toDataURL(IG_URL, {
          width: 320,
          margin: 1.5,
          color: {
            dark: "#081a36",
            light: "#ffffff"
          }
        });
        setDynamicQrDataUrl(dataUrl);
      } catch (err) {
        console.error("Failed to generate dynamic Instagram QR code:", err);
      }
    }

    generateInstagramQR();

    async function fetchFreshStats() {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.success && data.stats) {
          const cap = data.stats.maxCapacity || 140;
          const rem = data.stats.remainingSlots !== undefined ? data.stats.remainingSlots : Math.max(0, cap - (data.stats.approved || 0));
          setMaxCapacity(cap);
          setRemainingSlots(rem);
        }
      } catch (e) {}
    }
    fetchFreshStats();
  }, [IG_URL]);

  const handleCopyReceipt = () => {
    if (!successData) return;
    const text = `GPL Registration Slip\nReg Number: #${successData.registrationNumber}\nName: ${successData.player?.name}\nPhone: ${successData.player?.phone}\nWard: ${successData.player?.ward}\nSpeciality: ${successData.player?.speciality}\nUTR: ${successData.player?.utrNumber}\nStatus: Verification Pending`;
    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  const handleFieldChange = (field, value) => {
    let cleanVal = value;
    if (field === "phone") {
      cleanVal = value.replace(/\D/g, "").slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [field]: cleanVal }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Robust client-side canvas compression: converts any phone/desktop image to lightweight ~40KB JPEG
  const compressImageToDataUrl = (file, maxWidth = 800, quality = 0.65) => {
    return new Promise((resolve) => {
      if (!file) return resolve({ name: "", dataUrl: "" });
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve({ name: file.name, dataUrl });
        };
        img.onerror = () => {
          const rawUrl = e.target.result || "";
          // If raw url is under 500KB use it, otherwise empty
          resolve({ name: file.name, dataUrl: rawUrl.length < 500000 ? rawUrl : "" });
        };
        img.src = e.target.result;
      };
      reader.onerror = () => resolve({ name: file.name, dataUrl: "" });
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (field, e) => {
    const rawFile = e.target.files?.[0];
    if (rawFile) {
      try {
        const fileObj = await compressImageToDataUrl(rawFile);
        setFiles((prev) => ({ ...prev, [field]: fileObj }));
        if (field === "profilePhoto") {
          setPhotoPreview(fileObj.dataUrl);
        }
        if (fieldErrors[field]) {
          setFieldErrors((prev) => ({ ...prev, [field]: "" }));
        }
      } catch (err) {
        setFiles((prev) => ({ ...prev, [field]: { name: rawFile.name, dataUrl: "" } }));
      }
    }
  };

  // Comprehensive Form Validation
  const validateForm = () => {
    const errors = {};

    // 1. Name
    if (!formData.name.trim()) {
      errors.name = "Full name is required.";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Full name must be at least 3 characters.";
    }

    // 2. Email (Compulsory)
    const cleanEmail = formData.email.trim();
    if (!cleanEmail) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    // 3. Phone (10 digits)
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!cleanPhone) {
      errors.phone = "Mobile phone number is required.";
    } else if (cleanPhone.length !== 10) {
      errors.phone = "Phone number must be exactly 10 digits.";
    }

    // 4. DOB
    if (!formData.dob) {
      errors.dob = "Date of Birth is required.";
    } else {
      const bd = new Date(formData.dob);
      if (isNaN(bd.getTime())) {
        errors.dob = "Please enter a valid date of birth.";
      } else {
        const calculatedAge = Math.floor((Date.now() - bd.getTime()) / (365.25 * 24 * 3600 * 1000));
        if (calculatedAge < 12) {
          errors.dob = "Players must be at least 12 years old to register.";
        }
      }
    }

    // 5. T-shirt Size
    if (!formData.tshirtSize || formData.tshirtSize === "—Please choose an option—") {
      errors.tshirtSize = "Please select your T-shirt size.";
    }

    // 6. Track Size
    if (!formData.trackSize || formData.trackSize === "—Please choose an option—") {
      errors.trackSize = "Please select your Track Pant size.";
    }

    // 7. Aadhaar Front
    if (!files.aadhaarFront) {
      errors.aadhaarFront = "Aadhaar Card Front photo is required.";
    }

    // 8. Aadhaar Back
    if (!files.aadhaarBack) {
      errors.aadhaarBack = "Aadhaar Card Back photo is required.";
    }

    // 9. Instagram Follow Proof Screenshot
    if (!files.paymentProof) {
      errors.paymentProof = "Instagram follow screenshot proof is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateForm()) {
      setErrorMsg("Please fill out all required fields correctly before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        dob: formData.dob,
        ward: formData.ward,
        speciality: formData.speciality,
        tshirtSize: formData.tshirtSize,
        trackSize: formData.trackSize,
        utrNumber: formData.instagramHandle ? `@${formData.instagramHandle.trim().replace(/^@/, "")}` : "",
        instagramHandle: formData.instagramHandle ? formData.instagramHandle.trim().replace(/^@/, "") : "",
        photo: files.profilePhoto?.dataUrl || "",
        aadhaarFront: files.aadhaarFront?.dataUrl || files.aadhaarFront || "",
        aadhaarBack: files.aadhaarBack?.dataUrl || files.aadhaarBack || "",
        paymentProof: files.paymentProof?.dataUrl || files.paymentProof || "",
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let result;
      const responseText = await res.text();
      try {
        result = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error("Server error (" + res.status + "). Please try again in a moment.");
      }

      if (!res.ok || !result.success) {
        throw new Error(result.message || result.error || "Registration submission failed. Please try again.");
      }

      const submittedPhoto = files.profilePhoto?.dataUrl || photoPreview || result.player?.photo || "";
      setSavedPlayerPhoto(submittedPhoto);
      setSuccessData(result);
      setShowPlayerCard(true);
      setRemainingSlots((prev) => Math.max(0, prev - 1));
      if (onRegistrationSuccess) onRegistrationSuccess(result);
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="register" className="py-20 bg-[#edf7ee] border-b border-slate-200 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Registration Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          <p className="text-sm sm:text-base font-bold text-[#059669] tracking-wider uppercase">
            Official Registration Portal
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#081a36] tracking-tight">
            Register for GPL
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Radhe Radhe Chashak • Organised by Mohsin Patel &amp; Balram Gupta (Ballu)
          </p>

          {/* Remaining Slots Counter Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Available Player Slots:</span>
            <strong className="text-[#059669] font-mono text-base font-extrabold">
              {remainingSlots} / {maxCapacity}
            </strong>
          </div>
        </div>

        {/* Success View */}
        {successData ? (
          <>
            {/* High-Resolution Auction Pool Player Card Modal */}
            {showPlayerCard && (
              <PlayerRegistrationCard
                player={successData.player}
                regNum={successData.registrationNumber}
                photo={savedPlayerPhoto || successData.player?.photo}
                status={successData.player?.paymentStatus || "Pending"}
                onClose={() => setShowPlayerCard(false)}
              />
            )}

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 text-center space-y-6 animate-scaleUp relative overflow-hidden">
              {/* Confetti Explosion Particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className="confetti-particle rounded-sm"
                    style={{
                      left: `${(i * 4.2) % 100}%`,
                      width: `${6 + (i % 5) * 2}px`,
                      height: `${10 + (i % 4) * 3}px`,
                      backgroundColor: [
                        "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#eab308"
                      ][i % 6],
                      animationDelay: `${(i * 0.12).toFixed(2)}s`,
                      animationDuration: `${2.5 + (i % 3) * 0.5}s`,
                      transform: `rotate(${i * 35}deg)`,
                    }}
                  />
                ))}
              </div>

              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 shadow-inner relative z-10">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>

              <div className="space-y-2">
                <div className="inline-block px-3 py-1 bg-emerald-100 text-[#059669] rounded-full text-xs font-bold font-mono">
                  Registration #{successData.registrationNumber}
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#081a36]">
                  Application Submitted Successfully!
                </h3>
                <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
                  Thank you, <strong>{successData.player?.name}</strong>! Your registration has been received and submitted for administrative document verification.
                </p>
              </div>

              {/* Prominent Card CTA Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border-2 border-amber-400/40 text-center space-y-2.5 max-w-md mx-auto">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  <Trophy className="w-3 h-3" />
                  <span>Season 4 Player Card Ready</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  Your customized GPL Season 4 Auction Pool card has been created with your photo and details.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPlayerCard(true)}
                  className="w-full py-2.5 px-4 rounded-xl font-black text-xs text-slate-950 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)" }}
                >
                  <Trophy className="w-4 h-4 text-slate-950" />
                  <span>View &amp; Download Official Player Card</span>
                </button>
              </div>

              {/* Registration Summary Card */}
              <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 text-left text-xs sm:text-sm space-y-2.5 font-medium">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-900">{successData.player?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Mobile Phone:</span>
                  <span className="font-mono text-slate-800">{successData.player?.phone}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Ward:</span>
                  <span className="font-semibold text-slate-800">{successData.player?.ward}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Speciality:</span>
                  <span className="font-semibold text-slate-800">{successData.player?.speciality}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Kit Sizes:</span>
                  <span className="font-semibold text-slate-800">
                    T-Shirt: {successData.player?.tshirtSize} • Track: {successData.player?.trackSize}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-bold">
                    Pending Verification
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyReceipt}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedReceipt ? "Copied Slip!" : "Copy Slip Details"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSuccessData(null);
                    setShowPlayerCard(false);
                    setSavedPlayerPhoto("");
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      dob: "",
                      tshirtSize: "—Please choose an option—",
                      trackSize: "—Please choose an option—",
                      speciality: "Right-hand batsman",
                      ward: "Ward 51",
                      instagramHandle: "",
                      utrNumber: ""
                    });
                    setFiles({ profilePhoto: null, aadhaarFront: null, aadhaarBack: null, paymentProof: null });
                    setPhotoPreview("");
                    setFieldErrors({});
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#059669] text-white rounded-lg font-bold text-xs hover:bg-[#047857] transition-colors cursor-pointer"
                >
                  Register Another Player
                </button>
              </div>
            </div>
          </>
        ) : settings.registrationOpen === false ? (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#081a36]">
              Registrations Are Currently Closed
            </h3>
            <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto">
              Online player registrations for Goregaon Premier League are currently closed by the organizing committee. Please contact the tournament coordinators for inquiries.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
              <span>Ward 51 &amp; 54 • Mohsin Patel &amp; Balram Gupta (Ballu)</span>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl p-4 sm:p-8 md:p-10 space-y-5 sm:space-y-6 overflow-hidden"
          >
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="font-semibold">{errorMsg}</p>
              </div>
            )}

            {/* Line 1: Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white text-slate-900 text-sm focus:outline-none transition-all ${
                    fieldErrors.name
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-slate-300 focus:ring-2 focus:ring-[#059669]"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white text-slate-900 text-sm focus:outline-none transition-all ${
                    fieldErrors.email
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-slate-300 focus:ring-2 focus:ring-[#059669]"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            {/* Line 2: Phone, DOB, Ward */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white text-slate-900 text-sm focus:outline-none transition-all font-mono ${
                    fieldErrors.phone
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-slate-300 focus:ring-2 focus:ring-[#059669]"
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              <div className="min-w-0 overflow-hidden">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="w-full overflow-hidden">
                  <input
                    type="date"
                    value={formData.dob}
                    max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 12); return d.toISOString().split("T")[0]; })()}
                    onChange={(e) => handleFieldChange("dob", e.target.value)}
                    style={{ WebkitAppearance: "none", width: "100%", boxSizing: "border-box" }}
                    className={`w-full block px-4 py-2.5 rounded-lg border bg-white text-slate-900 text-sm focus:outline-none transition-all ${
                      fieldErrors.dob
                        ? "border-red-500 ring-2 ring-red-200"
                        : "border-slate-300 focus:ring-2 focus:ring-[#059669]"
                    }`}
                  />
                </div>
                {fieldErrors.dob && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.dob}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ward <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.ward}
                  onChange={(e) => handleFieldChange("ward", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-[#059669] focus:outline-none transition-all"
                >
                  <option value="Ward 51">Ward 51</option>
                  <option value="Ward 54">Ward 54</option>
                  <option value="Other Ward (Review Required)">Other Ward (Review Required)</option>
                </select>
              </div>
            </div>

            {/* Line 3: Speciality */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Speciality / Playing Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.speciality}
                onChange={(e) => handleFieldChange("speciality", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-[#059669] focus:outline-none transition-all"
              >
                <option value="Right-hand batsman">Right-hand batsman</option>
                <option value="Left-hand batsman">Left-hand batsman</option>
                <option value="Right-hand bowler">Right-hand bowler</option>
                <option value="Left-hand bowler">Left-hand bowler</option>
                <option value="Right-hand all-rounder">Right-hand all-rounder</option>
                <option value="Left-hand all-rounder">Left-hand all-rounder</option>
                <option value="Wicketkeeper Batsman">Wicketkeeper Batsman</option>
              </select>
            </div>

            {/* Line 4: T-shirt Size & Track Pant Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  T-shirt Size <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tshirtSize}
                  onChange={(e) => handleFieldChange("tshirtSize", e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 text-sm focus:outline-none transition-all ${
                    fieldErrors.tshirtSize ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 focus:ring-2 focus:ring-[#059669]"
                  }`}
                >
                  <option disabled>—Please choose an option—</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="X-large">X-large</option>
                  <option value="XX-Large">XX-Large</option>
                </select>
                {fieldErrors.tshirtSize && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.tshirtSize}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Track Pant Size <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.trackSize}
                  onChange={(e) => handleFieldChange("trackSize", e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 text-sm focus:outline-none transition-all ${
                    fieldErrors.trackSize ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 focus:ring-2 focus:ring-[#059669]"
                  }`}
                >
                  <option disabled>—Please choose an option—</option>
                  <option value="30">30</option>
                  <option value="32">32</option>
                  <option value="34">34</option>
                  <option value="36">36</option>
                  <option value="38">38</option>
                </select>
                {fieldErrors.trackSize && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.trackSize}</p>
                )}
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              {/* Circle preview */}
              <div className="shrink-0 relative">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 bg-white overflow-hidden flex items-center justify-center shadow-sm">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <UploadCloud className="w-6 h-6 mb-1" />
                      <span className="text-[9px] font-semibold">PHOTO</span>
                    </div>
                  )}
                </div>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => { setPhotoPreview(""); setFiles(p => ({ ...p, profilePhoto: null })); }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold hover:bg-red-600 transition-colors"
                    title="Remove photo"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Profile Photo <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">A clear face photo. Max 5 MB. JPG, PNG or WEBP.</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 cursor-pointer transition-all hover:border-[#059669] text-xs font-semibold text-slate-700">
                  <UploadCloud className="w-3.5 h-3.5 text-[#059669]" />
                  {files.profilePhoto ? files.profilePhoto.name : "Choose Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("profilePhoto", e)}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* Line 5: Aadhaar Front & Aadhaar Back */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aadhar Card Front <span className="text-red-500">*</span>
                </label>
                <label className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-white hover:bg-slate-50/70 cursor-pointer transition-all ${
                  fieldErrors.aadhaarFront ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 hover:border-[#059669]"
                }`}>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    <UploadCloud className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Choose file</span>
                  </div>
                  <span className="text-xs text-slate-500 truncate flex-1">
                    {files.aadhaarFront ? files.aadhaarFront.name : "No file chosen"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("aadhaarFront", e)}
                    className="sr-only"
                  />
                </label>
                {fieldErrors.aadhaarFront && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.aadhaarFront}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aadhar Card Back <span className="text-red-500">*</span>
                </label>
                <label className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-white hover:bg-slate-50/70 cursor-pointer transition-all ${
                  fieldErrors.aadhaarBack ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 hover:border-[#059669]"
                }`}>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    <UploadCloud className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Choose file</span>
                  </div>
                  <span className="text-xs text-slate-500 truncate flex-1">
                    {files.aadhaarBack ? files.aadhaarBack.name : "No file chosen"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("aadhaarBack", e)}
                    className="sr-only"
                  />
                </label>
                {fieldErrors.aadhaarBack && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.aadhaarBack}</p>
                )}
              </div>
            </div>

            {/* Line 6: Dynamic Instagram Follow QR Code Box (Free Registration) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6 border-t border-slate-200/80">
              
              {/* Left Column: Dynamic Instagram QR Code Container */}
              <div className="md:col-span-6 flex justify-center">
                <div className="bg-gradient-to-b from-white via-pink-50/20 to-purple-50/30 rounded-2xl p-6 sm:p-7 shadow-md border border-slate-200/90 text-center max-w-xs w-full space-y-3.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[11px] font-bold shadow-xs">
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>Follow Official Page</span>
                  </div>

                  <div className="w-52 h-52 sm:w-56 sm:h-56 mx-auto bg-white rounded-xl overflow-hidden p-2.5 flex items-center justify-center border-2 border-pink-200/60 shadow-inner">
                    {dynamicQrDataUrl ? (
                      <img
                        src={dynamicQrDataUrl}
                        alt={`Scan to Follow @${IG_HANDLE} on Instagram`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-xs text-slate-400">Generating Instagram QR...</div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
                      @{IG_HANDLE}
                    </p>
                    <a
                      href={IG_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-pink-600 hover:text-pink-700 underline block"
                    >
                      instagram.com/{IG_HANDLE} ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Follow Action & Proof Upload */}
              <div className="md:col-span-6 space-y-4">
                
                {/* Open Instagram Follow Button */}
                <a
                  href={IG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-bold py-3.5 px-4 rounded-xl text-sm text-center shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <InstagramIcon className="w-4 h-4" />
                  <span>Follow ↗</span>
                </a>

                {/* Follow Screenshot Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upload Screenshot Proving You Follow Us <span className="text-red-500">*</span>
                  </label>
                  <label className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border bg-white hover:bg-slate-50/70 cursor-pointer transition-all ${
                    fieldErrors.paymentProof ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 hover:border-[#059669]"
                  }`}>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                      <UploadCloud className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Choose screenshot</span>
                    </div>
                    <span className="text-xs text-slate-500 truncate flex-1">
                      {files.paymentProof ? files.paymentProof.name : "No file chosen"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange("paymentProof", e)}
                      className="sr-only"
                    />
                  </label>
                  {fieldErrors.paymentProof && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.paymentProof}</p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">
                    Upload a screenshot showing the &quot;Following&quot; button on @{IG_HANDLE}.
                  </p>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 bg-[#059669] hover:bg-[#047857] disabled:bg-slate-400 text-white font-bold py-3.5 px-6 rounded-xl text-base shadow-md transition-all active:scale-98 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <span>Complete Registration</span>
                  )}
                </button>

              </div>

            </div>

          </form>
        )}

      </div>
    </section>
  );
}
