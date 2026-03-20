import type { AdAnalysis, BrandProfile } from "@/shared/types";
import type { ForeplayAd } from "@/shared/types/foreplay";

export type AnalysisProvider = "openai" | "claude" | "openrouter";

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
  apiKey: string,
  provider: AnalysisProvider = "openai"
): Promise<AdAnalysis> {
  if (provider === "claude") return analyzeAdWithClaude(ad, brandProfile, apiKey);
  if (provider === "openrouter") return analyzeAdWithOpenRouter(ad, brandProfile, apiKey);
  return analyzeAdWithOpenAI(ad, brandProfile, apiKey);
}

async function analyzeAdWithOpenAI(
  ad: ForeplayAd,
  brandProfile: BrandProfile,
  openaiApiKey: string
): Promise<AdAnalysis> {
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
  return JSON.parse(cleaned) as AdAnalysis;
}

async function analyzeAdWithClaude(
  ad: ForeplayAd,
  brandProfile: BrandProfile,
  claudeApiKey: string
): Promise<AdAnalysis> {
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

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": claudeApiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image", source: { type: "url", url: imageUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const content = data.content?.[0]?.text;
  if (!content) throw new Error("No response from Claude");

  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as AdAnalysis;
}

async function analyzeAdWithOpenRouter(
  ad: ForeplayAd,
  brandProfile: BrandProfile,
  openrouterApiKey: string
): Promise<AdAnalysis> {
  const imageUrl = ad.image || ad.thumbnail;
  if (!imageUrl) {
    throw new Error("Ad has no image to analyze");
  }

  // Fetch the image and encode as base64 so CDN-gated URLs are accessible to OpenRouter
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Failed to fetch ad image (${imgRes.status})`);
  const imgBuffer = await imgRes.arrayBuffer();
  const contentType = imgRes.headers.get("content-type") || "image/jpeg";
  const base64 = Buffer.from(imgBuffer).toString("base64");
  const dataUrl = `data:${contentType};base64,${base64}`;

  const prompt = ANALYSIS_PROMPT
    .replace("{ad_copy}", ad.description || "")
    .replace("{running_days}", String(ad.running_duration?.days ?? 0))
    .replace("{niche}", brandProfile.niche || "general")
    .replace("{target_audience}", brandProfile.targetAudience || "general consumers")
    .replace("{brand_voice}", brandProfile.brandVoice || "professional");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openrouterApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl, detail: "low" } },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No response from OpenRouter");

  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned) as AdAnalysis;
  } catch {
    throw new Error(`OpenRouter model did not return valid JSON: ${cleaned.slice(0, 200)}`);
  }
}
