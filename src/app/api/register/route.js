import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimiter, getClientIp } from "@/lib/rate-limit";
import { sendRegistrationNotificationEmail } from "@/lib/email";
import {
  sanitizeText,
  validatePhone,
  formatPhone,
  validateEmail,
  ALLOWED_TSHIRT_SIZES,
  ALLOWED_TRACK_SIZES,
  ALLOWED_SPECIALITIES,
  ALLOWED_WARDS
} from "@/lib/sanitize";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Allowed image types & max size 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function saveFileLocally(file, prefix = "file") {
  if (!file || typeof file === "string" || !file.name) {
    return null;
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File ${file.name} exceeds max size limit of 5MB`);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`File ${file.name} must be a valid image (JPEG, PNG, WEBP)`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
  const uniqueName = `${prefix}_${Date.now()}_${crypto.randomBytes(6).toString("hex")}${safeExt}`;
  const savePath = path.join(UPLOADS_DIR, uniqueName);

  await fs.promises.writeFile(savePath, buffer);
  return `/uploads/${uniqueName}`;
}

export async function POST(request) {
  try {
    // 1. Rate Limiting Check
    const clientIp = getClientIp(request);
    const limitStatus = rateLimiter.check(`reg_${clientIp}`, 10, 300);
    if (!limitStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many registration attempts. Please retry in ${limitStatus.resetInSeconds} seconds.`
        },
        { status: 429 }
      );
    }

    // 2. Parse FormData
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

    // 3. Validation
    if (!name || name.length < 3) {
      return NextResponse.json({ success: false, message: "Please enter your full name." }, { status: 400 });
    }

    if (!validatePhone(phoneRaw)) {
      return NextResponse.json({ success: false, message: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    }
    const phone = formatPhone(phoneRaw);

    if (email && !validateEmail(email)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 });
    }

    if (!ALLOWED_TSHIRT_SIZES.includes(tshirtSize)) {
      return NextResponse.json({ success: false, message: "Please select a valid T-shirt size." }, { status: 400 });
    }

    if (!ALLOWED_TRACK_SIZES.includes(trackSize)) {
      return NextResponse.json({ success: false, message: "Please select a valid Track Pant size." }, { status: 400 });
    }

    if (!ALLOWED_SPECIALITIES.includes(speciality)) {
      return NextResponse.json({ success: false, message: "Please select a valid cricket speciality." }, { status: 400 });
    }

    // Calculate age if DOB provided
    let age = null;
    if (dob) {
      const birthDate = new Date(dob);
      if (!isNaN(birthDate.getTime())) {
        const diffMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(diffMs);
        age = Math.abs(ageDate.getUTCFullYear() - 1970);
      }
    }

    // 4. Handle File Uploads
    const photoFile = formData.get("photo");
    const aadhaarFrontFile = formData.get("aadhaarFront");
    const aadhaarBackFile = formData.get("aadhaarBack");
    const paymentProofFile = formData.get("paymentProof");

    let photoUrl = "/images/avatar-placeholder.svg";
    let aadhaarFrontUrl = "/images/doc-placeholder.svg";
    let aadhaarBackUrl = "/images/doc-placeholder.svg";
    let paymentProofUrl = "/images/payment-placeholder.svg";

    try {
      const savedPhoto = await saveFileLocally(photoFile, "photo");
      if (savedPhoto) photoUrl = savedPhoto;

      const savedAadhaarF = await saveFileLocally(aadhaarFrontFile, "aadhaar_f");
      if (savedAadhaarF) aadhaarFrontUrl = savedAadhaarF;

      const savedAadhaarB = await saveFileLocally(aadhaarBackFile, "aadhaar_b");
      if (savedAadhaarB) aadhaarBackUrl = savedAadhaarB;

      const savedPayment = await saveFileLocally(paymentProofFile, "pay_proof");
      if (savedPayment) paymentProofUrl = savedPayment;
    } catch (fileErr) {
      return NextResponse.json({ success: false, message: fileErr.message }, { status: 400 });
    }

    const settings = db.getSettings();

    // 5. Store in Database
    const newPlayer = db.addRegistration({
      name,
      email: email || `${phone}@gplcricket.local`,
      phone,
      dob: dob || "",
      age: age || 24,
      ward: ward || "Ward 51",
      speciality,
      tshirtSize,
      trackSize,
      utrNumber: utrNumber || "PENDING",
      amount: settings.registrationFee || 100,
      photoUrl,
      aadhaarFrontUrl,
      aadhaarBackUrl,
      paymentProofUrl,
      notes: ward.includes("Ward 51") || ward.includes("Ward 54") ? "Ward verified" : "Check ward document"
    });

    // 6. Send instant email notification in the background
    sendRegistrationNotificationEmail(newPlayer).catch(err =>
      console.error("Background email send error:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Registration successful! Your application has been submitted for verification.",
      registrationId: newPlayer.id,
      player: {
        id: newPlayer.id,
        name: newPlayer.name,
        phone: newPlayer.phone,
        ward: newPlayer.ward,
        tshirtSize: newPlayer.tshirtSize,
        trackSize: newPlayer.trackSize
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "An unexpected error occurred during registration." },
      { status: 400 }
    );
  }
}
