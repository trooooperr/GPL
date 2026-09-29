import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { db } from "@/lib/db.js";
import { sendAdminPasswordResetOtp, getAdminContactEmail } from "@/lib/email.js";
import { rateLimiter, getClientIp } from "@/lib/rate-limit.js";

export const dynamic = "force-dynamic";

const OTP_FILE = path.join(process.cwd(), "data", "reset_otp.json");

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    // Limit: 4 attempts per 10 minutes
    const limitStatus = rateLimiter.check(`admin_forgot_pw_${clientIp}`, 4, 600);
    if (!limitStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many requests. Please wait ${Math.ceil(limitStatus.resetInSeconds / 60)} minutes before requesting another code.`
        },
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

    // Generate cryptographically random 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const otpData = {
      code: otpCode,
      email: adminEmail,
      expiresAt,
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(OTP_FILE, JSON.stringify(otpData, null, 2), "utf-8");

    // Send email to admin
    await sendAdminPasswordResetOtp(otpCode, adminEmail);

    // Mask email for user privacy (e.g. g***e@gmail.com)
    const [userPart, domain] = adminEmail.split("@");
    const maskedUser = userPart.length > 2
      ? `${userPart[0]}***${userPart[userPart.length - 1]}`
      : `${userPart[0]}***`;
    const maskedEmail = `${maskedUser}@${domain}`;

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${maskedEmail}`,
      maskedEmail,
      devOtp: !process.env.GMAIL_USER ? otpCode : undefined
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process forgot password request." },
      { status: 500 }
    );
  }
}
