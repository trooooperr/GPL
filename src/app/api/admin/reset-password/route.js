import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db.js";
import { rateLimiter, getClientIp } from "@/lib/rate-limit.js";

export const dynamic = "force-dynamic";

export async function POST(request) {
  await dbReady;
  try {
    const clientIp = getClientIp(request);
    const limitStatus = rateLimiter.check(`admin_reset_pw_${clientIp}`, 5, 900);
    if (!limitStatus.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many attempts. Please wait ${Math.ceil(limitStatus.resetInSeconds / 60)} minutes.` },
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

    const otpData = global.__gplOtpStore || {};

    if (!otpData.code) {
      return NextResponse.json(
        { success: false, error: "No active verification code found. Please request a new OTP." },
        { status: 400 }
      );
    }

    if (Date.now() > otpData.expiresAt) {
      global.__gplOtpStore = {};
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

    // OTP is valid! Update admin password
    db.updateSettings({ adminPassword: newPassword.trim() });
    global.__gplOtpStore = {};

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
