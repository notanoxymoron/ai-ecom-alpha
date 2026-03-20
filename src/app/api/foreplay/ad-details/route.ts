import { NextRequest, NextResponse } from "next/server";
import { getAdDetails } from "@/lib/foreplay/client";

export async function GET(request: NextRequest) {
  const adId = request.nextUrl.searchParams.get("ad_id");

  if (!adId) {
    return NextResponse.json({ error: "ad_id required" }, { status: 400 });
  }

  const foreplayKey = request.headers.get("X-Foreplay-Key") || undefined;
  try {
    const result = await getAdDetails(adId, foreplayKey);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
