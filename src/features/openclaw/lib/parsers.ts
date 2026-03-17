import type { ScrapedAd, LandingPageIntel } from "../types";
import type { ForeplayAd } from "@/shared/types/foreplay";

/**
 * Parse raw JSON result string from OpenClaw agent into ScrapedAd objects.
 */
export function parseScrapedAds(
  rawResult: string,
  crawlTaskId: string,
  source: "meta" | "tiktok"
): ScrapedAd[] {
  try {
    // Strip markdown code fences if present
    const cleaned = rawResult
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) return [];

    return parsed.map(
      (item: Record<string, unknown>, index: number): ScrapedAd => ({
        id: `${crawlTaskId}-${source}-${index}`,
        crawlTaskId,
        source,
        advertiserName: String(item.advertiserName || "Unknown"),
        adText: String(item.adText || ""),
        imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
        videoUrl: item.videoUrl ? String(item.videoUrl) : undefined,
        landingPageUrl: item.landingPageUrl
          ? String(item.landingPageUrl)
          : undefined,
        startDate: item.startDate ? String(item.startDate) : undefined,
        isActive: item.isActive !== false,
        platform: Array.isArray(item.platform)
          ? item.platform.map(String)
          : source === "meta"
            ? ["facebook"]
            : ["tiktok"],
        estimatedReach: item.estimatedReach
          ? String(item.estimatedReach)
          : undefined,
        engagement: item.engagement
          ? {
              likes:
                typeof (item.engagement as Record<string, unknown>).likes ===
                "number"
                  ? ((item.engagement as Record<string, unknown>).likes as number)
                  : undefined,
              shares:
                typeof (item.engagement as Record<string, unknown>).shares ===
                "number"
                  ? ((item.engagement as Record<string, unknown>).shares as number)
                  : undefined,
              comments:
                typeof (item.engagement as Record<string, unknown>).comments ===
                "number"
                  ? ((item.engagement as Record<string, unknown>).comments as number)
                  : undefined,
            }
          : undefined,
      })
    );
  } catch {
    console.error("Failed to parse OpenClaw scrape results:", rawResult);
    return [];
  }
}

/**
 * Parse raw JSON result string from OpenClaw into LandingPageIntel.
 */
export function parseLandingPageIntel(
  rawResult: string,
  url: string
): LandingPageIntel {
  try {
    const cleaned = rawResult
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    return {
      url,
      headline: String(parsed.headline || ""),
      subheadline: parsed.subheadline
        ? String(parsed.subheadline)
        : undefined,
      cta: String(parsed.cta || ""),
      offers: Array.isArray(parsed.offers)
        ? parsed.offers.map(String)
        : [],
      socialProof: Array.isArray(parsed.socialProof)
        ? parsed.socialProof.map(String)
        : [],
      pricePoints: Array.isArray(parsed.pricePoints)
        ? parsed.pricePoints.map(String)
        : [],
    };
  } catch {
    return {
      url,
      headline: "",
      cta: "",
      offers: [],
      socialProof: [],
      pricePoints: [],
      rawContent: rawResult,
    };
  }
}

/**
 * Convert a ScrapedAd to a ForeplayAd-compatible shape so it plugs into
 * the existing Analyze → Generate pipeline.
 */
export function scrapedAdToForeplayAd(ad: ScrapedAd): ForeplayAd {
  const startTimestamp = ad.startDate
    ? Math.floor(new Date(ad.startDate).getTime() / 1000)
    : Math.floor(Date.now() / 1000);

  const runningDays = ad.startDate
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(ad.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 1;

  return {
    id: ad.id,
    ad_id: ad.id,
    brand_id: "",
    name: ad.advertiserName,
    description: ad.adText,
    cta_title: null,
    categories: [],
    languages: [],
    market_target: null,
    niches: [],
    product_category: null,
    full_transcription: null,
    avatar: null,
    cta_type: null,
    display_format: ad.videoUrl ? "video" : "image",
    link_url: ad.landingPageUrl || null,
    live: ad.isActive,
    publisher_platform: ad.platform,
    started_running: startTimestamp,
    thumbnail: ad.imageUrl || null,
    image: ad.imageUrl || null,
    video: ad.videoUrl || null,
    running_duration: { days: runningDays },
    cards: [],
  };
}
