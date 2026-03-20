import type { AdAnalysis, BrandProfile } from "@/shared/types";

interface GenerationResult {
  imageBase64: string;
  mimeType: string;
}

export interface GenerationOverrides {
  suggestedHeadline?: string;
  suggestedCta?: string;
  customColorScheme?: string;
  customBranding?: string;
  additionalInstructions?: string;
}

export function buildGenerationPrompt(
  analysis: AdAnalysis | null,
  brandProfile: BrandProfile,
  aspectRatio: string,
  variationIndex: number,
  totalVariations: number,
  overrides?: GenerationOverrides,
  adDescription?: string
): string {
  const isExactReplica = totalVariations <= 2 || variationIndex < 2;

  // Build text section — only include if user explicitly provided values
  const hasUserText = !!(overrides?.suggestedHeadline || overrides?.suggestedCta);
  let textSection = "";
  if (hasUserText) {
    textSection = "TEXT TO ADD TO THE IMAGE:\n";
    if (overrides?.suggestedHeadline) {
      textSection += `- Headline: "${overrides.suggestedHeadline}"\n`;
    }
    if (overrides?.suggestedCta) {
      textSection += `- CTA: "${overrides.suggestedCta}"\n`;
    }
  }

  const colorSection = overrides?.customColorScheme
    ? `COLOR SCHEME: ${overrides.customColorScheme}`
    : `BRAND COLORS:
- Primary color: ${brandProfile.brandColors.primary}
- Secondary color: ${brandProfile.brandColors.secondary}
- Accent color: ${brandProfile.brandColors.accent}`;

  const brandingSection = overrides?.customBranding
    ? `BRANDING: ${overrides.customBranding}`
    : `BRANDING:
- Brand name: ${brandProfile.brandName || "the brand"}
- Style: ${brandProfile.niche || "e-commerce"} brand with a ${brandProfile.brandVoice || "professional"} tone`;

  let additionalSection = "";
  if (overrides?.additionalInstructions) {
    additionalSection = `\nADDITIONAL INSTRUCTIONS:\n${overrides.additionalInstructions}\n`;
  }

  // Instruction about text — critical to prevent AI from inventing text
  const noExtraTextRule = hasUserText
    ? ""
    : "\nIMPORTANT TEXT RULE: Do NOT add, invent, or generate any text, headlines, CTAs, slogans, or copy that is not already visible in the reference image. Only replicate text that exists in the original. The only text change allowed is swapping the competitor brand name for the user's brand name.\n";

  // --- Direct mode (no analysis) ---
  if (!analysis) {
    if (isExactReplica) {
      return `I'm providing a reference competitor ad image. Create a PIXEL-PERFECT replica of this ad's visual design — same layout, composition, spacing, element sizes, text placement, and visual hierarchy.

THE ONLY CHANGES TO MAKE:
1. Remove any competitor brand name/logo and replace with: "${brandProfile.brandName || "my brand"}"
2. Adjust colors to match my brand palette (listed below)
3. Keep everything else IDENTICAL — same structure, same proportions, same visual flow

${adDescription ? `REFERENCE AD CONTEXT:\nThe reference ad says: "${adDescription}"` : "Study the reference image carefully and replicate its structure exactly."}
${noExtraTextRule}
${textSection}
${colorSection}

${brandingSection}
${additionalSection}
DO NOT include: ${brandProfile.excludedThemes.join(", ") || "none specified"}

Create a professional, polished ad image at ${aspectRatio} aspect ratio. The design must be an exact structural replica of the reference — only the branding and colors should differ. The text must be crisp and legible.`;
    } else {
      const variationNum = variationIndex - 1;
      return `I'm providing a reference competitor ad image. Create a new variation INSPIRED BY the reference ad but with creative differences. This is creative variation #${variationNum}.

KEEP SIMILAR: The overall feel, product presentation style, and general aesthetic of the reference ad.
CHANGE CREATIVELY: You may adjust colors, element sizes, layout positioning, visual hierarchy, and spacing. The result should look like a fresh take on the same concept — recognizably related but visually distinct.

${adDescription ? `REFERENCE AD CONTEXT:\nThe reference ad says: "${adDescription}"` : "Study the reference image and create a creative variation."}
${noExtraTextRule}
${textSection}
${colorSection}

${brandingSection}

IMPORTANT: Use the brand name "${brandProfile.brandName || "my brand"}" — remove any competitor branding entirely.
${additionalSection}
DO NOT include: ${brandProfile.excludedThemes.join(", ") || "none specified"}

Create a professional, polished ad image at ${aspectRatio} aspect ratio. The text must be crisp and legible. The design should look like it was made by a professional graphic designer.`;
    }
  }

  // --- Analyzed mode (with analysis) ---
  const brief = analysis.replicationBrief;
  const visual = analysis.conversionElements.visualHierarchy;

  if (isExactReplica) {
    return `Generate a PIXEL-PERFECT replica of the provided reference ad image for ${brandProfile.brandName || "the brand"}.

LAYOUT: Use the EXACT same ${visual.layoutType} layout with the focal point on ${visual.focalPoint}. Visual flow: ${visual.visualFlow}. Match proportions, spacing, and element sizes precisely.
${noExtraTextRule}
${textSection}
${colorSection}

${brandingSection}

THE ONLY CHANGES:
1. Remove competitor brand name/logo → replace with "${brandProfile.brandName || "the brand"}"
2. Adjust colors to match the brand palette above
3. Keep EVERYTHING ELSE identical — same structure, same composition, same visual hierarchy

CONVERSION ELEMENTS TO PRESERVE:
${brief.mustKeepElements.map((e) => `- ${e}`).join("\n")}
${additionalSection}
DO NOT include: ${brandProfile.excludedThemes.join(", ") || "none specified"}

Create a professional, polished ad image at ${aspectRatio} aspect ratio. The text must be crisp and legible. This should be a near-exact replica with only branding/colors swapped.`;
  } else {
    const variationNum = variationIndex - 1;
    return `Generate a creative variation (#${variationNum}) of the provided reference ad image for ${brandProfile.brandName || "the brand"}.

REFERENCE LAYOUT: The original uses a ${visual.layoutType} layout with focal point on ${visual.focalPoint}. Visual flow: ${visual.visualFlow}.
FOR THIS VARIATION: Keep the overall feel but creatively adjust colors, element sizes, layout positioning, and visual hierarchy to create a fresh take.
${noExtraTextRule}
${textSection}
${colorSection}

${brandingSection}

KEEP THESE CONVERSION ELEMENTS (but you may reposition them):
${brief.mustKeepElements.map((e) => `- ${e}`).join("\n")}

ADAPTATIONS TO APPLY:
${brief.suggestedModifications.map((m) => `- ${m}`).join("\n")}

IMPORTANT: Use brand name "${brandProfile.brandName || "the brand"}" — remove all competitor branding.
${additionalSection}
DO NOT include: ${brandProfile.excludedThemes.join(", ") || "none specified"}

Create a professional, polished ad image at ${aspectRatio} aspect ratio. The text must be crisp and legible. The design should look like a professional variation of the reference — recognizably related but visually distinct.`;
  }
}

