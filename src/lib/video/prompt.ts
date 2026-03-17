import type { BrandProfile, VideoAdAnalysis } from "../../shared/types/index.ts";

interface BuildVideoGenerationPromptParams {
  analysis: VideoAdAnalysis;
  brandProfile: Pick<
    BrandProfile,
    "brandName" | "brandDescription" | "brandVoice" | "targetAudience" | "usps" | "brandColors" | "excludedThemes"
  >;
  aspectRatio: string;
  referenceVideoInsights?: string[];
}

function isNoneValue(value: string): boolean {
  return value.trim().toLowerCase() === "none";
}

function formatShotLine(shot: VideoAdAnalysis["replicationBrief"]["shotList"][number]): string {
  const overlayPart = shot.overlayText ? ` Overlay: "${shot.overlayText}".` : "";
  const audioPart = isNoneValue(shot.voiceoverLine)
    ? " No spoken voiceover in this shot."
    : ` Voiceover: "${shot.voiceoverLine}".`;

  return `- Shot ${shot.sequence} (${shot.durationSeconds}s): ${shot.visuals}.${overlayPart}${audioPart}`;
}

function formatSceneLine(scene: VideoAdAnalysis["sceneBreakdown"][number]): string {
  const textPart = scene.onScreenText ? ` Text: "${scene.onScreenText}".` : "";
  const audioPart = isNoneValue(scene.voiceover)
    ? " No spoken voiceover."
    : ` Voiceover: "${scene.voiceover}".`;

  return `- ${scene.startSeconds}s-${scene.endSeconds}s ${scene.goal}: ${scene.visuals}.${textPart}${audioPart} Transition: ${scene.transition}.`;
}

export function buildVideoGenerationPrompt({
  analysis,
  brandProfile,
  aspectRatio,
  referenceVideoInsights = [],
}: BuildVideoGenerationPromptParams): string {
  const audioStrategy = analysis.audioAnalysis.audioStrategy || "hybrid";
  const voiceoverStyle = analysis.audioAnalysis.voiceoverStyle || "none";
  const musicMood = analysis.audioAnalysis.musicMood || "none";
  const musicDescription = analysis.audioAnalysis.musicDescription || analysis.audioAnalysis.musicMood || "none";
  const captionStyle = analysis.audioAnalysis.captionStyle || "none";
  const pacing = analysis.audioAnalysis.pacing || "medium";

  const colorSummary = [
    `Primary: ${brandProfile.brandColors.primary}`,
    `Secondary: ${brandProfile.brandColors.secondary}`,
    `Accent: ${brandProfile.brandColors.accent}`,
  ].join(", ");

  const excludedThemes = brandProfile.excludedThemes.length > 0
    ? brandProfile.excludedThemes.join(", ")
    : "none specified";

  const referenceInsightSection = referenceVideoInsights.length > 0
    ? `\nBRAND VIDEO STYLE REFERENCES:\n${referenceVideoInsights.map((insight) => `- ${insight}`).join("\n")}\n`
    : "";

  const isMusicLed = audioStrategy === "music_led" || isNoneValue(voiceoverStyle);
  const audioRuleSection = isMusicLed
    ? `AUDIO RULES:
- Keep this recreation music-led, not voiceover-led
- Match the source music feel as closely as possible using fresh, non-infringing audio
- Music reference: ${musicDescription}
- Do not add voiceover unless a spoken line is explicitly required by the analysis
- Let text overlays, cuts, and performance carry the message over the music
`
    : `AUDIO RULES:
- Follow the source audio strategy: ${audioStrategy}
- Voiceover style to preserve: ${voiceoverStyle}
- Keep the music energy aligned with: ${musicDescription}
- Do not turn this into a silent montage unless the analysis says silent
`;

  return `Create a structured recreation of a high-performing competitor short-form video ad for ${brandProfile.brandName}.

This is NOT a direct frame-for-frame remix. Use the competitor analysis as inspiration for pacing, scene intent, and conversion structure while producing a fresh branded execution.

BRAND CONTEXT:
- Brand: ${brandProfile.brandName}
- Description: ${brandProfile.brandDescription || "No additional description provided"}
- Voice: ${brandProfile.brandVoice || "Professional"}
- Audience: ${brandProfile.targetAudience || "General consumers"}
- USPs: ${brandProfile.usps.join(", ") || "None provided"}
- Brand colors: ${colorSummary}

COMPETITOR VIDEO SUMMARY:
- Hook: ${analysis.videoSummary.hookSummary}
- Offer: ${analysis.videoSummary.offerSummary}
- CTA: ${analysis.videoSummary.ctaText}
- First three seconds: ${analysis.videoSummary.firstThreeSeconds}
- Pacing: ${pacing}
- Audio strategy: ${audioStrategy}
- Voiceover style: ${voiceoverStyle}
- Music mood: ${musicMood}
- Music description: ${musicDescription}
- Caption style: ${captionStyle}

CONVERSION ELEMENTS TO PRESERVE:
${analysis.replicationBrief.mustKeepElements.map((item) => `- ${item}`).join("\n")}

ELEMENTS YOU MAY ADAPT:
${analysis.replicationBrief.adaptableElements.map((item) => `- ${item}`).join("\n")}

SHOT LIST TO EXECUTE:
${analysis.replicationBrief.shotList.map((shot) => formatShotLine(shot)).join("\n")}

SCENE REFERENCE:
${analysis.sceneBreakdown.map((scene) => formatSceneLine(scene)).join("\n")}

BRANDED OPTIONS:
${analysis.replicationBrief.brandedHookOptions.map((hook) => `- Hook option: ${hook}`).join("\n")}
${analysis.replicationBrief.brandedCtaOptions.map((cta) => `- CTA option: ${cta}`).join("\n")}
${referenceInsightSection}
${audioRuleSection}
OUTPUT REQUIREMENTS:
- Aspect ratio: ${aspectRatio}
- Produce one polished short-form ad video
- Keep the structure conversion-focused and creator-friendly
- Do not use competitor branding, logos, or exact copy
- Do not include these themes: ${excludedThemes}`;
}
