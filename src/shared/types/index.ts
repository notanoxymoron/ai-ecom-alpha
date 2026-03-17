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
  videoReferences: BrandVideoReference[];
  niche: string;
  subNiches: string[];
  excludedThemes: string[];
}

export interface BrandVideoReference {
  id: string;
  name: string;
  url: string;
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

export interface ImageAdAnalysis {
  mediaType: "image";
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

export interface VideoAdAnalysis {
  mediaType: "video";
  overallScore: number;
  videoSummary: {
    hookSummary: string;
    offerSummary: string;
    ctaText: string;
    firstThreeSeconds: string;
    durationLabel: string;
  };
  sceneBreakdown: Array<{
    index: number;
    startSeconds: number;
    endSeconds: number;
    goal: string;
    visuals: string;
    onScreenText: string;
    voiceover: string;
    transition: string;
  }>;
  audioAnalysis: {
    audioStrategy: string;
    voiceoverStyle: string;
    musicMood: string;
    musicDescription: string;
    captionStyle: string;
    pacing: string;
  };
  replicationBrief: {
    mustKeepElements: string[];
    adaptableElements: string[];
    brandedHookOptions: string[];
    brandedCtaOptions: string[];
    shotList: Array<{
      sequence: number;
      visuals: string;
      overlayText: string;
      voiceoverLine: string;
      durationSeconds: number;
    }>;
  };
  relevanceToBrand: {
    score: number;
    reasoning: string;
  };
}

export type AdAnalysis = ImageAdAnalysis | VideoAdAnalysis;

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

export function getWinnerTierLabel(tier: WinnerTier | null): string {
  switch (tier) {
    case "proven":
      return "Proven Winner";
    case "strong":
      return "Strong Performer";
    case "potential":
      return "Potential Winner";
    default:
      return "New";
  }
}
