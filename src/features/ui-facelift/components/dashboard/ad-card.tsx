"use client";

import { cn } from "@/shared/lib/utils";
import Image from "next/image";
import { getWinnerTier, getWinnerTierLabel } from "@/shared/types";
import type { ForeplayAd } from "@/shared/types/foreplay";
import {
  Sparkles, Search, ExternalLink, Play,
  Image as ImageIcon, Layers, Trophy, TrendingUp, Zap,
} from "lucide-react";
import { daysToStatus, getStatusVars, timeAgo } from "@/features/ui-facelift/lib/theme";

interface AdCardProps {
  ad: ForeplayAd;
  analysisScore?: number;
  onAnalyze: (ad: ForeplayAd) => void;
  onDuplicate: (ad: ForeplayAd) => void;
  /** Fires when user clicks anywhere on the card body (not action buttons) */
  onOpen?: (ad: ForeplayAd) => void;
  selected?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function extractDomain(url: string | null): string {
  if (!url) return "";
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return ""; }
}

function resolveImage(ad: ForeplayAd): string | null {
  return ad.image ?? ad.thumbnail ?? null;
}

type AdFormat = "image" | "video" | "carousel";
function resolveFormat(ad: ForeplayAd): AdFormat {
  if (ad.display_format === "video" || !!ad.video) return "video";
  if (ad.display_format === "carousel" || (ad.cards?.length ?? 0) > 1) return "carousel";
  return "image";
}

function platformLabel(p: string): string {
  const map: Record<string, string> = {
    facebook: "Facebook", instagram: "Instagram", messenger: "Messenger",
    audience_network: "Audience Network", tiktok: "TikTok",
    linkedin: "LinkedIn", youtube: "YouTube", google: "Google",
  };
  return map[p.toLowerCase()] ?? p.charAt(0).toUpperCase() + p.slice(1);
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2", instagram: "#E1306C", tiktok: "#010101",
  linkedin: "#0A66C2", youtube: "#FF0000", google: "#4285F4",
  messenger: "#0084FF",
};

/**
 * Tier badge config — solid colours so the badge is always readable
 * over any image regardless of brightness.
 *
 * proven    (30+ d) → deep green
 * strong    (14 d)  → deep amber
 * potential (7 d)   → deep indigo
 */
const TIER_BADGE: Record<
  "proven" | "strong" | "potential",
  { bg: string; text: string; Icon: typeof Trophy }
> = {
  proven:   { bg: "#064E3B", text: "#6EE7B7", Icon: Trophy },
  strong:   { bg: "#78350F", text: "#FCD34D", Icon: TrendingUp },
  potential:{ bg: "#1E1B4B", text: "#A5B4FC", Icon: Zap },
};

// ── Component ──────────────────────────────────────────────────────────────────

export function AdCard({ ad, analysisScore, onAnalyze, onDuplicate, onOpen, selected }: AdCardProps) {
  const days         = ad.running_duration?.days ?? 0;
  const tier         = getWinnerTier(days);
  const status       = daysToStatus(days);
  const statusVars   = getStatusVars(status);
  const imageUrl     = resolveImage(ad);
  const domain       = extractDomain(ad.link_url);
  const format       = resolveFormat(ad);
  const platforms    = ad.publisher_platform ?? [];
  const mainPlatform = platforms[0]?.toLowerCase() ?? "";
  const platColor    = PLATFORM_COLORS[mainPlatform] ?? "#78776F";
  const copyLine     = ad.description?.split("\n").find((l) => l.trim())?.slice(0, 90) ?? "";

  const tierConfig = tier ? TIER_BADGE[tier] : null;

  return (
    <article
      onClick={() => onOpen?.(ad)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[12px] cursor-pointer",
        "transition-all duration-150",
        selected
          ? "bg-accent-muted border-2 border-accent shadow-[0_0_0_3px_rgba(108,92,231,0.15)]"
          : "bg-card-bg border border-card-border hover:border-border-default hover:shadow-[0_2px_14px_rgba(0,0,0,0.08)] hover:-translate-y-px"
      )}
    >
      {/* ── Header: avatar · brand · days ────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 pt-3">
        {ad.avatar ? (
          <Image src={ad.avatar} alt="" width={18} height={18}
            className="rounded-full shrink-0 object-cover" unoptimized />
        ) : (
          <div className="w-[18px] h-[18px] rounded-full bg-content-bg border border-border-subtle shrink-0 flex items-center justify-center">
            <span className="text-[7px] font-bold text-text-tertiary">
              {ad.name?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          </div>
        )}

        <span className="flex-1 text-[12px] font-semibold text-text-primary truncate leading-none">
          {ad.name || "Unknown brand"}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: platColor }} />
          <span className="text-[11px] font-mono font-semibold leading-none" style={{ color: statusVars.text }}>
            {days}D
          </span>
        </div>

        {ad.link_url && (
          <a href={ad.link_url} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 p-0.5 text-text-tertiary hover:text-text-secondary transition-colors">
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      {/* ── Copy preview ──────────────────────────────────────────────────────── */}
      {copyLine && (
        <p className="px-3 pt-2 text-[11.5px] text-text-secondary leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {copyLine}
        </p>
      )}

      {/* ── Creative ──────────────────────────────────────────────────────────── */}
      <div className="relative mx-3 mt-2 rounded-[8px] bg-content-bg overflow-hidden aspect-[4/5]">
        {imageUrl ? (
          <Image src={imageUrl} alt={ad.name || "Ad creative"} fill
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

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <ActionButton onClick={(e) => { e.stopPropagation(); onAnalyze(ad); }}
            icon={<Search size={12} />} label="Analyze" />
          <ActionButton onClick={(e) => { e.stopPropagation(); onDuplicate(ad); }}
            icon={<Sparkles size={12} />} label="Duplicate" secondary />
        </div>

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
