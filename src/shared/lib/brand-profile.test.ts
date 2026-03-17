import test from "node:test";
import assert from "node:assert/strict";
import type { BrandProfile } from "../types/index.ts";
import { defaultBrandProfile, normalizeBrandProfile } from "./brand-profile.ts";

test("normalizeBrandProfile restores newly added fields onto older persisted profiles", () => {
  const legacyProfile = {
    brandName: "Legacy Brand",
    logoFiles: [],
    exampleAds: [],
    productImages: [],
  } as Partial<BrandProfile>;

  const normalized = normalizeBrandProfile(legacyProfile);

  assert.equal(normalized.brandName, "Legacy Brand");
  assert.deepEqual(normalized.videoReferences, []);
  assert.deepEqual(normalized.brandColors, defaultBrandProfile.brandColors);
  assert.deepEqual(normalized.fonts, defaultBrandProfile.fonts);
});
