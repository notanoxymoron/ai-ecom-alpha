import type { BrandProfile, VideoAdAnalysis } from "../../shared/types/index.ts";
import { VIDEO_GENERATION_DURATION_SECONDS } from "./config.ts";

interface BuildVideoGenerationPromptParams {
  analysis: VideoAdAnalysis;
  brandProfile: Pick<
    BrandProfile,
    "brandName" | "brandDescription" | "brandVoice" | "targetAudience" | "usps" | "brandColors" | "excludedThemes" | "logoFiles"
  >;
  aspectRatio: string;
  referenceVideoInsights?: string[];
  additionalInstructions?: string;
}

export interface VideoGenerationPromptSpec {
  prompt: string;
  negativePrompt: string;
  durationSeconds: number;
}

interface PromptBeat {
  label: "Hook" | "Proof/demo" | "CTA";
  timing: string;
  visuals: string;
  purpose: string;
}

function isNoneValue(value: string | null | undefined): boolean {
  return !value || value.trim().toLowerCase() === "none";
}

function cleanFragment(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/[`"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toSentence(value: string | null | undefined, fallback: string): string {
  const cleaned = cleanFragment(value);
  if (!cleaned) return fallback;
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

function clipWords(value: string, maxWords: number): string {
  const words = cleanFragment(value).split(" ").filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function clipChars(value: string, maxChars: number): string {
  const cleaned = cleanFragment(value);
  if (cleaned.length <= maxChars) return cleaned;
  const clipped = cleaned.slice(0, maxChars).trimEnd();
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 16 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}...`;
}

function firstMeaningful(values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (!isNoneValue(value)) {
      const cleaned = cleanFragment(value);
      if (cleaned) return cleaned;
    }
  }
  return null;
}

function collectVoiceoverCandidates(analysis: VideoAdAnalysis): string[] {
  return [
    ...analysis.replicationBrief.shotList.map((shot) => shot.voiceoverLine),
    ...analysis.sceneBreakdown.map((scene) => scene.voiceover),
  ]
    .filter((line): line is string => !isNoneValue(line))
    .map((line) => clipWords(line, 14));
}

function pickScene(
  analysis: VideoAdAnalysis,
  goals: string[]
): VideoAdAnalysis["sceneBreakdown"][number] | undefined {
  return analysis.sceneBreakdown.find((scene) => goals.includes(scene.goal.toLowerCase()));
}

function pickShot(
  analysis: VideoAdAnalysis,
  sequence: number
): VideoAdAnalysis["replicationBrief"]["shotList"][number] | undefined {
  return analysis.replicationBrief.shotList.find((shot) => shot.sequence === sequence);
}

function buildTextCards(analysis: VideoAdAnalysis): { hookCard: string | null; ctaCard: string | null } {
  const hookCandidates = [
    analysis.replicationBrief.brandedHookOptions[0],
    analysis.replicationBrief.shotList[0]?.overlayText,
    analysis.sceneBreakdown[0]?.onScreenText,
  ];
  const ctaCandidates = [
    analysis.replicationBrief.brandedCtaOptions[0],
    analysis.videoSummary.ctaText,
    analysis.replicationBrief.shotList[analysis.replicationBrief.shotList.length - 1]?.overlayText,
    analysis.sceneBreakdown[analysis.sceneBreakdown.length - 1]?.onScreenText,
  ];

  const toCard = (values: Array<string | null | undefined>): string | null => {
    for (const value of values) {
      if (isNoneValue(value)) continue;
      const cleaned = clipChars(cleanFragment(value), 42);
      if (cleaned && cleaned.split(" ").length <= 8) {
        return cleaned;
      }
    }
    return null;
  };

  return {
    hookCard: toCard(hookCandidates),
    ctaCard: toCard(ctaCandidates),
  };
}

