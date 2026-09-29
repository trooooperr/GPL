import { NextResponse } from "next/server";
import { authenticateAdmin, signAdminToken, COOKIE_NAME } from "@/lib/auth";
import { rateLimiter, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request) {
  await dbReady;
  try {
    const clientIp = getClientIp(request);
    
    // Rate limit: 5 attempts per 15 minutes per IP
    const limitStatus = rateLimiter.check(`admin_login_${clientIp}`, 5, 900);
    if (!limitStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Account temporarily locked. Retry in ${Math.ceil(limitStatus.resetInSeconds / 60)} minutes.`
        },
        { status: 429 }
      );
    }

    const { username, password } = await request.json();
    const isValid = await authenticateAdmin(username, password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials. Access denied." },
        { status: 401 }
      );
    }

    // Reset rate limit counter on success
    rateLimiter.reset(`admin_login_${clientIp}`);

    // Generate secure 24h JWT token
    const token = signAdminToken();

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({
      success: true,
      token,
      message: "Admin session authenticated successfully."
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication system error." },
      { status: 500 }
    );
  }
}
