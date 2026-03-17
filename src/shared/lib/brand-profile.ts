import type { BrandProfile } from "../types";

export const defaultBrandProfile: BrandProfile = {
  brandName: "",
  brandUrl: "",
  brandDescription: "",
  brandVoice: "",
  targetAudience: "",
  usps: [],
  productCategories: [],
  priceRange: "",
  brandColors: { primary: "#000000", secondary: "#333333", accent: "#FF5733" },
  fonts: { heading: "Inter Bold", body: "Inter Regular" },
  logoFiles: [],
  exampleAds: [],
  productImages: [],
  videoReferences: [],
  niche: "",
  subNiches: [],
  excludedThemes: [],
};

export function normalizeBrandProfile(profile?: Partial<BrandProfile> | null): BrandProfile {
  return {
    ...defaultBrandProfile,
    ...profile,
    brandColors: {
      ...defaultBrandProfile.brandColors,
      ...profile?.brandColors,
    },
    fonts: {
      ...defaultBrandProfile.fonts,
      ...profile?.fonts,
    },
    logoFiles: profile?.logoFiles ?? defaultBrandProfile.logoFiles,
    exampleAds: profile?.exampleAds ?? defaultBrandProfile.exampleAds,
    productImages: profile?.productImages ?? defaultBrandProfile.productImages,
    videoReferences: profile?.videoReferences ?? defaultBrandProfile.videoReferences,
    usps: profile?.usps ?? defaultBrandProfile.usps,
    productCategories: profile?.productCategories ?? defaultBrandProfile.productCategories,
    subNiches: profile?.subNiches ?? defaultBrandProfile.subNiches,
    excludedThemes: profile?.excludedThemes ?? defaultBrandProfile.excludedThemes,
  };
}
