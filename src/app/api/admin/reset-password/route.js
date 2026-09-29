import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db.js";
import { rateLimiter, getClientIp } from "@/lib/rate-limit.js";

export const dynamic = "force-dynamic";

const OTP_FILE = path.join(process.cwd(), "data", "reset_otp.json");

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    // Limit: 5 attempts per 15 minutes
    const limitStatus = rateLimiter.check(`admin_reset_pw_${clientIp}`, 5, 900);
    if (!limitStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many attempts. Please wait ${Math.ceil(limitStatus.resetInSeconds / 60)} minutes.`
        },
        { status: 429 }
      );
    }

    const { otp, newPassword } = await request.json();

    if (!otp || typeof otp !== "string" || otp.trim().length !== 6) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 6-digit verification code." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (!fs.existsSync(OTP_FILE)) {
      return NextResponse.json(
        { success: false, error: "No active verification code found. Please request a new OTP." },
        { status: 400 }
      );
    }

    const otpData = JSON.parse(fs.readFileSync(OTP_FILE, "utf-8"));

    if (Date.now() > otpData.expiresAt) {
      try { fs.unlinkSync(OTP_FILE); } catch (e) {}
      return NextResponse.json(
        { success: false, error: "Verification code has expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    if (otpData.code.trim() !== otp.trim()) {
      return NextResponse.json(
        { success: false, error: "Incorrect verification code. Please check your email and try again." },
        { status: 400 }
      );
    }

    // OTP is valid! Update admin password in settings
    db.updateSettings({ adminPassword: newPassword.trim() });

    // Clean up OTP file
    try { fs.unlinkSync(OTP_FILE); } catch (e) {}

    return NextResponse.json({
      success: true,
      message: "Password updated successfully! You can now login with your new password."
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password." },
      { status: 500 }
    );
  }
}
