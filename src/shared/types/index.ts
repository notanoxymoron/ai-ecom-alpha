export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  source: "analysis" | "generation" | "foreplay" | "other";
  message: string;
  details: string;
  context?: string; // e.g. ad name, brand, etc.
}

export interface BrandProfile {
  brandName: string;
  brandUrl: string;
  brandDescription: string;
  brandVoice: string;
  targetAudience: string;
  usps: string[];
  productCategories: string[];
  priceRange: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logoFiles: UploadedAsset[];
  exampleAds: UploadedAsset[];
  productImages: UploadedAsset[];
  niche: string;
  subNiches: string[];
  excludedThemes: string[];
}

export interface UploadedAsset {
  id: string;
  name: string;
  url: string;
  type: "logo" | "example_ad" | "product_image";
}

export interface Competitor {
  id: string;
  name: string;
  url: string;
  foreplayBrandId: string;
  facebookPageId: string | null;
  avatar: string | null;
  notes: string;
  trackingSince: string;
  adCount: number;
}

export interface AdAnalysis {
  overallScore: number;
  conversionElements: {
    hook: {
      text: string;
      type: string;
      effectivenessScore: number;
      whyItWorks: string;
    };
    visualHierarchy: {
      layoutType: string;
      focalPoint: string;
      visualFlow: string;
    };
    colorPsychology: {
      dominantColors: string[];
      emotionalImpact: string;
      contrastUsage: string;
    };
    socialProof: {
      present: boolean;
      type: string;
      placement: string;
    };
    cta: {
      text: string;
      placement: string;
      urgencyLevel: string;
    };
    copyAnalysis: {
      headline: string;
      bodyCopySummary: string;
      emotionalTriggers: string[];
      powerWords: string[];
    };
    productPresentation: {
      style: string;
      background: string;
      propsUsed: string;
    };
  };
  replicationBrief: {
    mustKeepElements: string[];
    adaptableElements: string[];
    suggestedModifications: string[];
    textToRender: {
      headline: string;
      subheadline: string;
      cta: string;
    };
  };
  relevanceToBrand: {
    score: number;
    reasoning: string;
  };
}

export interface GeneratedAd {
  id: string;
  sourceAdId: string;
  analysisId: string;
  imageUrl: string;
  prompt: string;
  aspectRatio: string;
  variationNumber: number;
  status: "generating" | "completed" | "approved" | "rejected";
  createdAt: string;
}

export interface UsageStats {
  foreplayCreditsUsed: number;
  adsDiscovered: number;
  adsAnalyzed: number;
  adsGenerated: number;
  generationCostUsd: number;
}

export type WinnerTier = "potential" | "strong" | "proven";

export function getWinnerTier(days: number): WinnerTier | null {
  if (days >= 30) return "proven";
  if (days >= 14) return "strong";
  if (days >= 7) return "potential";
  return null;
}

export function getWinnerTierColor(tier: WinnerTier | null): string {
  switch (tier) {
    case "proven":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "strong":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "potential":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    default:
      return "bg-zinc-800 text-zinc-500 border-zinc-700";
  }
}

/**
 * Human-readable label for each tier.
 * All labels are data-driven — they reflect how long the ad has
 * actually been running, not editorial opinion.
 *
 *  proven    = 30+ days — proven spend efficiency
 *  strong    = 14–29 days — strong early signal
 *  potential = 7–13 days — in its first active week
 */
export function getWinnerTierLabel(tier: WinnerTier | null): string {
  switch (tier) {
    case "proven":   return "Proven Winner";   // 30+ days running
    case "strong":   return "Strong Signal";   // 14–29 days
    case "potential": return "Early Traction"; // 7–13 days
    default:         return "";
  }
}
