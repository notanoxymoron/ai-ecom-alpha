"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BrandProfile, Competitor, UsageStats, AdAnalysis, GeneratedAd, UploadedAsset, ErrorLogEntry } from "@/shared/types";
import type { ForeplayAd } from "@/shared/types/foreplay";

interface ApiKeys {
  openaiKey: string;
  claudeKey: string;
  openrouterKey: string;
  analysisProvider: "openai" | "claude" | "openrouter";
  foreplayKey: string;
  googleAiKey: string;
  apifyToken: string;
}

interface Preferences {
  defaultSort: "newest" | "oldest" | "running_duration";
  gridDensity: "compact" | "comfortable";
  theme: "contrast" | "dark" | "light";
}

const defaultBrandProfile: BrandProfile = {
  brandName: "PawLux Co.",
  brandUrl: "https://pawluxco.com",
  brandDescription:
    "We design premium, vet-informed dog products that prioritize durability, comfort, and modern aesthetics. From orthopedic beds to enrichment toys, every product is crafted with high-quality, non-toxic materials for dogs and the humans who share their space.",
  brandVoice: "Warm, confident, knowledgeable, and playful.",
  targetAudience:
    "Millennial and Gen-Z dog owners aged 25–40 who treat their dogs as family, invest in quality over quantity, care about product safety and sustainability, and prefer products that look good in their home.",
  usps: [
    "Vet-consulted designs built for breed-specific comfort and safety",
    "Premium, non-toxic materials (organic cotton, natural rubber, recycled fabrics)",
    "Aesthetic-forward products that blend into modern home interiors",
  ],
  productCategories: [
    "Orthopedic Dog Beds",
    "Enrichment Toys",
    "Elevated Feeders",
    "Travel Carriers",
  ],
  priceRange: "$35 – $200 per product",
  brandColors: { primary: "#1B2A2F", secondary: "#C8A96E", accent: "#E8DDD3" },
  fonts: { heading: "DM Sans Bold", body: "DM Sans Regular" },
  logoFiles: [],
  exampleAds: [],
  productImages: [],
  niche: "Premium Dog Accessories & Wellness",
  subNiches: [
    "Dog Comfort & Sleep",
    "Enrichment & Mental Stimulation",
    "Sustainable Pet Products",
  ],
  excludedThemes: [
    "Fear-based messaging about pet health",
    "Guilt-tripping pet owners",
    "Overly clinical/veterinary language",
    "Cheap or discount-focused messaging",
    "Humanizing dogs in an exaggerated or infantilizing way",
  ],
};

interface DiscoverSearch {
  query: string;
  niche: string;
  order: string;
  committed: { query: string; niche: string; order: string } | null;
}

interface AppState {
  // Discover search state (in-memory only, survives tab switches)
  discoverSearch: DiscoverSearch;
  setDiscoverSearch: (updates: Partial<DiscoverSearch>) => void;

  // Knowledge Base
  brandProfile: BrandProfile;
  competitors: Competitor[];
  setBrandProfile: (profile: Partial<BrandProfile>) => void;
  addCompetitor: (competitor: Competitor) => void;
  removeCompetitor: (id: string) => void;
  updateCompetitor: (id: string, updates: Partial<Competitor>) => void;

  // Ad Analyses (keyed by foreplay ad_id)
  analyses: Record<string, AdAnalysis>;
  setAnalysis: (adId: string, analysis: AdAnalysis) => void;

  // Saved Ads (keyed by foreplay ad id — for "Save to Analyze")
  savedAds: Record<string, ForeplayAd>;
  saveAd: (ad: ForeplayAd) => void;
  unsaveAd: (adId: string) => void;

  // Generated Ads
  generatedAds: GeneratedAd[];
  addGeneratedAd: (ad: GeneratedAd) => void;
  removeGeneratedAd: (id: string) => void;
  updateGeneratedAdStatus: (id: string, status: GeneratedAd["status"]) => void;

  // Usage Stats
  usage: UsageStats;
  incrementUsage: (key: keyof UsageStats, amount?: number) => void;

  // Brand Assets (stored as data URLs for local-only mode)
  addBrandAsset: (asset: UploadedAsset, profileField: "logoFiles" | "exampleAds" | "productImages") => void;
  removeBrandAsset: (assetId: string, profileField: "logoFiles" | "exampleAds" | "productImages") => void;

  // Error Logs
  errorLogs: ErrorLogEntry[];
  addErrorLog: (entry: Omit<ErrorLogEntry, "id" | "timestamp">) => void;
  clearErrorLogs: () => void;

  // API Keys
  apiKeys: ApiKeys;
  setApiKeys: (keys: Partial<ApiKeys>) => void;

  // Preferences
  preferences: Preferences;
  setPreferences: (prefs: Partial<Preferences>) => void;

