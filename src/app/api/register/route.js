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

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function fileToBase64(file) {
  if (!file || typeof file === "string" || !file.name) return null;
  if (file.size > MAX_FILE_SIZE) throw new Error(`File ${file.name} exceeds 5MB limit`);
  if (!ALLOWED_MIME_TYPES.includes(file.type)) throw new Error(`File must be JPEG, PNG, or WEBP`);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    const limitStatus = rateLimiter.check(`reg_${clientIp}`, 10, 300);
    if (!limitStatus.allowed) {
      return NextResponse.json({ success: false, message: `Too many attempts. Retry in ${limitStatus.resetInSeconds}s.` }, { status: 429 });
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

    if (!name || name.length < 3) return NextResponse.json({ success: false, message: "Please enter your full name." }, { status: 400 });
    if (!validatePhone(phoneRaw)) return NextResponse.json({ success: false, message: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    const phone = formatPhone(phoneRaw);
    if (email && !validateEmail(email)) return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 });
    if (!ALLOWED_TSHIRT_SIZES.includes(tshirtSize)) return NextResponse.json({ success: false, message: "Please select a valid T-shirt size." }, { status: 400 });
    if (!ALLOWED_TRACK_SIZES.includes(trackSize)) return NextResponse.json({ success: false, message: "Please select a valid Track Pant size." }, { status: 400 });
    if (!ALLOWED_SPECIALITIES.includes(speciality)) return NextResponse.json({ success: false, message: "Please select a valid cricket speciality." }, { status: 400 });

    let age = null;
    if (dob) {
      const bd = new Date(dob);
      if (!isNaN(bd)) age = Math.floor((Date.now() - bd) / (365.25 * 24 * 3600 * 1000));
    }

    // Handle file uploads as base64 (works on Vercel)
    let photoUrl = "/images/avatar-placeholder.svg";
    let aadhaarFrontUrl = "/images/doc-placeholder.svg";
    let aadhaarBackUrl = "/images/doc-placeholder.svg";
    let paymentProofUrl = "/images/payment-placeholder.svg";

    try {
      const p = await fileToBase64(formData.get("photo")); if (p) photoUrl = p;
      const af = await fileToBase64(formData.get("aadhaarFront")); if (af) aadhaarFrontUrl = af;
      const ab = await fileToBase64(formData.get("aadhaarBack")); if (ab) aadhaarBackUrl = ab;
      const pp = await fileToBase64(formData.get("paymentProof")); if (pp) paymentProofUrl = pp;
    } catch (fileErr) {
      return NextResponse.json({ success: false, message: fileErr.message }, { status: 400 });
    }

    // Connect to MongoDB and get next reg number
    await connectToDatabase();
    const settingsDoc = await MongoSetting.findOne({ key: "global_settings" }).lean();
    const settings = settingsDoc?.value || {};

    const count = await MongoRegistration.countDocuments();
    const regNumber = String(count + 1);
    const id = `GPL-REG-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

    const newPlayer = {
      id, regNumber, name, email: email || `${phone}@gplcricket.local`,
      phone, dob: dob || "", age: age || 24,
      ward: ward || "Ward 51", speciality, tshirtSize, trackSize,
      utrNumber: utrNumber || "PENDING",
      amount: settings.registrationFee || 100,
      paymentStatus: "Pending",
      photoUrl, aadhaarFrontUrl, aadhaarBackUrl, paymentProofUrl,
      teamId: null,
      notes: "",
      registeredAt: new Date().toISOString(),
      history: [{ timestamp: new Date().toISOString(), action: "REGISTERED", notes: "Player self-registered" }]
    };

    await MongoRegistration.create(newPlayer);
    sendRegistrationNotificationEmail(newPlayer).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Registration successful! Your application has been submitted for verification.",
      registrationNumber: regNumber,
      player: { id, name, phone, ward, tshirtSize, trackSize }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, message: error.message || "Registration failed." }, { status: 400 });
  }
}
