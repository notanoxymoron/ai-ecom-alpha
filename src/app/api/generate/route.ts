import { NextRequest, NextResponse } from "next/server";
import { generateAd, type GenerationOverrides } from "@/lib/generation/generator";
import type { AdAnalysis, BrandProfile } from "@/shared/types";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      analysis,
      brandProfile,
      sourceImageUrl,
      aspectRatio,
      variationIndex,
      totalVariations,
      overrides,
      adDescription,
      customPrompt,
    } = body as {
      analysis: AdAnalysis | null;
      brandProfile: BrandProfile;
      sourceImageUrl: string | null;
      aspectRatio?: string;
      variationIndex?: number;
      totalVariations?: number;
      overrides?: GenerationOverrides;
      adDescription?: string;
      customPrompt?: string;
    };

    if (!brandProfile) {
      return NextResponse.json({ error: "brandProfile required" }, { status: 400 });
    }

    const googleApiKey = request.headers.get("X-Google-Ai-Key");
    if (!googleApiKey) {
      return NextResponse.json({ error: "Google AI API key not configured. Please add it in Settings → API Keys." }, { status: 500 });
    }

    const result = await generateAd(
      analysis,
      brandProfile,
      sourceImageUrl,
      aspectRatio || "4:5",
      variationIndex ?? 0,
      totalVariations ?? 1,
      googleApiKey,
      overrides,
      adDescription,
      customPrompt
    );

    return NextResponse.json({
      data: {
        imageBase64: result.imageBase64,
        mimeType: result.mimeType,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[generate] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