export async function generateAd(
  analysis: AdAnalysis | null,
  brandProfile: BrandProfile,
  sourceImageUrl: string | null,
  aspectRatio: string = "4:5",
  variationIndex: number,
  totalVariations: number,
  googleApiKey: string,
  overrides?: GenerationOverrides,
  adDescription?: string,
  customPrompt?: string
): Promise<GenerationResult> {
  // Use custom prompt if provided, otherwise build automatically
  const prompt = customPrompt || buildGenerationPrompt(analysis, brandProfile, aspectRatio, variationIndex, totalVariations, overrides, adDescription);

  // Build content parts: text prompt + reference images
  const parts: Record<string, unknown>[] = [{ text: prompt }];

  // Add source competitor ad as reference if available
  if (sourceImageUrl) {
    try {
      const imgRes = await fetch(sourceImageUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
        parts.push({
          inline_data: { mime_type: mimeType, data: base64 },
        });
      }
    } catch {
      // Proceed without reference image if fetch fails
    }
  }

  // Add brand logo as reference if available
  for (const logo of brandProfile.logoFiles.slice(0, 2)) {
    if (logo.url.startsWith("data:")) {
      const [header, data] = logo.url.split(",");
      const mimeType = header.match(/data:(.*?);/)?.[1] || "image/png";
      parts.push({ inline_data: { mime_type: mimeType, data } });
    }
  }

  // Add example ads as reference
  for (const ad of brandProfile.exampleAds.slice(0, 3)) {
    if (ad.url.startsWith("data:")) {
      const [header, data] = ad.url.split(",");
      const mimeType = header.match(/data:(.*?);/)?.[1] || "image/png";
      parts.push({ inline_data: { mime_type: mimeType, data } });
    }
  }

  const body = {
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"],
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent`;

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 2s, 4s
      await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt - 1)));
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": googleApiKey,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      lastError = null;

      const candidates = data.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("No candidates returned from Gemini");
      }

      const responseParts = candidates[0].content?.parts;
      if (!responseParts) throw new Error("No content parts in Gemini response");

      for (const part of responseParts) {
        if (part.inlineData) {
          return {
            imageBase64: part.inlineData.data,
            mimeType: part.inlineData.mimeType || "image/png",
          };
        }
        if (part.inline_data) {
          return {
            imageBase64: part.inline_data.data,
            mimeType: part.inline_data.mimeType || part.inline_data.mime_type || "image/png",
          };
        }
      }

      throw new Error("No image generated in Gemini response");
    }

    const errBody = await res.text();
    lastError = new Error(`Gemini API error ${res.status}: ${errBody}`);

    // Only retry on transient errors (429, 503)
    if (res.status !== 429 && res.status !== 503) {
      throw lastError;
    }
  }

  throw lastError || new Error("Gemini API failed after retries");
}
