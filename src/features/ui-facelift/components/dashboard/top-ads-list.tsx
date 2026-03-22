import { Star } from "lucide-react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import type { AdAnalysis, ImageAdAnalysis } from "@/shared/types";
import type { ForeplayAd } from "@/shared/types/foreplay";
import { isImageAnalysis } from "@/shared/lib/media";

// ─── Demo data (used when useDemoData=true or no real analyses exist) ─────────
const MOCK_ADS = [
  { id: 1, name: "Summer sale — carousel v2",    platform: "Meta",     color: "#1877F2", time: "2h ago", score: 92 },
  { id: 2, name: "UGC testimonial — hook test",  platform: "TikTok",   color: "#FF0050", time: "5h ago", score: 88 },
  { id: 3, name: "Product showcase — lifestyle", platform: "Meta",     color: "#1877F2", time: "1d ago", score: 74 },
  { id: 4, name: "Pain point — before/after",    platform: "LinkedIn", color: "#0A66C2", time: "2d ago", score: 71 },
  { id: 5, name: "Brand intro — 15s cut",        platform: "YouTube",  color: "#FF0000", time: "3d ago", score: 42 },
];

interface TopAdsListProps {
  /** Real analyses from useAppStore, keyed by adId */
  analyses?: Record<string, AdAnalysis>;
  /** Saved ads for thumbnail display */
  savedAds?: Record<string, ForeplayAd>;
  /** When true, always render mock data regardless of real data */
  useDemoData?: boolean;
  /** Called when a real ad row is clicked */
  onAdClick?: (adId: string, analysis: ImageAdAnalysis, name: string) => void;
}

function scoreClasses(score: number) {
  if (score >= 80) return "bg-winning-bg text-winning-text";
  if (score >= 60) return "bg-testing-bg text-testing-text";
  return "bg-losing-bg text-losing-text";
}

export function TopAdsList({ analyses = {}, savedAds = {}, useDemoData = false, onAdClick }: TopAdsListProps) {
  const hasRealData = !useDemoData && Object.keys(analyses).length > 0;

  // ── Empty state (no demo, no analyses yet) ────────────────────────────────
  if (!useDemoData && !hasRealData) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-10 h-10 rounded-full bg-content-bg flex items-center justify-center mb-3">
          <Star size={18} className="text-text-tertiary opacity-50" />
        </div>
        <p className="text-[13px] font-medium text-text-secondary">No ads analyzed yet</p>
        <p className="text-[11px] text-text-tertiary mt-1 max-w-[200px]">
          Analyze competitor ads from the Ad Feed to see rankings here.
        </p>
      </div>
    );
  }

  // ── Demo mode ─────────────────────────────────────────────────────────────
  if (!hasRealData) {
    return (
      <div className="flex flex-col gap-2.5">
        {MOCK_ADS.map((ad) => {
          const cls = scoreClasses(ad.score);
          return (
            <div
              key={ad.id}
              className="flex items-center gap-3 p-2.5 bg-content-bg rounded-md cursor-pointer transition-colors duration-100 hover:bg-[#EFEEEB]"
            >
              <div className={cn("w-11 h-11 rounded-sm shrink-0 flex items-center justify-center", cls)}>
                <Star size={20} className="opacity-50" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-text-primary truncate">{ad.name}</div>
                <div className="text-[11px] text-text-tertiary mt-0.5 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ad.color }} />
                    {ad.platform}
                  </span>
                  <span>&middot;</span>
                  <span className="shrink-0">{ad.time}</span>
                </div>
              </div>
              <span className={cn("font-mono text-xs font-medium px-2 py-0.5 rounded-full shrink-0", cls)}>
                {ad.score}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Real data — top 5 from analyses store, sorted by overallScore ─────────
  const topAds = Object.entries(analyses)
    .filter((entry): entry is [string, ImageAdAnalysis] => isImageAnalysis(entry[1]))
    .sort(([, a], [, b]) => b.overallScore - a.overallScore)
    .slice(0, 5)
    .map(([adId, analysis]) => {
      // Best available display name
      const name =
        analysis.conversionElements.copyAnalysis.headline ||
        analysis.conversionElements.hook.text ||
        `Ad ${adId.slice(0, 8)}`;

      // Secondary meta: layout + hook type
      const parts = [
        analysis.conversionElements.visualHierarchy.layoutType,
        analysis.conversionElements.hook.type,
      ].filter(Boolean);

      return { adId, name, meta: parts.join(" · "), score: analysis.overallScore };
    });

  return (
    <div className="flex flex-col gap-2.5">
      {topAds.map(({ adId, name, meta, score }) => {
        const cls = scoreClasses(score);
        const analysis = analyses[adId];
        return (
          <div
            key={adId}
            onClick={() => analysis && isImageAnalysis(analysis) && onAdClick?.(adId, analysis, name)}
            className="flex items-center gap-3 p-2.5 bg-content-bg rounded-md cursor-pointer transition-colors duration-100 hover:bg-[#EFEEEB]"
          >
            {(() => {
              const ad = savedAds[adId];
              const thumb = ad?.image || ad?.thumbnail;
              return thumb ? (
                <div className="w-11 h-11 rounded-[6px] shrink-0 overflow-hidden relative bg-content-bg">
                  <Image src={thumb} alt="" fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className={cn("w-11 h-11 rounded-[6px] shrink-0 flex items-center justify-center", cls)}>
                  <Star size={20} className="opacity-50" />
                </div>
              );
            })()}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-text-primary truncate">{name}</div>
              {meta && (
                <div className="text-[11px] text-text-tertiary mt-0.5 truncate">{meta}</div>
              )}
            </div>
            <span className={cn("font-mono text-xs font-medium px-2 py-0.5 rounded-full shrink-0", cls)}>
              {score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
