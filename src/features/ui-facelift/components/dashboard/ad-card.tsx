"use client";

import { cn } from "@/shared/lib/utils";
import Image from "next/image";
import { getWinnerTier, getWinnerTierLabel } from "@/shared/types";
import type { ForeplayAd } from "@/shared/types/foreplay";
import { Sparkles, Search, ExternalLink } from "lucide-react";
import { daysToStatus, getStatusVars, timeAgo } from "@/features/ui-facelift/lib/theme";

interface AdCardProps {
  ad: ForeplayAd;
  analysisScore?: number;
  onAnalyze: (ad: ForeplayAd) => void;
  onDuplicate: (ad: ForeplayAd) => void;
  selected?: boolean;
}

export function AdCard({ ad, analysisScore, onAnalyze, onDuplicate, selected }: AdCardProps) {
  const days = ad.running_duration?.days ?? 0;
  const tier = getWinnerTier(days);
  const status = daysToStatus(days);
  const statusVars = getStatusVars(status);
  const imageUrl = ad.image || ad.thumbnail;
  const firstLine = ad.description?.split("\n")[0]?.slice(0, 60) ?? "";
  const platforms = ad.publisher_platform ?? [];

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg cursor-pointer transition-all duration-120 hover:-translate-y-px",
        selected 
          ? "bg-[var(--card-selected)] border-2 border-[var(--card-selected-border)]" 
          : "bg-card-bg border border-card-border hover:border-border-default hover:bg-card-hover"
      )}
    >
      {/* Thumbnail — 65% of card */}
      <div className="relative aspect-[4/5] bg-content-bg overflow-hidden shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={ad.name || "Ad creative"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 220px"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-text-tertiary">
            No image
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-120">
          <ActionButton
            onClick={(e) => { e.stopPropagation(); onAnalyze(ad); }}
            icon={<Search size={13} />}
            label="Analyze"
          />
          <ActionButton
            onClick={(e) => { e.stopPropagation(); onDuplicate(ad); }}
            icon={<Sparkles size={13} />}
            label="Duplicate"
            secondary
          />
        </div>

        {/* Winner tier badge */}
        {tier && (
          <div className="absolute top-2 left-2">
            <StatusBadge status={status} label={getWinnerTierLabel(tier)} />
          </div>
        )}

        {/* Analysis score */}
        {analysisScore !== undefined && (
          <div className="absolute top-2 right-2">
            <span className="bg-accent-muted text-accent border border-accent rounded-sm text-xs font-medium px-1.5 py-0.5 font-mono">
              {analysisScore}/10
            </span>
          </div>
        )}

        {/* Checkbox on hover (top-left, behind tier badge if present) */}
        {!tier && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-120">
            <input
              type="checkbox"
              aria-label="Select ad"
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 accent-accent cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="p-2.5 pb-3 flex flex-col gap-1.5">
        {/* Brand + external link */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {ad.avatar && (
              <Image
                src={ad.avatar}
                alt=""
                width={16}
                height={16}
                className="rounded-full"
                unoptimized
              />
            )}
            <span className="text-sm font-medium text-text-secondary overflow-hidden text-ellipsis whitespace-nowrap">
              {ad.name || "Unknown brand"}
            </span>
          </div>
          {ad.link_url && (
            <a
              href={ad.link_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Platform + status dot */}
        <div className="flex items-center gap-1.5">
          {platforms.length > 0 && (
            <span className="text-xs text-text-tertiary capitalize">
              {platforms[0]}
            </span>
          )}
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: statusVars.dot }}
          />
          <span
            className="text-xs font-mono"
            style={{ color: statusVars.text }}
          >
            {days}d
          </span>
        </div>

        {/* Ad copy preview */}
        {firstLine && (
          <p className="text-sm text-text-tertiary overflow-hidden text-ellipsis whitespace-nowrap leading-snug">
            {firstLine}
          </p>
        )}

        {/* Timestamp + tags */}
        <div className="flex items-center justify-between gap-2">
          {ad.started_running && (
            <span className="text-xs text-text-tertiary font-mono shrink-0">
              {timeAgo(ad.started_running)}
            </span>
          )}
          {ad.niches?.length > 0 && (
            <div className="flex items-center gap-1 overflow-hidden">
              {ad.niches.slice(0, 2).map((niche) => (
                <span
                  key={niche}
                  className="text-xs text-text-tertiary bg-content-bg border border-border-subtle rounded-sm px-1.5 py-px whitespace-nowrap"
                >
                  {niche}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* ---- Internal sub-components ---- */

function StatusBadge({ status, label }: { status: ReturnType<typeof daysToStatus>; label: string }) {
  const vars = getStatusVars(status);
  return (
    <span
      className="text-xs font-medium px-1.5 py-0.5 rounded-sm whitespace-nowrap"
      style={{
        background: vars.bg,
        color: vars.text,
      }}
    >
      {label}
    </span>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  secondary,
}: {
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
  secondary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 h-[30px] px-2.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-120",
        secondary 
          ? "border border-border-default bg-black/60 text-white" 
          : "border-none bg-accent text-white"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
