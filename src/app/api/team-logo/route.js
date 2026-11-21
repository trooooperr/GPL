import { NextResponse } from "next/server";
import { connectToDatabase, MongoTeam } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const placeholder = "/images/gpl-logo.png";

    if (!id) {
      return NextResponse.redirect(new URL(placeholder, request.url));
    }

    await connectToDatabase();
    const team = await MongoTeam.findOne({ id }, "logo").lean();
    const rawLogo = team?.logo;

    if (!rawLogo) {
      return NextResponse.redirect(new URL(placeholder, request.url));
    }

    if (rawLogo.startsWith("data:")) {
      const parts = rawLogo.split(",");
      if (parts.length > 1) {
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/png";
        const buffer = Buffer.from(parts[1], "base64");

        return new Response(buffer, {
          headers: {
            "Content-Type": mime,
            "Cache-Control": "public, max-age=2592000, s-maxage=2592000, immutable",
            "CDN-Cache-Control": "public, s-maxage=2592000",
            "Vercel-CDN-Cache-Control": "public, s-maxage=2592000"
          }
        });
      }
    }

    if (rawLogo.startsWith("http://") || rawLogo.startsWith("https://") || rawLogo.startsWith("/")) {
      return NextResponse.redirect(new URL(rawLogo, request.url));
    }

    return NextResponse.redirect(new URL(placeholder, request.url));
  } catch (error) {
    return NextResponse.redirect(new URL("/images/gpl-logo.png", request.url));
  }
}

