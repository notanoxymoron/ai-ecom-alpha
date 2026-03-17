import test from "node:test";
import assert from "node:assert/strict";
import { extractGeneratedVideoInfo } from "./generator.ts";

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
