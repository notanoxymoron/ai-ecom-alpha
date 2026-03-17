"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BrandProfile, Competitor, UsageStats, AdAnalysis, GeneratedAd, UploadedAsset, ErrorLogEntry } from "@/shared/types";
import { defaultBrandProfile, normalizeBrandProfile } from "./brand-profile";

interface AppState {
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

  // Generated Ads
  generatedAds: GeneratedAd[];
  addGeneratedAd: (ad: GeneratedAd) => void;
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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      brandProfile: defaultBrandProfile,
      competitors: [],
      analyses: {},
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
          brandProfile: normalizeBrandProfile({ ...state.brandProfile, ...profile }),
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

      addGeneratedAd: (ad) =>
        set((state) => ({
          generatedAds: [ad, ...state.generatedAds],
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
            ...normalizeBrandProfile(state.brandProfile),
            [profileField]: [...state.brandProfile[profileField], asset],
          },
        })),

      removeBrandAsset: (assetId, profileField) =>
        set((state) => ({
          brandProfile: {
            ...normalizeBrandProfile(state.brandProfile),
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
    }),
    {
      name: "ai-ecom-engine-store",
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<AppState> | undefined;

        return {
          ...currentState,
          ...typedPersistedState,
          brandProfile: normalizeBrandProfile(typedPersistedState?.brandProfile),
        };
      },
      partialize: (state) => ({
        brandProfile: state.brandProfile,
        competitors: state.competitors,
        usage: state.usage,
        errorLogs: state.errorLogs,
        // Exclude generatedAds (base64 images) and analyses (large JSON) from localStorage
      }),
    }
  )
);
