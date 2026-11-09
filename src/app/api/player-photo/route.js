import { NextResponse } from "next/server";
import { connectToDatabase, MongoRegistration } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.redirect(new URL("/images/avatar-placeholder.svg", request.url));
    }

    await connectToDatabase();
    const player = await MongoRegistration.findOne({ id }, "photoUrl").lean();

    if (!player || !player.photoUrl || player.photoUrl.includes("placeholder")) {
      return NextResponse.redirect(new URL("/images/avatar-placeholder.svg", request.url));
    }

    const photoUrl = player.photoUrl;

    if (photoUrl.startsWith("data:")) {
      const parts = photoUrl.split(",");
      if (parts.length > 1) {
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const buffer = Buffer.from(parts[1], "base64");

        return new Response(buffer, {
          headers: {
            "Content-Type": mime,
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
          }
        });
      }
    }

    if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://") || photoUrl.startsWith("/")) {
      return NextResponse.redirect(new URL(photoUrl, request.url));
    }

    return NextResponse.redirect(new URL("/images/avatar-placeholder.svg", request.url));
  } catch (error) {
    return NextResponse.redirect(new URL("/images/avatar-placeholder.svg", request.url));
  }
}

