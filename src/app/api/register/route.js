import { NextResponse } from "next/server";
import { rateLimiter, getClientIp } from "@/lib/rate-limit";
import { sendRegistrationNotificationEmail } from "@/lib/email";
import { connectToDatabase, MongoRegistration, MongoSetting } from "@/lib/mongodb";
import {
  sanitizeText, validatePhone, formatPhone, validateEmail,
  ALLOWED_TSHIRT_SIZES, ALLOWED_TRACK_SIZES, ALLOWED_SPECIALITIES
} from "@/lib/sanitize";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

async function fileToBase64(file) {
  if (!file) return null;
  if (typeof file === "string") {
    if (file.startsWith("data:image/") || file.startsWith("/images/")) return file;
    return null;
  }
  if (!file.name && !file.size) return null;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File "${file.name || 'upload'}" exceeds size limit.`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const mime = (file.type && file.type.startsWith("image/")) ? file.type : "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    const limitStatus = rateLimiter.check(`reg_${clientIp}`, 15, 300);
    if (!limitStatus.allowed) {
      return NextResponse.json({
        success: false,
        message: `Too many registration attempts. Please retry in ${limitStatus.resetInSeconds} seconds.`
      }, { status: 429 });
    }

    const formData = await request.formData();
    const name = sanitizeText(formData.get("name"), 100);
    const email = sanitizeText(formData.get("email"), 120);
    const phoneRaw = sanitizeText(formData.get("phone"), 20);
    const dob = sanitizeText(formData.get("dob"), 20);
    const ward = sanitizeText(formData.get("ward"), 50);
    const speciality = sanitizeText(formData.get("speciality"), 50);
    const tshirtSize = sanitizeText(formData.get("tshirtSize"), 10);
    const trackSize = sanitizeText(formData.get("trackSize"), 10);
    const utrNumber = sanitizeText(formData.get("utrNumber"), 50);

    if (!name || name.length < 2) {
      return NextResponse.json({ success: false, message: "Please enter your full name." }, { status: 400 });
    }
    if (!validatePhone(phoneRaw)) {
      return NextResponse.json({ success: false, message: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    }
    const phone = formatPhone(phoneRaw);
    if (email && !validateEmail(email)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 });
    }
    if (tshirtSize && tshirtSize !== "—Please choose an option—" && !ALLOWED_TSHIRT_SIZES.includes(tshirtSize)) {
      return NextResponse.json({ success: false, message: "Please select a valid T-shirt size." }, { status: 400 });
    }
    if (trackSize && trackSize !== "—Please choose an option—" && !ALLOWED_TRACK_SIZES.includes(trackSize)) {
      return NextResponse.json({ success: false, message: "Please select a valid Track Pant size." }, { status: 400 });
    }
    if (speciality && !ALLOWED_SPECIALITIES.includes(speciality)) {
      return NextResponse.json({ success: false, message: "Please select a valid cricket speciality." }, { status: 400 });
    }

    let age = 24;
    if (dob) {
      const bd = new Date(dob);
      if (!isNaN(bd.getTime())) {
        const calculatedAge = Math.floor((Date.now() - bd.getTime()) / (365.25 * 24 * 3600 * 1000));
        if (calculatedAge > 0 && calculatedAge < 100) {
          age = calculatedAge;
        }
      }
    }

    // Convert file uploads to clean data URIs
    let photoUrl = "/images/avatar-placeholder.svg";
    let aadhaarFrontUrl = "/images/doc-placeholder.svg";
    let aadhaarBackUrl = "/images/doc-placeholder.svg";
    let paymentProofUrl = "/images/payment-placeholder.svg";

    try {
      const p = await fileToBase64(formData.get("photo"));
      if (p) photoUrl = p;
      const af = await fileToBase64(formData.get("aadhaarFront"));
      if (af) aadhaarFrontUrl = af;
      const ab = await fileToBase64(formData.get("aadhaarBack"));
      if (ab) aadhaarBackUrl = ab;
      const pp = await fileToBase64(formData.get("paymentProof"));
      if (pp) paymentProofUrl = pp;
    } catch (fileErr) {
      return NextResponse.json({ success: false, message: fileErr.message }, { status: 400 });
    }

    // Connect to MongoDB
    await connectToDatabase();

    let settings = {};
    try {
      const settingsDoc = await MongoSetting.findOne({ key: "global_settings" }).lean();
      if (settingsDoc && settingsDoc.value) settings = settingsDoc.value;
    } catch (e) {
      console.warn("[Register API] Warning fetching settings:", e.message);
    }

    let regNumber = "1";
    try {
      const count = await MongoRegistration.countDocuments();
      regNumber = String(count + 1);
    } catch (e) {
      regNumber = String(Date.now()).slice(-4);
    }

    const id = `GPL-REG-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

    const newPlayer = {
      id,
      regNumber,
      name,
      email: email || `${phone}@gplcricket.local`,
      phone,
      dob: dob || "",
      age,
      ward: ward || "Ward 51",
      speciality: speciality || "Right-hand batsman",
      tshirtSize: tshirtSize || "Medium",
      trackSize: trackSize || "32",
      utrNumber: utrNumber || "PENDING",
      amount: settings.registrationFee || 100,
      paymentStatus: "Pending",
      photoUrl,
      aadhaarFrontUrl,
      aadhaarBackUrl,
      paymentProofUrl,
      teamId: null,
      notes: "",
      registeredAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: "REGISTERED",
          notes: "Player submitted registration"
        }
      ]
    };

    await MongoRegistration.create(newPlayer);

    // Send email notification in background
    sendRegistrationNotificationEmail(newPlayer).catch((err) =>
      console.error("[Email Notification Error]:", err.message)
    );

    return NextResponse.json({
      success: true,
      message: "Registration successful! Your application has been submitted for verification.",
      registrationNumber: regNumber,
      player: {
        id,
        name,
        phone,
        ward,
        tshirtSize,
        trackSize
      }
    });
  } catch (error) {
    console.error("[Registration Error]:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "An unexpected error occurred during registration. Please try again."
    }, { status: 400 });
  }
}
