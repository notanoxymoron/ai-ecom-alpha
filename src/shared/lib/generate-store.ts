"use client";

import { create } from "zustand";
import type { ForeplayAd } from "@/shared/types/foreplay";
import type { AdAnalysis } from "@/shared/types";
import type { GenerationOverrides } from "@/lib/generation/generator";

export type GenerateStep = "select" | "analyze" | "configure" | "generate" | "review";

export interface GeneratedVariation {
  id: string;
  imageDataUrl: string;
  label: string;
  aspectRatio: string;
  status: "generating" | "completed" | "approved" | "rejected";
  rejectionFeedback?: string;
}

interface GenerateSessionState {
  // Wizard state
  step: GenerateStep;
  selectedAd: ForeplayAd | null;
  localAnalysis: AdAnalysis | null;
  analyzing: boolean;
  generating: boolean;
  error: string | null;

  // Config
  aspectRatio: string;
  variationCount: number;
  overrides: GenerationOverrides;

  // Results
  variations: GeneratedVariation[];

  // Prompt editing
  editedPrompt: string | null; // null = use auto-generated per variation
  promptEditorOpen: boolean;

  // Actions
  setStep: (step: GenerateStep) => void;
  setSelectedAd: (ad: ForeplayAd | null) => void;
  setLocalAnalysis: (analysis: AdAnalysis | null) => void;
  setAnalyzing: (v: boolean) => void;
  setGenerating: (v: boolean) => void;
  setError: (error: string | null) => void;
  setAspectRatio: (ratio: string) => void;
  setVariationCount: (count: number) => void;
  setOverrides: (overrides: GenerationOverrides) => void;
  setVariations: (variations: GeneratedVariation[]) => void;
  setEditedPrompt: (prompt: string | null) => void;
  setPromptEditorOpen: (open: boolean) => void;
  resetSession: () => void;
}

const defaultOverrides: GenerationOverrides = {
  suggestedHeadline: "",
  suggestedCta: "",
  customColorScheme: "",
  customBranding: "",
  additionalInstructions: "",
};

export const useGenerateStore = create<GenerateSessionState>()((set) => ({
  step: "select",
  selectedAd: null,
  localAnalysis: null,
  analyzing: false,
  generating: false,
  error: null,
  aspectRatio: "4:5",
  variationCount: 3,
  overrides: { ...defaultOverrides },
  variations: [],
  editedPrompt: null,
  promptEditorOpen: false,

  setStep: (step) => set({ step }),
  setSelectedAd: (selectedAd) => set({ selectedAd }),
  setLocalAnalysis: (localAnalysis) => set({ localAnalysis }),
  setAnalyzing: (analyzing) => set({ analyzing }),
  setGenerating: (generating) => set({ generating }),
  setError: (error) => set({ error }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setVariationCount: (variationCount) => set({ variationCount }),
  setOverrides: (overrides) => set({ overrides }),
  setVariations: (variations) => set({ variations }),
  setEditedPrompt: (editedPrompt) => set({ editedPrompt }),
  setPromptEditorOpen: (promptEditorOpen) => set({ promptEditorOpen }),
  resetSession: () =>
    set({
      step: "select",
      selectedAd: null,
      localAnalysis: null,
      analyzing: false,
      generating: false,
      error: null,
      aspectRatio: "4:5",
      variationCount: 3,
      overrides: { ...defaultOverrides },
      variations: [],
      editedPrompt: null,
      promptEditorOpen: false,
    }),
}));
