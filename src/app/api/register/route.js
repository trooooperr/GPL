import { NextResponse } from "next/server";
import { rateLimiter, getClientIp } from "@/lib/rate-limit";
import { sendRegistrationNotificationEmail } from "@/lib/email";
import { connectToDatabase, MongoRegistration, MongoSetting, getNextPlayerId } from "@/lib/mongodb";
import { INITIAL_SETTINGS } from "@/lib/constants";
import {
  sanitizeText, validatePhone, formatPhone, validateEmail,
  ALLOWED_TSHIRT_SIZES, ALLOWED_TRACK_SIZES, ALLOWED_SPECIALITIES
} from "@/lib/sanitize";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    const limitStatus = rateLimiter.check(`reg_${clientIp}`, 60, 300);
    if (!limitStatus.allowed) {
      return NextResponse.json({
        success: false,
        message: "Too many registration attempts. Please wait a moment and try again."
      }, { status: 429, headers: NO_CACHE_HEADERS });
    }

    let bodyData = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      bodyData = await request.json();
    } else {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        bodyData[key] = value;
      }
    }

    const name = sanitizeText(bodyData.name, 100);
    const email = sanitizeText(bodyData.email, 120);
    const phoneRaw = sanitizeText(bodyData.phone, 20);
    const dob = sanitizeText(bodyData.dob, 20);
    const ward = sanitizeText(bodyData.ward, 50);
    const speciality = sanitizeText(bodyData.speciality, 50);
    const tshirtSize = sanitizeText(bodyData.tshirtSize, 20);
    const trackSize = sanitizeText(bodyData.trackSize, 20);
    const utrNumber = sanitizeText(bodyData.utrNumber, 50);

    if (!name || name.length < 2) {
      return NextResponse.json({ success: false, message: "Please enter your full name." }, { status: 400, headers: NO_CACHE_HEADERS });
    }
    if (!validatePhone(phoneRaw)) {
      return NextResponse.json({ success: false, message: "Please enter a valid 10-digit mobile number." }, { status: 400, headers: NO_CACHE_HEADERS });
    }
    const phone = formatPhone(phoneRaw);
    if (!email || !validateEmail(email)) {
      return NextResponse.json({ success: false, message: "Email address is required. Please enter a valid email address." }, { status: 400, headers: NO_CACHE_HEADERS });
    }
    if (tshirtSize && tshirtSize !== "—Please choose an option—" && !ALLOWED_TSHIRT_SIZES.includes(tshirtSize)) {
      return NextResponse.json({ success: false, message: "Please select a valid T-shirt size." }, { status: 400, headers: NO_CACHE_HEADERS });
    }
    if (trackSize && trackSize !== "—Please choose an option—" && !ALLOWED_TRACK_SIZES.includes(trackSize)) {
      return NextResponse.json({ success: false, message: "Please select a valid Track Pant size." }, { status: 400, headers: NO_CACHE_HEADERS });
    }
    if (speciality && !ALLOWED_SPECIALITIES.includes(speciality)) {
      return NextResponse.json({ success: false, message: "Please select a valid cricket speciality." }, { status: 400, headers: NO_CACHE_HEADERS });
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

    // Age must be greater than 11 (minimum 12 years old)
    if (age < 12) {
      return NextResponse.json(
        { success: false, message: "Players must be at least 12 years old to register for GPL." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Process image attachments safely
    async function extractImageUrl(val) {
      if (!val) return null;
      if (typeof val === "string") {
        if (val.startsWith("data:image/") || val.startsWith("/images/") || val.startsWith("http")) {
          return val;
        }
        return null;
      }
      if (typeof val === "object" && typeof val.arrayBuffer === "function") {
        try {
          const bytes = await val.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const mime = (val.type && val.type.startsWith("image/")) ? val.type : "image/jpeg";
          return `data:${mime};base64,${buffer.toString("base64")}`;
        } catch (e) {
          return null;
        }
      }
      return null;
    }

    const photoUrl = (await extractImageUrl(bodyData.photo)) || "/images/avatar-placeholder.svg";
    const aadhaarFrontUrl = (await extractImageUrl(bodyData.aadhaarFront)) || "/images/doc-placeholder.svg";
    const aadhaarBackUrl = (await extractImageUrl(bodyData.aadhaarBack)) || "/images/doc-placeholder.svg";
    const paymentProofUrl = (await extractImageUrl(bodyData.paymentProof)) || "/images/payment-placeholder.svg";

    // Connect to MongoDB — this MUST succeed for registration to work
    await connectToDatabase();

    let settings = INITIAL_SETTINGS;
    try {
      const settingsDoc = await MongoSetting.findOne({ key: "global_settings" }).lean();
      if (settingsDoc && settingsDoc.value) settings = { ...INITIAL_SETTINGS, ...settingsDoc.value };
    } catch (e) {
      console.warn("[Register] Settings fetch error:", e.message);
    }

    // 1. Check if tournament registration is closed by committee
    if (settings.registrationOpen === false) {
      return NextResponse.json({
        success: false,
        message: "Online player registrations for Goregaon Premier League are currently closed by the tournament committee."
      }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const cleanPhone = (phone || "").replace(/\D/g, "").slice(0, 10);

    // 2. Prevent duplicate active registrations for the same phone number
    const existingActivePlayer = await MongoRegistration.findOne({
      phone: cleanPhone,
      paymentStatus: { $in: ["Approved", "Pending"] }
    }).lean();

    if (existingActivePlayer) {
      return NextResponse.json({
        success: false,
        message: `A registration with mobile number ${cleanPhone} already exists (Status: ${existingActivePlayer.paymentStatus}, Player ID: #${existingActivePlayer.regNumber || existingActivePlayer.id}). Please contact the organizing committee for updates.`
      }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const newPlayerBase = {
      name,
      email: email || `${cleanPhone}@gplcricket.local`,
      phone: cleanPhone,
      dob: dob || "",
      age,
      ward: ward || "Ward 51",
      speciality: speciality || "Right-hand batsman",
      tshirtSize: (tshirtSize && tshirtSize !== "—Please choose an option—") ? tshirtSize : "Medium",
      trackSize: (trackSize && trackSize !== "—Please choose an option—") ? trackSize : "32",
      utrNumber: utrNumber || (bodyData.instagramHandle ? `@${bodyData.instagramHandle.replace(/^@/, "")}` : ""),
      instagramHandle: bodyData.instagramHandle ? bodyData.instagramHandle.replace(/^@/, "") : "",
      amount: settings.registrationFee !== undefined ? settings.registrationFee : 0,
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
          notes: "Player self-registered online"
        }
      ]
    };

    // 3. Ultra-Reliable Atomic MongoDB Counter ID Generation (Guarantees zero collisions)
    const id = await getNextPlayerId();
    const regNumber = id;

    const candidatePlayer = {
      ...newPlayerBase,
      id,
      regNumber
    };

    const newPlayer = await MongoRegistration.create(candidatePlayer);
    console.log("[Register] Player saved to MongoDB with Atomic ID:", id, name);

    // Send email notification to configured admin email (defaults to goregaonpremierleague11@gmail.com)
    sendRegistrationNotificationEmail(newPlayer, settings.adminEmail).catch((err) => {
      console.warn("[Register Email Notice]:", err.message);
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful! Your application has been submitted for verification.",
      registrationNumber: regNumber,
      player: {
        id,
        name,
        phone,
        ward: newPlayer.ward,
        tshirtSize: newPlayer.tshirtSize,
        trackSize: newPlayer.trackSize,
        speciality: newPlayer.speciality,
        utrNumber: newPlayer.utrNumber,
        registeredAt: newPlayer.registeredAt
      }
    }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error("[Registration Error]:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "An unexpected error occurred during registration. Please try again."
    }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
