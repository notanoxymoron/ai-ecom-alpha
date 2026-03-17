"use client";

import { cn } from "@/shared/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { getWinnerTier, getWinnerTierColor, getWinnerTierLabel } from "@/shared/types";
import type { ForeplayAd } from "@/shared/types/foreplay";
import { formatDate } from "@/shared/lib/utils";
import { Sparkles, Search, ExternalLink, Clock, Play } from "lucide-react";

interface AdCardProps {
  ad: ForeplayAd;
  analysisScore?: number;
  onAnalyze: (ad: ForeplayAd) => void;
  onDuplicate: (ad: ForeplayAd) => void;
  /** Fires when user clicks anywhere on the card body (not action buttons) */
  onOpen?: (ad: ForeplayAd) => void;
  selected?: boolean;
}

export function AdCard({ ad, analysisScore, onAnalyze, onDuplicate }: AdCardProps) {
  const days = ad.running_duration?.days ?? 0;
  const tier = getWinnerTier(days);
  const imageUrl = ad.image || ad.thumbnail;
  const hasVideo = !!ad.video;
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Card className="overflow-hidden group hover:border-primary/30 transition-colors">
      {/* Image / Video */}
      <div className="relative aspect-[4/5] bg-muted overflow-hidden">
        {isPlaying && ad.video ? (
          <video
            src={ad.video}
            controls
            autoPlay
            className="w-full h-full object-cover"
            onClick={(e) => e.stopPropagation()}
          />
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={ad.name || "Ad"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
            unoptimized />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-text-tertiary">
            <ImageIcon size={22} opacity={0.25} />
            <span className="text-[10px] opacity-35">No preview</span>
          </div>
        )}

        {/* Video ring */}
        {format === "video" && imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-10 h-10 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
              <Play size={15} fill="white" stroke="none" className="ml-0.5" />
            </div>
          </div>
        )}

        {/* Overlay buttons — hidden while video is playing */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {hasVideo && (
              <Button size="sm" variant="outline" onClick={() => setIsPlaying(true)} className="bg-black/50">
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Play
              </Button>
            )}
            <Button size="sm" onClick={() => onAnalyze(ad)}>
              <Search className="h-3.5 w-3.5 mr-1.5" />
              Analyze
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDuplicate(ad)} className="bg-black/50">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Duplicate
            </Button>
          </div>
        )}

        {/* Persistent play badge when video exists and not playing */}
        {hasVideo && !isPlaying && (
          <div className="absolute bottom-2 right-2 bg-black/70 rounded-full p-1.5 pointer-events-none">
            <Play className="h-3 w-3 text-white fill-white" />
          </div>
        )}

        {/* ── Winner tier badge — solid, always readable ── */}
        {tierConfig && (
          <div className="absolute top-2 left-2">
            <span
              className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-[3px] rounded-[5px] tracking-wide whitespace-nowrap"
              style={{ background: tierConfig.bg, color: tierConfig.text }}
            >
              <tierConfig.Icon size={9} strokeWidth={2.5} />
              {getWinnerTierLabel(tier)}
            </span>
          </div>
        )}

        {/* Analysis score */}
        {analysisScore !== undefined && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[4px] bg-accent-muted text-accent border border-accent/20 backdrop-blur-sm">
              {analysisScore}/10
            </span>
          </div>
        )}

        {/* Format badge */}
        {format !== "image" && (
          <div className="absolute bottom-2 left-2">
            <span className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] bg-black/60 text-white backdrop-blur-sm">
              {format === "carousel" ? <Layers size={10} /> : <Play size={10} />}
              {format === "carousel" ? `${ad.cards?.length ?? 2} slides` : "Video"}
            </span>
          </div>
        )}

        {/* Live badge */}
        {ad.live && (
          <div className="absolute bottom-2 right-2">
            <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] bg-winning-bg text-winning-text">
              <span className="w-1.5 h-1.5 rounded-full bg-winning animate-pulse" />
              Live
            </span>
          </div>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <div className="px-3 pt-2 pb-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          {domain && (
            <span className="text-[10px] text-text-tertiary font-mono truncate flex-1 uppercase tracking-wide">
              {domain}
            </span>
          )}
          {ad.started_running && (
            <span className="text-[10px] text-text-tertiary font-mono shrink-0">
              {timeAgo(ad.started_running)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0">
            {mainPlatform && (
              <span className="text-[11px] font-medium truncate" style={{ color: platColor }}>
                {platformLabel(mainPlatform)}
              </span>
            )}
            {platforms.length > 1 && (
              <span className="text-[10px] text-text-tertiary">+{platforms.length - 1}</span>
            )}
          </div>
          {ad.cta_title && (
            <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-[5px] bg-content-bg border border-border-subtle text-text-secondary whitespace-nowrap">
              {ad.cta_title}
            </span>
          )}
        </div>

        {ad.niches?.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {ad.niches.slice(0, 2).map((niche) => (
              <span key={niche}
                className="text-[10px] text-text-tertiary bg-content-bg border border-border-subtle rounded-[4px] px-1.5 py-px capitalize">
                {niche}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function ActionButton({ onClick, icon, label, secondary }: {
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
  secondary?: boolean;
}) {
  return (
    <button onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 h-[30px] px-2.5 rounded-[7px]",
        "text-[12px] font-semibold cursor-pointer transition-all duration-120",
        secondary
          ? "border border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
          : "bg-accent text-white hover:bg-accent-hover border-none"
      )}>
      {icon}{label}
    </button>
  );
}