  // Data Management
  clearAnalyses: () => void;
  resetUsage: () => void;
  resetStore: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      discoverSearch: { query: "", niche: "", order: "longest_running", committed: null },
      setDiscoverSearch: (updates) =>
        set((state) => ({ discoverSearch: { ...state.discoverSearch, ...updates } })),

      brandProfile: defaultBrandProfile,
      competitors: [],
      analyses: {},
      savedAds: {},
      generatedAds: [],
      usage: {
        foreplayCreditsUsed: 0,
        adsDiscovered: 0,
        adsAnalyzed: 0,
        adsGenerated: 0,
        generationCostUsd: 0,
      },

      setBrandProfile: (profile) =>
        set((state) => ({
          brandProfile: { ...state.brandProfile, ...profile },
        })),

      addCompetitor: (competitor) =>
        set((state) => ({
          competitors: [...state.competitors, competitor],
        })),

      removeCompetitor: (id) =>
        set((state) => ({
          competitors: state.competitors.filter((c) => c.id !== id),
        })),

      updateCompetitor: (id, updates) =>
        set((state) => ({
          competitors: state.competitors.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      setAnalysis: (adId, analysis) =>
        set((state) => ({
          analyses: { ...state.analyses, [adId]: analysis },
        })),

      saveAd: (ad) =>
        set((state) => ({
          savedAds: { ...state.savedAds, [ad.id]: ad },
        })),

      unsaveAd: (adId) =>
        set((state) => {
          const { [adId]: _, ...rest } = state.savedAds;
          return { savedAds: rest };
        }),

      addGeneratedAd: (ad) =>
        set((state) => ({
          generatedAds: [ad, ...state.generatedAds],
        })),

      removeGeneratedAd: (id) =>
        set((state) => ({
          generatedAds: state.generatedAds.filter((a) => a.id !== id),
        })),

      updateGeneratedAdStatus: (id, status) =>
        set((state) => ({
          generatedAds: state.generatedAds.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
        })),

      incrementUsage: (key, amount = 1) =>
        set((state) => ({
          usage: { ...state.usage, [key]: state.usage[key] + amount },
        })),

      addBrandAsset: (asset, profileField) =>
        set((state) => ({
          brandProfile: {
            ...state.brandProfile,
            [profileField]: [...state.brandProfile[profileField], asset],
          },
        })),

      removeBrandAsset: (assetId, profileField) =>
        set((state) => ({
          brandProfile: {
            ...state.brandProfile,
            [profileField]: state.brandProfile[profileField].filter(
              (a) => a.id !== assetId
            ),
          },
        })),

      errorLogs: [],
      addErrorLog: (entry) =>
        set((state) => ({
          errorLogs: [
            {
              ...entry,
              id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              timestamp: new Date().toISOString(),
            },
            ...state.errorLogs,
          ].slice(0, 200), // keep last 200 entries
        })),
      clearErrorLogs: () => set({ errorLogs: [] }),

      apiKeys: { openaiKey: "", claudeKey: "", openrouterKey: "", analysisProvider: "openai", foreplayKey: "", googleAiKey: "", apifyToken: "" },
      setApiKeys: (keys) =>
        set((state) => ({ apiKeys: { ...state.apiKeys, ...keys } })),

      preferences: { defaultSort: "newest", gridDensity: "comfortable", theme: "contrast" },
      setPreferences: (prefs) =>
        set((state) => ({ preferences: { ...state.preferences, ...prefs } })),

      clearAnalyses: () => set({ analyses: {} }),

      resetUsage: () =>
        set({ usage: { foreplayCreditsUsed: 0, adsDiscovered: 0, adsAnalyzed: 0, adsGenerated: 0, generationCostUsd: 0 } }),

      resetStore: () =>
        set({
          brandProfile: defaultBrandProfile,
          competitors: [],
          analyses: {},
          savedAds: {},
          generatedAds: [],
          usage: { foreplayCreditsUsed: 0, adsDiscovered: 0, adsAnalyzed: 0, adsGenerated: 0, generationCostUsd: 0 },
          apiKeys: { openaiKey: "", claudeKey: "", openrouterKey: "", analysisProvider: "openai", foreplayKey: "", googleAiKey: "", apifyToken: "" },
          preferences: { defaultSort: "newest", gridDensity: "comfortable", theme: "contrast" },
          errorLogs: [],
        }),
    }),
    {
      name: "ai-ecom-engine-store",
      partialize: (state) => ({
        brandProfile: state.brandProfile,
        competitors: state.competitors,
        analyses: state.analyses,
        savedAds: state.savedAds,
        generatedAds: state.generatedAds,
        usage: state.usage,
        errorLogs: state.errorLogs,
        apiKeys: state.apiKeys,
        preferences: state.preferences,
      }),
    }
  )
);
