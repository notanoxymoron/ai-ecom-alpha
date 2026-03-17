import type { BrandProfile, ImageAdAnalysis } from "@/shared/types";
import type { ForeplayAd } from "@/shared/types/foreplay";

const ANALYSIS_PROMPT = `You are an expert direct-response advertising analyst specializing in e-commerce static ads. Analyze this ad to identify specific elements that make it high-converting.

Ad Copy: "{ad_copy}"
Running Duration: {running_days} days (longer = better performing)
Niche: {niche}
Brand's Target Audience: {target_audience}
Brand Voice: {brand_voice}

Analyze this ad and return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "overallScore": <1-10>,
  "conversionElements": {
    "hook": {
      "text": "<exact hook text visible in ad>",
      "type": "<curiosity|fear|benefit|social_proof|urgency|question>",
      "effectivenessScore": <1-10>,
      "whyItWorks": "<explanation>"
    },
    "visualHierarchy": {
      "layoutType": "<single_product|lifestyle|before_after|testimonial|comparison|ugc_style>",
      "focalPoint": "<what draws the eye first>",
      "visualFlow": "<how the eye moves through the ad>"
    },
    "colorPsychology": {
      "dominantColors": ["<#hex1>", "<#hex2>"],
      "emotionalImpact": "<feeling the palette creates>",
      "contrastUsage": "<how contrast draws attention>"
    },
    "socialProof": {
      "present": <true|false>,
      "type": "<testimonial|star_rating|user_count|before_after|celebrity|press|none>",
      "placement": "<where in the ad>"
    },
    "cta": {
      "text": "<CTA text if visible>",
      "placement": "<top|middle|bottom|overlay>",
      "urgencyLevel": "<none|low|medium|high>"
    },
    "copyAnalysis": {
      "headline": "<extracted headline>",
      "bodyCopySummary": "<summary>",
      "emotionalTriggers": ["<trigger1>", "<trigger2>"],
      "powerWords": ["<word1>", "<word2>"]
    },
    "productPresentation": {
      "style": "<flat_lay|in_use|lifestyle|macro|packaging>",
      "background": "<solid|gradient|lifestyle|transparent>",
      "propsUsed": "<description>"
    }
  },
  "replicationBrief": {
    "mustKeepElements": ["<element1>", "<element2>"],
    "adaptableElements": ["<element1>", "<element2>"],
    "suggestedModifications": ["<modification1>", "<modification2>"],
    "textToRender": {
      "headline": "<suggested headline using brand voice>",
      "subheadline": "<if applicable>",
      "cta": "<suggested CTA>"
    }
  },
  "relevanceToBrand": {
    "score": <1-10>,
    "reasoning": "<why this pattern would or wouldn't work for the brand>"
  }
}`;

export async function analyzeAd(
  ad: ForeplayAd,
  brandProfile: BrandProfile,
  openaiApiKey: string
): Promise<ImageAdAnalysis> {
  const imageUrl = ad.image || ad.thumbnail;
  if (!imageUrl) {
    throw new Error("Ad has no image to analyze");
  }

  const prompt = ANALYSIS_PROMPT
    .replace("{ad_copy}", ad.description || "")
    .replace("{running_days}", String(ad.running_duration?.days ?? 0))
    .replace("{niche}", brandProfile.niche || "general")
    .replace("{target_audience}", brandProfile.targetAudience || "general consumers")
    .replace("{brand_voice}", brandProfile.brandVoice || "professional");

  const messages = [
    {
      role: "user" as const,
      content: [
        { type: "text" as const, text: prompt },
        { type: "image_url" as const, image_url: { url: imageUrl, detail: "high" as const } },
      ],
    },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      max_tokens: 2000,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  // Strip markdown code fences if present
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned) as Omit<ImageAdAnalysis, "mediaType">;
  return {
    mediaType: "image",
    ...parsed,
  };
}
