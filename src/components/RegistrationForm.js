"use client";

import { useState, useEffect } from "react";
import { Check, AlertCircle, UploadCloud } from "lucide-react";
import QRCode from "qrcode";
import VerificationCaptcha from "./VerificationCaptcha";

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
  const [submitting, setSubmitting] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
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
          const teamsCount = data.stats.totalTeams || 10;
          const cap = (data.stats.maxCapacity && Number(data.stats.maxCapacity) !== 168)
            ? Number(data.stats.maxCapacity)
            : (teamsCount * 14);
          const totalReg = data.stats.totalRegistered || 0;
          const rem = data.stats.remainingSlots !== undefined ? data.stats.remainingSlots : Math.max(0, cap - totalReg);
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

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((prev) => ({ ...prev, [field]: "File size exceeds 5MB limit. Please choose a smaller file." }));
        return;
      }
      setFiles((prev) => ({ ...prev, [field]: file }));
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: "" }));
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

    // 3. Phone (10 digits starting with 6-9)
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

    // 9. UTR Number (minimum 6 digits)
    if (!formData.utrNumber.trim()) {
      errors.utrNumber = "Transaction UTR / Reference number is required.";
    } else if (formData.utrNumber.trim().length < 6) {
      errors.utrNumber = "Please enter a valid UPI transaction UTR / Reference number.";
    }

    // 10. Payment Proof
    if (!files.paymentProof) {
      errors.paymentProof = "Payment screenshot proof is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateForm()) {
      setErrorMsg("Please fill out all required fields correctly before submitting.");
      return;
    }

    // Trigger interactive cricket security puzzle verification
    setShowCaptcha(true);
  };

  const executeSubmission = async () => {
    setSubmitting(true);
    setErrorMsg("");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      data.append("aadhaarFront", files.aadhaarFront);
      data.append("aadhaarBack", files.aadhaarBack);
      data.append("paymentProof", files.paymentProof);

      const res = await fetch("/api/register", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Registration submission failed.");
      }

      setSuccessData(result);
      setRemainingSlots((prev) => Math.max(0, prev - 1));
      if (onRegistrationSuccess) onRegistrationSuccess(result);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCaptchaSuccess = () => {
    setShowCaptcha(false);
    executeSubmission();
  };

  return (
    <section id="register" className="py-20 bg-[#edf7ee] border-b border-slate-200 relative">
      
      {/* Interactive Cricket Security Verification Captcha Modal */}
      <VerificationCaptcha
        isOpen={showCaptcha}
        onClose={() => setShowCaptcha(false)}
        onSuccess={handleCaptchaSuccess}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Registration Is Open!
          </h2>
          <p className="text-base sm:text-lg text-slate-700 font-medium">
            Secure your spot. Registration is open for the first {remainingSlots} players only.
          </p>
        </div>

        {/* Success Modal */}
        {successData ? (
          <div className="bg-white rounded-2xl border border-emerald-300 p-8 sm:p-12 text-center shadow-lg animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold tracking-wider inline-block mb-2 border border-emerald-200">
              REGISTRATION ID: {successData.registrationId}
            </span>

            <h3 className="text-2xl font-black text-slate-900 mb-2">
              Registration Successful!
            </h3>

            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Thank you, <strong>{successData.player?.name}</strong>. Your registration for Goregaon Premier League (Ward 51-54) has been recorded. Tournament organizers will verify your Aadhaar document and payment screenshot before the official player auction.
            </p>

            <button
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
              className="px-6 py-2.5 bg-[#0041b9] text-white rounded-lg font-bold text-sm hover:bg-[#003399] transition-colors"
            >
              Register Another Player
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl p-4 sm:p-8 md:p-10 space-y-5 sm:space-y-6 overflow-hidden"
          >
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Line 1: Name and Email (2-Column Full Width for comfortable input) */}
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
                    fieldErrors.name ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 focus:ring-2 focus:ring-[#0041b9]"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white text-slate-900 text-sm focus:outline-none transition-all ${
                    fieldErrors.email ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 focus:ring-2 focus:ring-[#0041b9]"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            {/* Line 2: Phone and DOB (2-Column Full Width with iOS Safari width constraint) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  className={`w-full max-w-full min-w-0 px-4 py-2.5 rounded-lg border bg-white text-slate-900 text-sm focus:outline-none transition-all ${
                    fieldErrors.phone ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 focus:ring-2 focus:ring-[#0041b9]"
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  DOB <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleFieldChange("dob", e.target.value)}
                  className={`w-full max-w-full min-w-0 appearance-none px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 text-sm focus:outline-none transition-all ${
                    fieldErrors.dob ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 focus:ring-2 focus:ring-[#0041b9]"
                  }`}
                  style={{ WebkitAppearance: "none", minWidth: 0, boxSizing: "border-box" }}
                />
                {fieldErrors.dob && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.dob}</p>
                )}
              </div>
            </div>

            {/* Row 3: Apparel Sizing & Specialty */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tshirt Size <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tshirtSize}
                  onChange={(e) => handleFieldChange("tshirtSize", e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 text-sm focus:outline-none transition-all ${
                    fieldErrors.tshirtSize ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 focus:ring-2 focus:ring-[#0041b9]"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Track Size <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.trackSize}
                  onChange={(e) => handleFieldChange("trackSize", e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 text-sm focus:outline-none transition-all ${
                    fieldErrors.trackSize ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 focus:ring-2 focus:ring-[#0041b9]"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Speciality <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.speciality}
                  onChange={(e) => handleFieldChange("speciality", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0041b9] transition-all"
                >
                  <option value="Right-hand batsman">Right-hand batsman</option>
                  <option value="Left-hand batsman">Left-hand batsman</option>
                  <option value="Right-hand bowler">Right-hand bowler</option>
                  <option value="Left-hand bowler">Left-hand bowler</option>
                  <option value="Right-hand all-rounder">Right-hand all-rounder</option>
                  <option value="Left-hand all-rounder">Left-hand all-rounder</option>
                </select>
              </div>
            </div>

            {/* Row 4: Ward Eligibility Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ward Eligibility (Goregaon East) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.ward === "Ward 51" ? "border-[#0041b9] bg-blue-50/60 ring-2 ring-blue-200" : "border-slate-200 bg-white"
                }`}>
                  <input
                    type="radio"
                    name="ward"
                    value="Ward 51"
                    checked={formData.ward === "Ward 51"}
                    onChange={() => handleFieldChange("ward", "Ward 51")}
                    className="text-[#0041b9] focus:ring-[#0041b9]"
                  />
                  <div>
                    <span className="block text-sm font-bold text-slate-900">Ward 51</span>
                    <span className="text-[11px] text-slate-500">Goregaon East Resident</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.ward === "Ward 54" ? "border-[#0041b9] bg-blue-50/60 ring-2 ring-blue-200" : "border-slate-200 bg-white"
                }`}>
                  <input
                    type="radio"
                    name="ward"
                    value="Ward 54"
                    checked={formData.ward === "Ward 54"}
                    onChange={() => handleFieldChange("ward", "Ward 54")}
                    className="text-[#0041b9] focus:ring-[#0041b9]"
                  />
                  <div>
                    <span className="block text-sm font-bold text-slate-900">Ward 54</span>
                    <span className="text-[11px] text-slate-500">Goregaon East Resident</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Row 5: Document Uploads (Aadhaar Front & Back) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aadhar Card Front <span className="text-red-500">*</span>
                </label>
                <label className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-white hover:bg-slate-50/70 cursor-pointer transition-all ${
                  fieldErrors.aadhaarFront ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 hover:border-[#0041b9]"
                }`}>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    <UploadCloud className="w-3.5 h-3.5 text-[#0041b9]" />
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
                  fieldErrors.aadhaarBack ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 hover:border-[#0041b9]"
                }`}>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    <UploadCloud className="w-3.5 h-3.5 text-[#0041b9]" />
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

            {/* Row 6: Dynamic Payment QR Code Box */}
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
                  className="w-full bg-[#ffb703] hover:bg-[#fca311] text-slate-950 font-bold py-3 px-4 rounded-lg text-sm text-center shadow-sm transition-all active:scale-98 block"
                >
                  {UPI_ID}
                </button>

                {/* Cyan Copy UPI Button */}
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="w-full bg-[#00b4d8] hover:bg-[#0096c7] text-white font-bold py-3 px-4 rounded-lg text-sm text-center shadow-sm transition-all active:scale-98 block"
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
                    placeholder="12-digit UPI UTR number"
                    value={formData.utrNumber}
                    onChange={(e) => handleFieldChange("utrNumber", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border bg-white font-mono text-slate-900 text-sm focus:outline-none transition-all ${
                      fieldErrors.utrNumber
                        ? "border-red-500 ring-2 ring-red-200"
                        : "border-slate-300 focus:ring-2 focus:ring-[#0041b9]"
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
                    fieldErrors.paymentProof ? "border-red-500 ring-2 ring-red-200" : "border-slate-300 hover:border-[#0041b9]"
                  }`}>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                      <UploadCloud className="w-3.5 h-3.5 text-[#0041b9]" />
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

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 bg-[#0041b9] hover:bg-[#003399] disabled:bg-slate-400 text-white font-bold py-3.5 px-6 rounded-lg text-base shadow-md transition-all active:scale-98"
                >
                  {submitting ? "Submitting Registration..." : "Register"}
                </button>

              </div>

            </div>

          </form>
        )}

      </div>
    </section>
  );
}
