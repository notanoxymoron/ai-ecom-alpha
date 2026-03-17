import type { BrandProfile, VideoAdAnalysis } from "@/shared/types";
import { buildVideoGenerationPrompt } from "./prompt.ts";
import { summarizeBrandVideoReference } from "./analysis.ts";
import { buildVideoGenerationParameters, getSupportedVideoAspectRatio } from "./config.ts";

const VEO_MODEL = "veo-3.1-generate-preview";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export interface VideoGenerationJob {
  jobId: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  prompt: string;
}

export interface VideoJobStatus {
  jobId: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  operation: Record<string, unknown>;
}

interface ExtractedGeneratedVideoInfo {
  uri: string | null;
  mimeType: string;
  fileName: string | null;
  inlineData: string | null;
}

function mapOperationStatus(operation: Record<string, unknown>): VideoJobStatus["status"] {
  if (operation.error) return "failed";
  if (operation.done) return "completed";

  const metadata = operation.metadata as Record<string, unknown> | undefined;
  const state = typeof metadata?.state === "string" ? metadata.state.toLowerCase() : "";
  if (state.includes("progress")) return "in_progress";

  return "queued";
}

async function maybeCollectReferenceInsights(
  brandProfile: BrandProfile,
  googleApiKey: string
): Promise<string[]> {
  const references = (brandProfile.videoReferences ?? []).slice(0, 2);
  if (references.length === 0) return [];

  const insights = await Promise.all(
    references.map(async (reference) => {
      try {
        return await summarizeBrandVideoReference(reference, googleApiKey);
      } catch {
        return "";
      }
    })
  );

  return insights.filter(Boolean);
}

export async function startVideoGeneration(
  analysis: VideoAdAnalysis,
  brandProfile: BrandProfile,
  aspectRatio: string,
  googleApiKey: string,
  customPrompt?: string
): Promise<VideoGenerationJob> {
  const supportedAspectRatio = getSupportedVideoAspectRatio(aspectRatio);
  let prompt = customPrompt;
  if (!prompt) {
    const referenceVideoInsights = await maybeCollectReferenceInsights(brandProfile, googleApiKey);
    prompt = buildVideoGenerationPrompt({
      analysis,
      brandProfile,
      aspectRatio: supportedAspectRatio,
      referenceVideoInsights,
    });
  }

  const res = await fetch(`${BASE_URL}/models/${VEO_MODEL}:predictLongRunning`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": googleApiKey,
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: buildVideoGenerationParameters(supportedAspectRatio),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Veo generation error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const jobId = data.name as string | undefined;
  if (!jobId) {
    throw new Error("Video generation job id missing from Veo response");
  }

  return {
    jobId,
    status: mapOperationStatus(data),
    prompt,
  };
}

export async function getVideoGenerationStatus(
  jobId: string,
  googleApiKey: string
): Promise<VideoJobStatus> {
  const res = await fetch(`${BASE_URL}/${jobId}`, {
    headers: {
      "x-goog-api-key": googleApiKey,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch Veo job ${jobId}: ${body}`);
  }

  const data = await res.json() as Record<string, unknown>;
  return {
    jobId,
    status: mapOperationStatus(data),
    operation: data,
  };
}

function getGeneratedVideoObject(operation: Record<string, unknown>): Record<string, unknown> | null {
  const response = operation.response as Record<string, unknown> | undefined;
  const generateVideoResponse = response?.generateVideoResponse as Record<string, unknown> | undefined;
  const generatedSamples = generateVideoResponse?.generatedSamples || generateVideoResponse?.generated_samples;
  if (Array.isArray(generatedSamples) && generatedSamples.length > 0) {
    const firstSample = generatedSamples[0] as Record<string, unknown>;
    const sampleVideo = firstSample.video || firstSample.file || firstSample;
    if (sampleVideo && typeof sampleVideo === "object") {
      return sampleVideo as Record<string, unknown>;
    }
  }

  const generatedVideos = response?.generatedVideos || response?.generated_videos;
  if (!Array.isArray(generatedVideos) || generatedVideos.length === 0) {
    return null;
  }

  const first = generatedVideos[0] as Record<string, unknown>;
  const video = first.video || first.file || first;
  if (!video || typeof video !== "object") {
    return null;
  }

  return video as Record<string, unknown>;
}

export function extractGeneratedVideoInfo(operation: Record<string, unknown>): ExtractedGeneratedVideoInfo | null {
  const video = getGeneratedVideoObject(operation);
  if (!video) {
    return null;
  }

  const mimeType =
    (video.mimeType as string | undefined) ||
    (video.mime_type as string | undefined) ||
    "video/mp4";

  const inlineData =
    ((video.inlineData as Record<string, unknown> | undefined)?.data as string | undefined) ||
    ((video.inline_data as Record<string, unknown> | undefined)?.data as string | undefined) ||
    null;

  const uri =
    (video.downloadUri as string | undefined) ||
    (video.download_uri as string | undefined) ||
    (video.uri as string | undefined) ||
    (video.url as string | undefined) ||
    null;

  const fileName =
    (video.name as string | undefined) ||
    ((video.file as Record<string, unknown> | undefined)?.name as string | undefined) ||
    null;

  return {
    uri,
    mimeType,
    fileName,
    inlineData,
  };
}

export async function downloadGeneratedVideo(
  jobId: string,
  googleApiKey: string
): Promise<{ buffer: ArrayBuffer; mimeType: string }> {
  const { operation } = await getVideoGenerationStatus(jobId, googleApiKey);
  const videoInfo = extractGeneratedVideoInfo(operation);
  if (!videoInfo) {
    throw new Error("Generated video file not found in Veo job response");
  }

  if (videoInfo.inlineData) {
    return {
      buffer: Buffer.from(videoInfo.inlineData, "base64").buffer,
      mimeType: videoInfo.mimeType,
    };
  }

  if (videoInfo.uri) {
    const res = await fetch(videoInfo.uri, {
      headers: {
        "x-goog-api-key": googleApiKey,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to download generated video from provider URI: ${body}`);
    }

    return {
      buffer: await res.arrayBuffer(),
      mimeType: res.headers.get("content-type") || videoInfo.mimeType,
    };
  }

  if (!videoInfo.fileName) {
    throw new Error("No downloadable file reference returned for the generated video");
  }

  const downloadRes = await fetch(`${BASE_URL}/${videoInfo.fileName}:download?alt=media`, {
    headers: {
      "x-goog-api-key": googleApiKey,
    },
  });

  if (!downloadRes.ok) {
    const body = await downloadRes.text();
    throw new Error(`Failed to download generated video file ${videoInfo.fileName}: ${body}`);
  }

  return {
    buffer: await downloadRes.arrayBuffer(),
    mimeType: downloadRes.headers.get("content-type") || videoInfo.mimeType,
  };
}
