import { NextRequest, NextResponse } from "next/server";
import { analyzeVideoAd } from "@/lib/video/analysis";
import type { BrandProfile } from "@/shared/types";
import type { ForeplayAd } from "@/shared/types/foreplay";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ad, brandProfile } = body as {
      ad: ForeplayAd;
      brandProfile: BrandProfile;
    };

    if (!ad || !brandProfile) {
      return NextResponse.json({ error: "ad and brandProfile required" }, { status: 400 });
    }

    const googleApiKey = process.env.GOOGLE_AI_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json({ error: "GOOGLE_AI_API_KEY not configured" }, { status: 500 });
    }

    const analysis = await analyzeVideoAd(ad, brandProfile, googleApiKey);
    return NextResponse.json({ data: analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
