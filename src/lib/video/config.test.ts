import test from "node:test";
import assert from "node:assert/strict";
import {
  buildVideoGenerationParameters,
  getSupportedVideoAspectRatio,
  VIDEO_GENERATION_DURATION_SECONDS,
  VIDEO_ASPECT_RATIO_OPTIONS,
} from "./config.ts";

test("getSupportedVideoAspectRatio keeps Veo-supported values unchanged", () => {
  assert.equal(getSupportedVideoAspectRatio("9:16"), "9:16");
  assert.equal(getSupportedVideoAspectRatio("16:9"), "16:9");
});

test("getSupportedVideoAspectRatio maps unsupported image ratios to a safe Veo fallback", () => {
  assert.equal(getSupportedVideoAspectRatio("4:5"), "9:16");
  assert.equal(getSupportedVideoAspectRatio("1:1"), "9:16");
  assert.equal(getSupportedVideoAspectRatio("unknown"), "9:16");
});

test("VIDEO_ASPECT_RATIO_OPTIONS only exposes supported Veo ratios", () => {
  assert.deepEqual(
    VIDEO_ASPECT_RATIO_OPTIONS.map((option) => option.value),
    ["9:16", "16:9"]
  );
});

test("buildVideoGenerationParameters only includes Veo-supported fields", () => {
  assert.deepEqual(buildVideoGenerationParameters("4:5"), {
    aspectRatio: "9:16",
    durationSeconds: VIDEO_GENERATION_DURATION_SECONDS,
  });
});
