import test from "node:test";
import assert from "node:assert/strict";
import type { BrandProfile, VideoAdAnalysis } from "../../shared/types/index.ts";
import {
  extractGeneratedVideoInfo,
  prepareVideoGenerationRequest,
  shouldRetryWithoutReferences,
  startVideoGeneration,
} from "./generator.ts";

const pngDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB";

const brandProfile: BrandProfile = {
  brandName: "Glow Lab",
  brandUrl: "https://glowlab.example",
  brandDescription: "Skincare brand",
  brandVoice: "confident and modern",
  targetAudience: "women aged 25-40",
  usps: ["clinical ingredients", "visible results"],
  productCategories: ["Serum"],
  priceRange: "$29",
  brandColors: { primary: "#111111", secondary: "#ffffff", accent: "#ff6699" },
  fonts: { heading: "DM Sans", body: "DM Sans" },
  logoFiles: [
    { id: "logo-1", name: "Logo", url: pngDataUrl, type: "logo" },
  ],
  exampleAds: [
    { id: "example-1", name: "Example ad", url: pngDataUrl, type: "example_ad" },
    { id: "example-2", name: "Example ad 2", url: pngDataUrl, type: "example_ad" },
  ],
  productImages: [
    { id: "product-1", name: "Product 1", url: pngDataUrl, type: "product_image" },
    { id: "product-2", name: "Product 2", url: pngDataUrl, type: "product_image" },
    { id: "product-3", name: "Product 3", url: pngDataUrl, type: "product_image" },
  ],
  videoReferences: [],
  niche: "Skincare",
  subNiches: [],
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

test("extractGeneratedVideoInfo supports predictLongRunning response shape", () => {
  const info = extractGeneratedVideoInfo({
    response: {
      generateVideoResponse: {
        generatedSamples: [
          {
            video: {
              uri: "https://example.com/generated.mp4",
              mimeType: "video/mp4",
            },
          },
        ],
      },
    },
  });

  assert.deepEqual(info, {
    uri: "https://example.com/generated.mp4",
    mimeType: "video/mp4",
    fileName: null,
    inlineData: null,
  });
});

test("extractGeneratedVideoInfo still supports generatedVideos response shape", () => {
  const info = extractGeneratedVideoInfo({
    response: {
      generatedVideos: [
        {
          video: {
            uri: "https://example.com/generated-2.mp4",
            mime_type: "video/mp4",
          },
        },
      ],
    },
  });

  assert.deepEqual(info, {
    uri: "https://example.com/generated-2.mp4",
    mimeType: "video/mp4",
    fileName: null,
    inlineData: null,
  });
});

test("prepareVideoGenerationRequest includes a default negative prompt and prioritized brand references", async () => {
  const request = await prepareVideoGenerationRequest(
    analysis,
    brandProfile,
    "9:16",
    "test-api-key",
    "Custom positive prompt"
  );

  assert.equal(request.prompt, "Custom positive prompt");
  assert.equal(request.durationSeconds, 8);
  assert.match(request.negativePrompt, /floating text/i);
  assert.match(request.negativePrompt, /competitor logos/i);
  assert.deepEqual(request.referenceImages.map((image) => image.referenceType), ["asset", "asset", "style"]);
  assert.equal(request.referenceImages.length, 3);
});

test("shouldRetryWithoutReferences only retries unsupported reference-image errors", () => {
  assert.equal(
    shouldRetryWithoutReferences(400, "Your use case is currently not supported for referenceImages"),
    true
  );
  assert.equal(shouldRetryWithoutReferences(500, "referenceImages not supported"), false);
  assert.equal(shouldRetryWithoutReferences(400, "prompt violated safety policies"), false);
});

test("startVideoGeneration retries once without reference images when the provider rejects them", async () => {
  const originalFetch = globalThis.fetch;
  const requestBodies: Array<Record<string, unknown>> = [];

  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    requestBodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);

    if (requestBodies.length === 1) {
      return new Response("Your use case is currently not supported for referenceImages", { status: 400 });
    }

    return new Response(
      JSON.stringify({
        name: "operations/video-123",
        metadata: { state: "IN_PROGRESS" },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }) as typeof fetch;

  try {
    const job = await startVideoGeneration(
      analysis,
      brandProfile,
      "9:16",
      "test-api-key",
      "Custom positive prompt"
    );

    assert.equal(job.jobId, "operations/video-123");
    assert.equal(job.status, "in_progress");
    assert.equal(job.prompt, "Custom positive prompt");
    assert.equal(requestBodies.length, 2);

    const firstInstance = (requestBodies[0].instances as Array<Record<string, unknown>>)[0];
    const secondInstance = (requestBodies[1].instances as Array<Record<string, unknown>>)[0];
    const firstParameters = requestBodies[0].parameters as Record<string, unknown>;

    assert.equal(Array.isArray(firstInstance.referenceImages), true);
    assert.equal("referenceImages" in secondInstance, false);
    assert.equal(firstParameters.durationSeconds, 8);
    assert.match(String(firstParameters.negativePrompt), /floating text/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
