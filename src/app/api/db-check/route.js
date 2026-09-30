import { NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  connectToDatabase,
  MongoRegistration,
  MongoTeam,
  MongoSetting,
  MongoRule
} from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const uri = process.env.MONGODB_URI;
  const isUriPresent = Boolean(uri);

  let maskedUri = "NOT_CONFIGURED";
  if (isUriPresent) {
    try {
      maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
    } catch {
      maskedUri = "CONFIGURED (MASKED)";
    }
  }

  const envStatus = {
    MONGODB_URI: Boolean(process.env.MONGODB_URI),
    JWT_SECRET: Boolean(process.env.JWT_SECRET),
    ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
    ADMIN_USERNAME: Boolean(process.env.ADMIN_USERNAME),
    GMAIL_USER: Boolean(process.env.GMAIL_USER),
    GMAIL_APP_PASSWORD: Boolean(process.env.GMAIL_APP_PASSWORD),
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT_SET",
    NODE_ENV: process.env.NODE_ENV || "unknown"
  };

  if (!isUriPresent) {
    return NextResponse.json(
      {
        success: false,
        status: "CONFIG_ERROR",
        message: "MONGODB_URI is missing from your Vercel Environment Variables.",
        maskedUri,
        envStatus,
        fix: "Go to Vercel Dashboard > Project Settings > Environment Variables, add MONGODB_URI, and redeploy."
      },
      { status: 500 }
    );
  }

  try {
    const startTime = Date.now();
    await connectToDatabase();
    const pingTimeMs = Date.now() - startTime;

    const [playersCount, teamsCount, settingsDoc, rulesDoc] = await Promise.all([
      MongoRegistration.countDocuments().catch(() => -1),
      MongoTeam.countDocuments().catch(() => -1),
      MongoSetting.findOne({ key: "global_settings" }).lean().catch(() => null),
      MongoRule.findOne().lean().catch(() => null)
    ]);

    return NextResponse.json({
      success: true,
      status: "CONNECTED",
      message: "Successfully connected to MongoDB Atlas from Vercel!",
      pingTimeMs,
      database: mongoose.connection?.name || "unknown",
      maskedUri,
      dataCounts: {
        totalRegistrations: playersCount,
        totalTeams: teamsCount,
        settingsConfigured: Boolean(settingsDoc),
        rulesConfigured: Boolean(rulesDoc?.rules?.length)
      },
      envStatus
    });
  } catch (err) {
    let troubleshooting = "Unknown error connecting to MongoDB.";
    const errMsg = err.message || "";

    if (errMsg.includes("bad auth") || errMsg.includes("Authentication failed")) {
      troubleshooting = "Database username or password in MONGODB_URI is incorrect. Verify credentials in MongoDB Atlas.";
    } else if (errMsg.includes("timed out") || errMsg.includes("ServerSelectionError") || errMsg.includes("Could not connect to any servers")) {
      troubleshooting = "MongoDB Atlas is blocking Vercel IP addresses! Go to MongoDB Atlas > Network Access > Add IP Address > Click 'ALLOW ACCESS FROM ANYWHERE' (0.0.0.0/0).";
    }

    return NextResponse.json(
      {
        success: false,
        status: "CONNECTION_FAILED",
        error: errMsg,
        name: err.name,
        troubleshooting,
        maskedUri,
        envStatus
      },
      { status: 500 }
    );
  }
}
