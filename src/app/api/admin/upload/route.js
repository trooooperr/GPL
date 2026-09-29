import { NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function POST(request) {
  const isAuthed = await verifyAuthCookie(request);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const prefix = formData.get("prefix") || "admin_upload";

    if (!file || typeof file === "string" || !file.name) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name).toLowerCase() || ".png";
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".svg"].includes(ext) ? ext : ".png";
    const uniqueName = `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}${safeExt}`;
    const savePath = path.join(UPLOADS_DIR, uniqueName);

    await fs.promises.writeFile(savePath, buffer);
    const fileUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: uniqueName
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
