import { NextRequest, NextResponse } from "next/server";
import { analyzeAd, type AnalysisProvider } from "@/lib/analysis/analyzer";
import type { BrandProfile } from "@/shared/types";
import type { ForeplayAd } from "@/shared/types/foreplay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ad, brandProfile, openaiApiKey, claudeApiKey, openrouterApiKey, provider = "openai" } = body as {
      ad: ForeplayAd;
      brandProfile: BrandProfile;
      openaiApiKey?: string;
      claudeApiKey?: string;
      openrouterApiKey?: string;
      provider?: AnalysisProvider;
    };

    if (!ad || !brandProfile) {
      return NextResponse.json({ error: "ad and brandProfile required" }, { status: 400 });
    }

    const keyMap: Record<AnalysisProvider, string | undefined> = {
      openai: openaiApiKey,
      claude: claudeApiKey,
      openrouter: openrouterApiKey,
    };
    const apiKey = keyMap[provider];
    if (!apiKey) {
      return NextResponse.json({ error: `${provider}ApiKey required` }, { status: 400 });
    }

    const analysis = await analyzeAd(ad, brandProfile, apiKey, provider);
    return NextResponse.json({ data: analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
