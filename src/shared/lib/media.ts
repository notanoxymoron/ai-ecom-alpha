import type { ForeplayAd } from "../types/foreplay";
import type { AdAnalysis, ImageAdAnalysis, VideoAdAnalysis } from "../types";

export type AdMediaType = "image" | "video";
export type AdMediaFilter = AdMediaType | "all";

export function getAdMediaType(ad: Pick<ForeplayAd, "display_format" | "video">): AdMediaType {
  if (ad.display_format === "video" || Boolean(ad.video)) {
    return "video";
  }

  return "image";
}

export function getPrimaryCreativeUrl(
  ad: Pick<ForeplayAd, "display_format" | "video" | "image" | "thumbnail">
): string | null {
  if (getAdMediaType(ad) === "video") {
    return ad.video;
  }

  return ad.image || ad.thumbnail;
}

export function getDisplayFormatValues(filter: AdMediaFilter): AdMediaType[] {
  switch (filter) {
    case "all":
      return ["image", "video"];
    case "video":
      return ["video"];
    default:
      return ["image"];
  }
}

export function isVideoAnalysis(analysis: AdAnalysis | null | undefined): analysis is VideoAdAnalysis {
  return analysis?.mediaType === "video";
}

export function isImageAnalysis(analysis: AdAnalysis | null | undefined): analysis is ImageAdAnalysis {
  return analysis?.mediaType === "image";
}
