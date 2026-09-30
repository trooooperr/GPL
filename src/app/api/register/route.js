import { NextResponse } from "next/server";
import { rateLimiter, getClientIp } from "@/lib/rate-limit";
import { sendRegistrationNotificationEmail } from "@/lib/email";
import { connectToDatabase, MongoRegistration, MongoSetting } from "@/lib/mongodb";
import { db, INITIAL_SETTINGS } from "@/lib/db";
import {
  sanitizeText, validatePhone, formatPhone, validateEmail,
  ALLOWED_TSHIRT_SIZES, ALLOWED_TRACK_SIZES, ALLOWED_SPECIALITIES
} from "@/lib/sanitize";
import mongoose from "mongoose";
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
    if (email && !validateEmail(email)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400, headers: NO_CACHE_HEADERS });
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

    // Fast connection check with 3s timeout
    const conn = await connectToDatabase();
    const isMongoReady = conn && mongoose.connection.readyState === 1;

    let settings = INITIAL_SETTINGS;
    if (isMongoReady) {
      try {
        const settingsDoc = await MongoSetting.findOne({ key: "global_settings" }).lean().catch(() => null);
        if (settingsDoc && settingsDoc.value) settings = { ...INITIAL_SETTINGS, ...settingsDoc.value };
      } catch (e) {}
    } else if (db) {
      settings = db.getSettings();
    }

    let regNumber = "1";
    try {
      if (isMongoReady) {
        const count = await MongoRegistration.countDocuments().catch(() => 0);
        regNumber = String(count + 1);
      } else if (db) {
        regNumber = String(db.getAllRegistrations().length + 1);
      }
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
      tshirtSize: (tshirtSize && tshirtSize !== "—Please choose an option—") ? tshirtSize : "Medium",
      trackSize: (trackSize && trackSize !== "—Please choose an option—") ? trackSize : "32",
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
          notes: "Player self-registered online"
        }
      ]
    };

    // Save to Mongo if ready, and always save to memory DB
    if (isMongoReady) {
      await MongoRegistration.create(newPlayer).catch((err) => {
        console.warn("[MongoRegistration.create fallback]:", err.message);
      });
    }
    if (db) {
      try { db.addRegistration(newPlayer); } catch (e) {}
    }

    // Send email notification non-blocking with 2s timeout
    Promise.race([
      sendRegistrationNotificationEmail(newPlayer),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Email timeout")), 2000))
    ]).catch((err) => {
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
    }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}
