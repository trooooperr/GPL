"use client";

import { useState, useEffect } from "react";
import { Check, AlertCircle, UploadCloud, Loader2, CheckCircle2, Copy } from "lucide-react";
import QRCode from "qrcode";

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
    utrNumber: ""
  });

  const [files, setFiles] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    paymentProof: null
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [dynamicQrDataUrl, setDynamicQrDataUrl] = useState("");

  // Dynamic capacity & remaining slots calculation based on teams count (totalTeams * 14)
  const calcTotalTeams = stats?.totalTeams || (settings.maxCapacity ? Math.round(settings.maxCapacity / 14) : 10);
  const calcMaxCap = (settings.maxCapacity && Number(settings.maxCapacity) !== 168)
    ? Number(settings.maxCapacity)
    : (stats?.maxCapacity || (calcTotalTeams * 14));
  const calcRegistered = stats?.totalRegistered || 0;
  const calcRemaining = stats?.remainingSlots !== undefined ? stats.remainingSlots : Math.max(0, calcMaxCap - calcRegistered);

  const [remainingSlots, setRemainingSlots] = useState(calcRemaining);
  const [maxCapacity, setMaxCapacity] = useState(calcMaxCap);

  // Dynamic UPI ID & Fee from database settings
  const UPI_ID = settings.upiId || stats?.upiId || "shahbazkhandm@okhdfcbank";
  const REG_FEE = settings.registrationFee || stats?.registrationFee || 100;

  // Generate Dynamic UPI QR Code with pre-filled amount
  useEffect(() => {
    async function generateUPIQR() {
      try {
        const upiPaymentUri = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("Goregaon Premier League")}&am=${encodeURIComponent(REG_FEE)}&cu=INR&tn=${encodeURIComponent("GPL Player Registration")}`;
        const dataUrl = await QRCode.toDataURL(upiPaymentUri, {
          width: 320,
          margin: 1.5,
          color: {
            dark: "#081a36",
            light: "#ffffff"
          }
        });
        setDynamicQrDataUrl(dataUrl);
      } catch (err) {
        console.error("Failed to generate dynamic UPI QR code:", err);
      }
    }

    generateUPIQR();

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
  }, [UPI_ID, REG_FEE]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyReceipt = () => {
    if (!successData) return;
    const text = `GPL Registration Slip\nReg Number: #${successData.registrationNumber}\nName: ${successData.player?.name}\nPhone: ${successData.player?.phone}\nWard: ${successData.player?.ward}\nSpeciality: ${successData.player?.speciality}\nUTR: ${successData.player?.utrNumber}\nStatus: Verification Pending`;
    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    // 2. Email (optional format check)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
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

    // 9. UTR Number (minimum 4 chars)
    if (!formData.utrNumber.trim()) {
      errors.utrNumber = "Transaction UTR / Reference number is required.";
    } else if (formData.utrNumber.trim().length < 4) {
      errors.utrNumber = "Please enter a valid UPI transaction UTR / Reference number.";
    }

    // 10. Payment Proof
    if (!files.paymentProof) {
      errors.paymentProof = "Payment screenshot proof is required.";
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
        utrNumber: formData.utrNumber.trim(),
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

      setSuccessData(result);
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
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 text-center space-y-6 animate-scaleUp">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 shadow-inner">
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
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedReceipt ? "Copied Slip!" : "Copy Slip Details"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuccessData(null);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    dob: "",
                    tshirtSize: "—Please choose an option—",
                    trackSize: "—Please choose an option—",
                    speciality: "Right-hand batsman",
                    ward: "Ward 51",
                    utrNumber: ""
                  });
                  setFiles({ aadhaarFront: null, aadhaarBack: null, paymentProof: null });
                  setFieldErrors({});
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#059669] text-white rounded-lg font-bold text-xs hover:bg-[#047857] transition-colors"
              >
                Register Another Player
              </button>
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
                  Email <span className="text-slate-400 font-normal">(Optional)</span>
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleFieldChange("dob", e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white text-slate-900 text-sm focus:outline-none transition-all ${
                    fieldErrors.dob
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-slate-300 focus:ring-2 focus:ring-[#059669]"
                  }`}
                />
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

            {/* Line 6: Dynamic Payment QR Code Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6">
              
              {/* Left Column: Dynamic QR Code Container */}
              <div className="md:col-span-6 flex justify-center">
                <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-md border border-slate-200/90 text-center max-w-xs w-full space-y-3">
                  <div className="w-52 h-52 sm:w-56 sm:h-56 mx-auto bg-slate-50 rounded-xl overflow-hidden p-2 flex items-center justify-center border border-slate-100">
                    {dynamicQrDataUrl ? (
                      <img
                        src={dynamicQrDataUrl}
                        alt={`Scan & Pay ₹${REG_FEE} UPI QR Code`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-xs text-slate-400">Generating UPI QR...</div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs sm:text-[13px] font-mono font-bold text-slate-900 break-all">
                      UPI ID: {UPI_ID}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Payment Actions & Proof Upload */}
              <div className="md:col-span-6 space-y-4">
                
                <p className="text-sm font-semibold text-slate-800">
                  Scan and Pay <strong>₹{REG_FEE}</strong> Or Pay <strong>₹{REG_FEE}</strong> using UPI ID
                </p>

                {/* Yellow UPI ID Button */}
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="w-full bg-[#ffb703] hover:bg-[#fca311] text-slate-950 font-bold py-3 px-4 rounded-lg text-sm text-center shadow-sm transition-all active:scale-98 block cursor-pointer"
                >
                  {UPI_ID}
                </button>

                {/* Cyan Copy UPI Button */}
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="w-full bg-[#00b4d8] hover:bg-[#0096c7] text-white font-bold py-3 px-4 rounded-lg text-sm text-center shadow-sm transition-all active:scale-98 block cursor-pointer"
                >
                  {copiedUpi ? "✓ UPI ID Copied to Clipboard!" : "Copy UPI"}
                </button>

                {/* UTR Number Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transaction UTR / Reference No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="UPI Reference / UTR number"
                    value={formData.utrNumber}
                    onChange={(e) => handleFieldChange("utrNumber", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border bg-white font-mono text-slate-900 text-sm focus:outline-none transition-all ${
                      fieldErrors.utrNumber
                        ? "border-red-500 ring-2 ring-red-200"
                        : "border-slate-300 focus:ring-2 focus:ring-[#059669]"
                    }`}
                  />
                  {fieldErrors.utrNumber && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.utrNumber}</p>
                  )}
                </div>

                {/* Payment Screenshot Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upload Screenshot here after successful payment <span className="text-red-500">*</span>
                  </label>
                  <label className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-white hover:bg-slate-50/70 cursor-pointer transition-all ${
                    fieldErrors.paymentProof ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 hover:border-[#059669]"
                  }`}>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                      <UploadCloud className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Choose file</span>
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
                </div>

                {/* Direct Submit Register Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 bg-[#059669] hover:bg-[#047857] disabled:bg-slate-400 text-white font-bold py-3.5 px-6 rounded-lg text-base shadow-md transition-all active:scale-98 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <span>Register</span>
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
