import { NextRequest, NextResponse } from "next/server";
import { startVideoGeneration } from "@/lib/video/generator";
import type { BrandProfile, VideoAdAnalysis } from "@/shared/types";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysis, brandProfile, aspectRatio, customPrompt } = body as {
      analysis: VideoAdAnalysis;
      brandProfile: BrandProfile;
      aspectRatio?: string;
      customPrompt?: string;
    };

    if (!analysis || analysis.mediaType !== "video") {
      return NextResponse.json({ error: "video analysis required" }, { status: 400 });
    }

    if (!brandProfile) {
      return NextResponse.json({ error: "brandProfile required" }, { status: 400 });
    }

    const googleApiKey = process.env.GOOGLE_AI_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json({ error: "GOOGLE_AI_API_KEY not configured" }, { status: 500 });
    }

    const job = await startVideoGeneration(
      analysis,
      brandProfile,
      aspectRatio || "9:16",
      googleApiKey,
      customPrompt
    );
    return NextResponse.json({ data: job });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