function buildBeats(analysis: VideoAdAnalysis): PromptBeat[] {
  const hookScene = pickScene(analysis, ["hook", "problem"]) ?? analysis.sceneBreakdown[0];
  const proofScene =
    pickScene(analysis, ["demo", "proof", "offer", "bridge"]) ??
    analysis.sceneBreakdown[1] ??
    analysis.sceneBreakdown[analysis.sceneBreakdown.length - 1];
  const ctaScene =
    pickScene(analysis, ["cta", "offer"]) ??
    analysis.sceneBreakdown[analysis.sceneBreakdown.length - 1] ??
    proofScene ??
    hookScene;

  const hookShot = pickShot(analysis, 1);
  const proofShot = pickShot(analysis, 2);
  const ctaShot = analysis.replicationBrief.shotList[analysis.replicationBrief.shotList.length - 1];

  return [
    {
      label: "Hook",
      timing: "0-2s",
      visuals: firstMeaningful([
        hookShot?.visuals,
        hookScene?.visuals,
        analysis.videoSummary.firstThreeSeconds,
      ]) || "Scroll-stopping creator or product moment",
      purpose: clipChars(
        firstMeaningful([
          analysis.videoSummary.hookSummary,
          hookScene?.goal === "problem" ? hookScene.visuals : null,
          analysis.replicationBrief.mustKeepElements[0],
        ]) || "Land the problem or promise immediately",
        120
      ),
    },
    {
      label: "Proof/demo",
      timing: "2-6s",
      visuals: firstMeaningful([
        proofShot?.visuals,
        proofScene?.visuals,
        analysis.videoSummary.offerSummary,
      ]) || "Natural product use or proof sequence",
      purpose: clipChars(
        firstMeaningful([
          analysis.videoSummary.offerSummary,
          analysis.replicationBrief.mustKeepElements[1],
          analysis.replicationBrief.adaptableElements[0],
        ]) || "Show believable use, payoff, or proof",
        120
      ),
    },
    {
      label: "CTA",
      timing: "6-8s",
      visuals: firstMeaningful([
        ctaShot?.visuals,
        ctaScene?.visuals,
        analysis.videoSummary.ctaText,
      ]) || "Clean branded CTA finish",
      purpose: clipChars(
        firstMeaningful([
          analysis.videoSummary.ctaText,
          analysis.replicationBrief.brandedCtaOptions[0],
          analysis.replicationBrief.mustKeepElements[analysis.replicationBrief.mustKeepElements.length - 1],
        ]) || "Close with a clean purchase action",
        120
      ),
    },
  ];
}

function buildAudioSection(analysis: VideoAdAnalysis): string[] {
  const audioStrategy = cleanFragment(analysis.audioAnalysis.audioStrategy || "hybrid");
  const voiceoverStyle = cleanFragment(analysis.audioAnalysis.voiceoverStyle || "none");
  const musicMood = cleanFragment(analysis.audioAnalysis.musicMood || "none");
  const musicDescription = cleanFragment(
    analysis.audioAnalysis.musicDescription || analysis.audioAnalysis.musicMood || "none"
  );
  const voiceoverCandidates = collectVoiceoverCandidates(analysis);
  const shouldUseDialogue =
    !isNoneValue(audioStrategy) &&
    !["music_led", "silent"].includes(audioStrategy.toLowerCase()) &&
    !isNoneValue(voiceoverStyle);

  const lines = [
    `- Audio feel: ${clipChars(`${audioStrategy}, ${musicMood}, ${musicDescription}`, 100)}`,
  ];

  if (shouldUseDialogue && voiceoverCandidates[0]) {
    lines.push(`- Creator says: ${voiceoverCandidates[0]}`);
  } else {
    lines.push("- No spoken dialogue. Let music, action, and performance carry the message.");
  }

  return lines;
}

export function buildVideoNegativePrompt(
  analysis: VideoAdAnalysis,
  brandProfile: Pick<BrandProfile, "excludedThemes">
): string {
  const negativeItems = [
    "floating text",
    "subtitles",
    "karaoke captions",
    "lower thirds",
    "scrolling text",
    "watermarks",
    "competitor logos",
    "competitor packaging",
    "competitor product labels",
    "random background changes",
    "irrelevant props",
    "surreal inserts",
    "split screen collage",
    "duplicate people",
    "duplicate products",
    "warped hands",
    "warped faces",
    "rubbery limbs",
    "cgi sheen",
    "plastic skin",
    "jitter",
    "flicker",
  ];

  const captionStyle = cleanFragment(analysis.audioAnalysis.captionStyle);
  if (captionStyle && !isNoneValue(captionStyle)) {
    negativeItems.push(`${captionStyle} captions`);
  }

  for (const theme of brandProfile.excludedThemes) {
    const cleaned = cleanFragment(theme);
    if (cleaned) negativeItems.push(cleaned);
  }

  return Array.from(new Set(negativeItems)).join(", ");
}

