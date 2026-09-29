import { NextResponse } from "next/server";
import crypto from "crypto";
import { db, dbReady } from "@/lib/db.js";
import { sendAdminPasswordResetOtp, getAdminContactEmail } from "@/lib/email.js";
import { rateLimiter, getClientIp } from "@/lib/rate-limit.js";

export const dynamic = "force-dynamic";

// In-memory OTP store (works on both local and Vercel serverless)
// On Vercel, each invocation shares the same module scope within a warm function
if (!global.__gplOtpStore) {
  global.__gplOtpStore = {};
}

export async function POST(request) {
  await dbReady;
  try {
    const clientIp = getClientIp(request);
    const limitStatus = rateLimiter.check(`admin_forgot_pw_${clientIp}`, 4, 600);
    if (!limitStatus.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many requests. Please wait ${Math.ceil(limitStatus.resetInSeconds / 60)} minutes before requesting another code.` },
        { status: 429 }
      );
    }

    const adminEmail = getAdminContactEmail();
    if (!adminEmail || !adminEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "No admin email configured in system settings." },
        { status: 400 }
      );
    }

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    global.__gplOtpStore = {
      code: otpCode,
      email: adminEmail,
      expiresAt,
      createdAt: new Date().toISOString()
    };

    await sendAdminPasswordResetOtp(otpCode, adminEmail);

    const [userPart, domain] = adminEmail.split("@");
    const maskedUser = userPart.length > 2
      ? `${userPart[0]}***${userPart[userPart.length - 1]}`
      : `${userPart[0]}***`;
    const maskedEmail = `${maskedUser}@${domain}`;

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${maskedEmail}`,
      maskedEmail
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process forgot password request." },
      { status: 500 }
    );
  }
}
