import type { BrandProfile, BrandVideoReference, VideoAdAnalysis } from "@/shared/types";
import type { ForeplayAd } from "@/shared/types/foreplay";

const VIDEO_ANALYSIS_MODEL = "gemini-3-flash-preview";
const INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

const VIDEO_ANALYSIS_PROMPT = `You are an expert direct-response video advertising analyst for e-commerce brands.

Analyze the competitor short-form video ad and return ONLY valid JSON with this shape:
{
  "overallScore": <1-10>,
  "videoSummary": {
    "hookSummary": "<why the hook works>",
    "offerSummary": "<core offer or promise>",
    "ctaText": "<main CTA text or spoken CTA>",
    "firstThreeSeconds": "<what happens in the first three seconds>",
    "durationLabel": "<short-form|medium-form|long-form>"
  },
  "sceneBreakdown": [
    {
      "index": <1-based>,
      "startSeconds": <number>,
      "endSeconds": <number>,
      "goal": "<hook|problem|demo|proof|offer|cta|bridge>",
      "visuals": "<what is shown>",
      "onScreenText": "<main text on screen or none>",
      "voiceover": "<spoken line or none>",
      "transition": "<cut|speed_ramp|zoom|match_cut|static|other>"
    }
  ],
  "audioAnalysis": {
    "audioStrategy": "<music_led|voiceover_led|hybrid|silent>",
    "voiceoverStyle": "<ugc_creator|founder|narrator|none>",
    "musicMood": "<upbeat|calm|dramatic|none>",
    "musicDescription": "<short description of the music style, instrumentation, and energy or none>",
    "captionStyle": "<bold|subtitle|minimal|none>",
    "pacing": "<slow|medium|fast>"
  },
  "replicationBrief": {
    "mustKeepElements": ["<element1>", "<element2>"],
    "adaptableElements": ["<element1>", "<element2>"],
    "brandedHookOptions": ["<hook option 1>", "<hook option 2>"],
    "brandedCtaOptions": ["<cta option 1>", "<cta option 2>"],
    "shotList": [
      {
        "sequence": <1-based>,
        "visuals": "<shot description>",
        "overlayText": "<text overlay>",
        "voiceoverLine": "<voiceover line or none>",
        "durationSeconds": <number>
      }
    ]
  },
  "relevanceToBrand": {
    "score": <1-10>,
    "reasoning": "<why this structure fits or does not fit the brand>"
  }
}

Audio is critical. Detect whether the source ad is driven by music, by spoken voiceover, by both, or is effectively silent. If the original ad has no spoken voiceover, set both scene and shot voiceover fields to "none" rather than inventing one.

Use the ad copy, transcription, running duration, niche, audience, and brand voice below as context.
- Ad Copy: "{ad_copy}"
- Full Transcription: "{transcription}"
- Running Duration: {running_days} days
- Niche: {niche}
- Brand Audience: {target_audience}
- Brand Voice: {brand_voice}`;

function buildVideoAnalysisPrompt(ad: ForeplayAd, brandProfile: BrandProfile): string {
  return VIDEO_ANALYSIS_PROMPT
    .replace("{ad_copy}", ad.description || "none")
    .replace("{transcription}", ad.full_transcription || "none")
    .replace("{running_days}", String(ad.running_duration?.days ?? 0))
    .replace("{niche}", brandProfile.niche || "general")
    .replace("{target_audience}", brandProfile.targetAudience || "general consumers")
    .replace("{brand_voice}", brandProfile.brandVoice || "professional");
}

function guessVideoMimeType(url: string): string {
  const normalized = url.toLowerCase();
  if (normalized.endsWith(".mov")) return "video/quicktime";
  if (normalized.endsWith(".webm")) return "video/webm";
  return "video/mp4";
}

async function runVideoInteraction(
  googleApiKey: string,
  prompt: string,
  videoUrl: string
): Promise<string> {
  const res = await fetch(INTERACTIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": googleApiKey,
    },
    body: JSON.stringify({
      model: VIDEO_ANALYSIS_MODEL,
      input: [
        { type: "text", text: prompt },
        {
          type: "video",
          uri: videoUrl,
          mime_type: guessVideoMimeType(videoUrl),
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini video analysis error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const outputs = data.outputs;
  const text = outputs?.[outputs.length - 1]?.text || data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No text response returned from Gemini video analysis");
  }

  return text;
}

function parseJsonResponse<T>(content: string): T {
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as T;
}

export async function analyzeVideoAd(
  ad: ForeplayAd,
  brandProfile: BrandProfile,
  googleApiKey: string
): Promise<VideoAdAnalysis> {
  const videoUrl = ad.video;
  if (!videoUrl) {
    throw new Error("Ad has no video to analyze");
  }

  const content = await runVideoInteraction(googleApiKey, buildVideoAnalysisPrompt(ad, brandProfile), videoUrl);
  const parsed = parseJsonResponse<Omit<VideoAdAnalysis, "mediaType">>(content);

  return {
    mediaType: "video",
    ...parsed,
  };
}

export async function summarizeBrandVideoReference(
  reference: BrandVideoReference,
  googleApiKey: string
): Promise<string> {
  const content = await runVideoInteraction(
    googleApiKey,
    `Summarize this brand reference video in 3 bullet-ready sentences covering motion style, pacing, creator energy, and CTA delivery. Return plain text only.`,
    reference.url
  );

  return content.replace(/^\s*[-*]\s*/gm, "").trim();
}
