import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendAdminPasswordResetOtp, getAdminContactEmail } from "@/lib/email.js";
import { rateLimiter, getClientIp } from "@/lib/rate-limit.js";

import { connectToDatabase, MongoSetting } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(request) {
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

    await connectToDatabase();
    await MongoSetting.findOneAndUpdate(
      { key: "admin_password_otp" },
      {
        key: "admin_password_otp",
        value: {
          code: otpCode,
          email: adminEmail,
          expiresAt,
          createdAt: new Date().toISOString()
        }
      },
      { upsert: true }
    );

    const mailResult = await sendAdminPasswordResetOtp(otpCode, adminEmail);

    const [userPart, domain] = adminEmail.split("@");
    const maskedUser = userPart.length > 2
      ? `${userPart[0]}***${userPart[userPart.length - 1]}`
      : `${userPart[0]}***`;
    const maskedEmail = `${maskedUser}@${domain}`;

    const resData = {
      success: true,
      message: `A 6-digit verification code has been dispatched to ${maskedEmail}`,
      maskedEmail
    };

    if (mailResult && (!mailResult.sent || mailResult.method === "LOGGED")) {
      resData.devOtp = otpCode;
    }

    return NextResponse.json(resData);
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process forgot password request." },
      { status: 500 }
    );
  }
}
