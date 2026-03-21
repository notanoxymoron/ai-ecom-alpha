import test from "node:test";
import assert from "node:assert/strict";
import type { VideoAdAnalysis } from "../../shared/types/index.ts";
import { buildVideoGenerationPrompt } from "./prompt.ts";

const brandProfile = {
  brandName: "Glow Lab",
  brandDescription: "Skincare brand",
  brandVoice: "confident and modern",
  targetAudience: "women aged 25-40",
  usps: ["clinical ingredients", "visible results"],
  brandColors: { primary: "#111111", secondary: "#ffffff", accent: "#ff6699" },
  excludedThemes: ["medical fear tactics"],
};

const analysis: VideoAdAnalysis = {
  mediaType: "video",
  overallScore: 8,
  videoSummary: {
    hookSummary: "Show dramatic before-and-after contrast in the first three seconds",
    offerSummary: "Promote a glow-up serum routine",
    ctaText: "Shop Now",
    firstThreeSeconds: "Creator points to dull skin, then fast-cuts into glowing result",
    durationLabel: "short-form",
  },
  sceneBreakdown: [
    {
      index: 1,
      startSeconds: 0,
      endSeconds: 2,
      goal: "hook",
      visuals: "Close-up face reveal",
      onScreenText: "Dull skin?",
      voiceover: "I fixed this fast",
      transition: "hard cut",
    },
    {
      index: 2,
      startSeconds: 2,
      endSeconds: 6,
      goal: "demo",
      visuals: "Product application montage",
      onScreenText: "3-step glow routine",
      voiceover: "This serum changed everything",
      transition: "speed ramp",
    },
  ],
  audioAnalysis: {
    audioStrategy: "hybrid",
    voiceoverStyle: "creator-led",
    musicMood: "upbeat",
    musicDescription: "upbeat pop beat with quick energetic cuts",
    captionStyle: "bold all-caps",
    pacing: "fast",
  },
  replicationBrief: {
    mustKeepElements: ["fast hook", "demo montage", "clear CTA"],
    adaptableElements: ["creator styling", "background", "color treatment"],
    brandedHookOptions: ["From tired to glowing in one routine"],
    brandedCtaOptions: ["Shop Glow Lab"],
    shotList: [
      {
        sequence: 1,
        visuals: "Creator close-up",
        overlayText: "Glow in 7 days",
        voiceoverLine: "This is the routine I wish I found sooner",
        durationSeconds: 2,
      },
    ],
  },
  relevanceToBrand: {
    score: 9,
    reasoning: "Strong fit for the brand's skincare audience",
  },
};

test("buildVideoGenerationPrompt turns analysis into a structured recreation brief", () => {
  const prompt = buildVideoGenerationPrompt({
    analysis,
    brandProfile,
    aspectRatio: "9:16",
  });

  assert.match(prompt, /natural ugc realism/i);
  assert.match(prompt, /Glow Lab/);
  assert.match(prompt, /one creator or one product focus/i);
  assert.match(prompt, /hook \(0-2s\)/i);
  assert.match(prompt, /creator says: this is the routine i wish i found sooner/i);
  assert.match(prompt, /use at most 2 anchored static text cards/i);
  assert.match(prompt, /Do not use competitor branding/i);
  assert.match(prompt, /medical fear tactics/i);
  assert.doesNotMatch(prompt, /Overlay:/);
  assert.doesNotMatch(prompt, /"Glow in 7 days"/);
});

test("buildVideoGenerationPrompt includes optional brand video reference insights", () => {
  const prompt = buildVideoGenerationPrompt({
    analysis,
    brandProfile,
    aspectRatio: "9:16",
    referenceVideoInsights: [
      "Keep the brand's warm handheld pacing",
      "Use quick spoken CTA at the end",
    ],
  });

  assert.match(prompt, /brand motion cues/i);
  assert.match(prompt, /warm handheld pacing/i);
  assert.match(prompt, /spoken CTA/i);
});

test("buildVideoGenerationPrompt preserves music-led audio without inventing voiceover", () => {
  const prompt = buildVideoGenerationPrompt({
    analysis: {
      ...analysis,
      audioAnalysis: {
        ...analysis.audioAnalysis,
        audioStrategy: "music_led",
        voiceoverStyle: "none",
        musicDescription: "upbeat dance track with punchy drop",
      },
      sceneBreakdown: [
        {
          ...analysis.sceneBreakdown[0],
          voiceover: "none",
        },
      ],
      replicationBrief: {
        ...analysis.replicationBrief,
        shotList: [
          {
            ...analysis.replicationBrief.shotList[0],
            voiceoverLine: "none",
          },
        ],
      },
    },
    brandProfile,
    aspectRatio: "9:16",
  });

  assert.match(prompt, /audio feel: music_led/i);
  assert.match(prompt, /no spoken dialogue/i);
  assert.match(prompt, /upbeat dance track with punchy drop/i);
  assert.doesNotMatch(prompt, /creator says:/i);
});

test("buildVideoGenerationPrompt collapses noisy source analysis into a 3-beat arc", () => {
  const prompt = buildVideoGenerationPrompt({
    analysis: {
      ...analysis,
      sceneBreakdown: [
        ...analysis.sceneBreakdown,
        {
          index: 3,
          startSeconds: 6,
          endSeconds: 7,
          goal: "proof",
          visuals: "Quick testimonial insert",
          onScreenText: "Loved by 10k customers",
          voiceover: "none",
          transition: "hard cut",
        },
        {
          index: 4,
          startSeconds: 7,
          endSeconds: 8,
          goal: "cta",
          visuals: "Product and checkout prompt",
          onScreenText: "Shop now",
          voiceover: "Grab yours today",
          transition: "static",
        },
      ],
      replicationBrief: {
        ...analysis.replicationBrief,
        shotList: [
          ...analysis.replicationBrief.shotList,
          {
            sequence: 2,
            visuals: "Serum texture demo",
            overlayText: "Clinically backed glow",
            voiceoverLine: "The glow is real",
            durationSeconds: 2,
          },
          {
            sequence: 3,
            visuals: "Checkout close",
            overlayText: "Shop Glow Lab",
            voiceoverLine: "Grab yours today",
            durationSeconds: 2,
          },
        ],
      },
    },
    brandProfile,
    aspectRatio: "9:16",
  });

  assert.equal((prompt.match(/- (Hook|Proof\/demo|CTA) \(/g) ?? []).length, 3);
  assert.doesNotMatch(prompt, /scene reference/i);
  assert.doesNotMatch(prompt, /shot list/i);
  assert.doesNotMatch(prompt, /Transition:/);
});
