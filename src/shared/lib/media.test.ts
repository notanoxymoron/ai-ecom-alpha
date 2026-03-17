import test from "node:test";
import assert from "node:assert/strict";
import type { ForeplayAd } from "../types/foreplay.ts";
import {
  getAdMediaType,
  getDisplayFormatValues,
  getPrimaryCreativeUrl,
} from "./media.ts";

function createAd(overrides: Partial<ForeplayAd> = {}): ForeplayAd {
  return {
    id: "ad-1",
    ad_id: "ad-1",
    brand_id: "brand-1",
    name: "Sample Ad",
    description: "Test ad",
    cta_title: null,
    categories: [],
    languages: [],
    market_target: null,
    niches: [],
    product_category: null,
    full_transcription: null,
    avatar: null,
    cta_type: null,
    display_format: "image",
    link_url: null,
    live: true,
    publisher_platform: ["facebook"],
    started_running: 0,
    thumbnail: "https://example.com/thumb.jpg",
    image: "https://example.com/image.jpg",
    video: null,
    running_duration: { days: 14 },
    cards: [],
    ...overrides,
  };
}

test("getAdMediaType returns video for explicit video ads", () => {
  const ad = createAd({
    display_format: "video",
    image: null,
    video: "https://example.com/source.mp4",
  });

  assert.equal(getAdMediaType(ad), "video");
});

test("getAdMediaType falls back to video when a video URL exists", () => {
  const ad = createAd({
    display_format: "image",
    video: "https://example.com/source.mp4",
  });

  assert.equal(getAdMediaType(ad), "video");
});

test("getAdMediaType returns image when only image assets exist", () => {
  const ad = createAd();

  assert.equal(getAdMediaType(ad), "image");
});

test("getPrimaryCreativeUrl prefers video URLs for video ads", () => {
  const ad = createAd({
    display_format: "video",
    image: "https://example.com/poster.jpg",
    video: "https://example.com/source.mp4",
  });

  assert.equal(getPrimaryCreativeUrl(ad), "https://example.com/source.mp4");
});

test("getDisplayFormatValues keeps image-first defaults but supports all media", () => {
  assert.deepEqual(getDisplayFormatValues("image"), ["image"]);
  assert.deepEqual(getDisplayFormatValues("video"), ["video"]);
  assert.deepEqual(getDisplayFormatValues("all"), ["image", "video"]);
});