export function buildVideoGenerationPromptSpec({
  analysis,
  brandProfile,
  aspectRatio,
  referenceVideoInsights = [],
  additionalInstructions,
}: BuildVideoGenerationPromptParams): VideoGenerationPromptSpec {
  const beats = buildBeats(analysis);
  const { hookCard, ctaCard } = buildTextCards(analysis);
  const audioSection = buildAudioSection(analysis);
  const referenceInsightLines = referenceVideoInsights
    .map((insight) => clipChars(cleanFragment(insight), 120))
    .filter(Boolean)
    .slice(0, 2);
  const excludedThemes = brandProfile.excludedThemes.length > 0
    ? brandProfile.excludedThemes.map((theme) => cleanFragment(theme)).filter(Boolean).join(", ")
    : "none specified";
  const uspSummary = brandProfile.usps.length > 0
    ? brandProfile.usps.slice(0, 3).map((usp) => clipChars(cleanFragment(usp), 70)).join(", ")
    : "none provided";
  const colorSummary = [
    `primary ${brandProfile.brandColors.primary}`,
    `secondary ${brandProfile.brandColors.secondary}`,
    `accent ${brandProfile.brandColors.accent}`,
  ].join(", ");

  const promptSections = [
    `Create one polished ${VIDEO_GENERATION_DURATION_SECONDS}-second short-form video ad for ${brandProfile.brandName}.`,
    "Fresh branded recreation of the competitor structure, not a literal frame-for-frame remake.",
    "",
    "Core direction:",
    `- Aspect ratio: ${aspectRatio}`,
    "- Prioritize natural UGC realism over exact source matching",
    "- Keep one creator or one product focus in one coherent environment",
    "- Use believable handheld or simple camera movement",
    "- Keep props, wardrobe, and background relevant to the product only",
    "- Keep the pacing conversion-focused and easy to follow",
    "",
    "Brand context:",
    `- Brand voice: ${clipChars(cleanFragment(brandProfile.brandVoice || "Professional"), 90)}`,
    `- Audience: ${clipChars(cleanFragment(brandProfile.targetAudience || "General consumers"), 90)}`,
    `- Description: ${clipChars(cleanFragment(brandProfile.brandDescription || "No additional description provided"), 120)}`,
    `- Key USPs: ${uspSummary}`,
    `- Brand colors: ${colorSummary}`,
    brandProfile.logoFiles.length > 0
      ? `- Brand logo: Provided as a reference image. Incorporate the ${brandProfile.brandName} logo naturally in the video, especially in the CTA/closing beat.`
      : `- Brand logo: Not provided. Use the brand name "${brandProfile.brandName}" as on-screen text where a logo would appear.`,
    "",
    "Narrative arc:",
    ...beats.map((beat) => `- ${beat.label} (${beat.timing}): ${toSentence(beat.visuals, "Grounded visual.")} Purpose: ${beat.purpose}.`),
    "",
    "Text treatment:",
    "- Use at most 2 anchored static text cards",
    hookCard
      ? `- Hook card in the top-safe area: ${hookCard}`
      : "- Skip hook text unless it is absolutely needed for clarity",
    ctaCard
      ? `- CTA card at the end or in the bottom-safe area: ${ctaCard}`
      : "- End on a clean CTA moment without floating captions",
    "- Never use floating words, subtitle-style captions, or moving typography",
    "",
    "Audio:",
    ...audioSection,
  ];

  if (referenceInsightLines.length > 0) {
    promptSections.push("", "Brand motion cues:", ...referenceInsightLines.map((insight) => `- ${insight}`));
  }

  promptSections.push(
    "",
    "Guardrails:",
    `- Preserve the hook, offer, and CTA intent from the source analysis: ${clipChars(cleanFragment(analysis.videoSummary.hookSummary), 110)} / ${clipChars(cleanFragment(analysis.videoSummary.offerSummary), 110)} / ${clipChars(cleanFragment(analysis.videoSummary.ctaText), 70)}`,
    `- Avoid these themes: ${excludedThemes}`,
    "- Do not use competitor branding, logos, or exact competitor copy"
  );

  const trimmedInstructions = additionalInstructions?.trim();
  if (trimmedInstructions) {
    promptSections.push(
      "",
      "Additional instructions (high priority — follow these closely):",
      trimmedInstructions
    );
  }

  return {
    prompt: promptSections.join("\n"),
    negativePrompt: buildVideoNegativePrompt(analysis, brandProfile),
    durationSeconds: VIDEO_GENERATION_DURATION_SECONDS,
  };
}

export function buildVideoGenerationPrompt(params: BuildVideoGenerationPromptParams): string {
  return buildVideoGenerationPromptSpec(params).prompt;
}
