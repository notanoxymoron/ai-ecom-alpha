export type VideoAspectRatio = "9:16" | "16:9";
export const VIDEO_GENERATION_DURATION_SECONDS = 8;

export const VIDEO_ASPECT_RATIO_OPTIONS: Array<{ value: VideoAspectRatio; label: string }> = [
  { value: "9:16", label: "9:16 — Vertical" },
  { value: "16:9", label: "16:9 — Landscape" },
];

export function getSupportedVideoAspectRatio(value: string): VideoAspectRatio {
  if (value === "16:9") {
    return "16:9";
  }

  return "9:16";
}

export function buildVideoGenerationParameters(
  aspectRatio: string
): { aspectRatio: VideoAspectRatio; durationSeconds: number } {
  return {
    aspectRatio: getSupportedVideoAspectRatio(aspectRatio),
    durationSeconds: VIDEO_GENERATION_DURATION_SECONDS,
  };
}
