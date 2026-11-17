import { NextResponse } from "next/server";
import { connectToDatabase, MongoRegistration } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const docType = searchParams.get("t") || "photo"; // photo | front | back | proof | card

    const placeholder = docType === "photo" 
      ? "/images/avatar-placeholder.svg" 
      : (docType === "card" ? "/images/gpl-card-base.png" : "/images/doc-placeholder.svg");

    if (!id) {
      return NextResponse.redirect(new URL(placeholder, request.url));
    }

    await connectToDatabase();

    const fieldMap = {
      photo: "photoUrl",
      front: "aadhaarFrontUrl",
      back: "aadhaarBackUrl",
      proof: "paymentProofUrl",
      card: "cardUrl"
    };

    const targetField = fieldMap[docType] || "photoUrl";
    const player = await MongoRegistration.findOne({ id }, targetField).lean();

    const rawUrl = player?.[targetField];
    if (!rawUrl || rawUrl.includes("placeholder")) {
      return NextResponse.redirect(new URL(placeholder, request.url));
    }

    if (rawUrl.startsWith("data:")) {
      const parts = rawUrl.split(",");
      if (parts.length > 1) {
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : (docType === "card" ? "image/png" : "image/jpeg");
        const buffer = Buffer.from(parts[1], "base64");

        return new Response(buffer, {
          headers: {
            "Content-Type": mime,
            "Cache-Control": "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400"
          }
        });
      }
    }

    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("/")) {
      return NextResponse.redirect(new URL(rawUrl, request.url));
    }

    return NextResponse.redirect(new URL(placeholder, request.url));
  } catch (error) {
    return NextResponse.redirect(new URL("/images/avatar-placeholder.svg", request.url));
  }
}

