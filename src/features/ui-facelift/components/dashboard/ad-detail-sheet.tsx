"use client";

import Image from "next/image";
import { Sheet } from "@/shared/components/ui/sheet";
import type { ForeplayAd } from "@/shared/types/foreplay";
import { getWinnerTier, getWinnerTierLabel } from "@/shared/types";
import { timeAgo } from "@/features/ui-facelift/lib/theme";
import {
  ExternalLink, Play, Layers, Globe, CalendarDays,
  Clock, Tag, Languages, Target, Mic, MonitorPlay,
  Sparkles, Search,
} from "lucide-react";

// Platform colours (reused from ad-card)
const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2", instagram: "#E1306C", tiktok: "#010101",
  linkedin: "#0A66C2", youtube: "#FF0000", google: "#4285F4",
  messenger: "#0084FF",
};

function platformLabel(p: string) {
  const map: Record<string, string> = {
    facebook: "Facebook", instagram: "Instagram", messenger: "Messenger",
    audience_network: "Audience Network", tiktok: "TikTok",
    linkedin: "LinkedIn", youtube: "YouTube", google: "Google",
  };
  return map[p.toLowerCase()] ?? p.charAt(0).toUpperCase() + p.slice(1);
}

function extractDomain(url: string | null) {
  if (!url) return "";
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return url; }
}

function resolveImage(ad: ForeplayAd) {
  return ad.image ?? ad.thumbnail ?? null;
}

/** A labelled row in the detail sheet */
function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2.5 border-b border-border-subtle last:border-0">
      <div className="w-4 h-4 mt-0.5 shrink-0 text-text-tertiary">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-[0.06em] mb-0.5">{label}</p>
        <div className="text-[13px] text-text-primary">{value}</div>
      </div>
    </div>
  );
}

/** Pill tag */
function Pill({ label, color }: { label: string; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-content-bg border border-border-subtle text-text-secondary capitalize">
      {color && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />}
      {label}
    </span>
  );
}

interface AdDetailSheetProps {
  ad: ForeplayAd | null;
  onClose: () => void;
  onAnalyze?: (ad: ForeplayAd) => void;
  onDuplicate?: (ad: ForeplayAd) => void;
}

export function AdDetailSheet({ ad, onClose, onAnalyze, onDuplicate }: AdDetailSheetProps) {
  if (!ad) return null;

  const imageUrl     = resolveImage(ad);
  const domain       = extractDomain(ad.link_url);
  const days         = ad.running_duration?.days ?? 0;
  const tier         = getWinnerTier(days);
  const tierLabel    = getWinnerTierLabel(tier);
  const platforms    = ad.publisher_platform ?? [];
  const isVideo      = ad.display_format === "video" || !!ad.video;
  const isCarousel   = ad.display_format === "carousel" || (ad.cards?.length ?? 0) > 1;

  const startedDate = ad.started_running
    ? new Date(
        ad.started_running.toString().length === 10
          ? ad.started_running * 1000
          : ad.started_running
      ).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <Sheet open={!!ad} onClose={onClose} title="Ad Details" width="w-[420px]">
      <div className="flex flex-col gap-0 -mt-1">

        {/* ── Creative ──────────────────────────────────────────────────────── */}
        <div className="relative w-full aspect-[4/5] rounded-[10px] bg-content-bg overflow-hidden mb-4">
          {imageUrl ? (
            <Image src={imageUrl} alt={ad.name || "Ad creative"} fill
              className="object-cover" sizes="420px" unoptimized />
          ) : (
            <div className="flex items-center justify-center h-full text-text-tertiary opacity-30">
              <MonitorPlay size={32} />
            </div>
          )}

          {/* Play ring for video */}
          {isVideo && imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                <Play size={18} fill="white" stroke="none" className="ml-0.5" />
              </div>
            </div>
          )}

          {/* Winner tier badge */}
          {tierLabel && (
            <div className="absolute top-3 left-3">
              <span className="text-[11px] font-bold px-2 py-1 rounded-[6px] bg-[#064E3B] text-[#6EE7B7] tracking-wide">
                {tierLabel}
              </span>
            </div>
          )}

          {/* Live badge */}
          {ad.live && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-[6px] bg-winning-bg text-winning-text">
                <span className="w-1.5 h-1.5 rounded-full bg-winning animate-pulse" />
                Live now
              </span>
            </div>
          )}

          {/* Format */}
          {(isVideo || isCarousel) && (
            <div className="absolute bottom-3 left-3">
              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[5px] bg-black/60 text-white backdrop-blur-sm">
                {isCarousel ? <Layers size={11} /> : <Play size={11} />}
                {isCarousel ? `${ad.cards?.length ?? 2} slides` : "Video"}
              </span>
            </div>
          )}
        </div>

        {/* ── Brand row ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 mb-3">
          {ad.avatar ? (
            <Image src={ad.avatar} alt="" width={32} height={32}
              className="rounded-full shrink-0" unoptimized />
          ) : (
            <div className="w-8 h-8 rounded-full bg-content-bg border border-border-subtle flex items-center justify-center shrink-0">
              <span className="text-[12px] font-bold text-text-tertiary">
                {ad.name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-text-primary leading-snug truncate">{ad.name}</p>
            {domain && <p className="text-[11px] text-text-tertiary font-mono">{domain}</p>}
          </div>
          {ad.link_url && (
            <a href={ad.link_url} target="_blank" rel="noopener noreferrer"
              className="shrink-0 p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-content-bg transition-colors">
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* ── Action buttons ────────────────────────────────────────────────── */}
        {(onAnalyze || onDuplicate) && (
          <div className="flex gap-2 mb-4">
            {onAnalyze && (
              <button onClick={() => onAnalyze(ad)}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[10px] bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover transition-colors">
                <Search size={14} /> Analyze
              </button>
            )}
            {onDuplicate && (
              <button onClick={() => onDuplicate(ad)}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[10px] bg-content-bg border border-border-subtle text-text-secondary text-[13px] font-medium hover:border-border-default hover:text-text-primary transition-colors">
                <Sparkles size={14} /> Duplicate
              </button>
            )}
          </div>
        )}

        {/* ── Detail rows ───────────────────────────────────────────────────── */}
        <div className="rounded-[10px] border border-border-subtle px-3 divide-y divide-border-subtle">

          {/* Description */}
          {ad.description && (
            <div className="py-3">
              <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-[0.06em] mb-1.5">Ad Copy</p>
              <p className="text-[13px] text-text-primary leading-relaxed whitespace-pre-wrap">{ad.description}</p>
            </div>
          )}

          <Row icon={<Clock size={14} />} label="Running Duration"
            value={<span className="font-mono font-semibold">{days} days</span>} />

          <Row icon={<CalendarDays size={14} />} label="Started Running"
            value={startedDate ? <span>{startedDate} · <span className="text-text-tertiary">{timeAgo(ad.started_running)}</span></span> : null} />

          <Row icon={<Globe size={14} />} label="Publisher Platforms"
            value={platforms.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {platforms.map((p) => (
                  <Pill key={p} label={platformLabel(p)} color={PLATFORM_COLORS[p.toLowerCase()]} />
                ))}
              </div>
            ) : null} />

          <Row icon={<MonitorPlay size={14} />} label="Display Format"
            value={<span className="capitalize">{ad.display_format || "Image"}</span>} />

          {/* CTA */}
          {(ad.cta_title || ad.cta_type) && (
            <Row icon={<Target size={14} />} label="Call to Action"
              value={
                <div className="flex items-center gap-2">
                  {ad.cta_title && (
                    <span className="px-2 py-0.5 rounded-[5px] bg-content-bg border border-border-subtle text-[12px] font-semibold">
                      {ad.cta_title}
                    </span>
                  )}
                  {ad.cta_type && <span className="text-text-tertiary text-[12px]">({ad.cta_type})</span>}
                </div>
              } />
          )}

          {/* Link URL */}
          {ad.link_url && (
            <Row icon={<ExternalLink size={14} />} label="Destination URL"
              value={
                <a href={ad.link_url} target="_blank" rel="noopener noreferrer"
                  className="text-text-link hover:underline underline-offset-2 break-all">
                  {ad.link_url}
                </a>
              } />
          )}

          {/* Niches */}
          {ad.niches?.length > 0 && (
            <Row icon={<Tag size={14} />} label="Niches"
              value={
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {ad.niches.map((n) => <Pill key={n} label={n} />)}
                </div>
              } />
          )}

          {/* Categories */}
          {ad.categories?.length > 0 && (
            <Row icon={<Tag size={14} />} label="Categories"
              value={
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {ad.categories.map((c) => <Pill key={c} label={c} />)}
                </div>
              } />
          )}

          {/* Product category */}
          {ad.product_category && (
            <Row icon={<Tag size={14} />} label="Product Category" value={ad.product_category} />
          )}

          {/* Languages */}
          {ad.languages?.length > 0 && (
            <Row icon={<Languages size={14} />} label="Languages"
              value={
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {ad.languages.map((l) => <Pill key={l} label={l} />)}
                </div>
              } />
          )}

          {/* Market target */}
          {ad.market_target && (
            <Row icon={<Target size={14} />} label="Market Target" value={ad.market_target} />
          )}

          {/* Full transcription for video ads */}
          {ad.full_transcription && (
            <div className="py-3">
              <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-[0.06em] mb-1.5 flex items-center gap-1.5">
                <Mic size={12} /> Full Transcription
              </p>
              <p className="text-[12px] text-text-secondary leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                {ad.full_transcription}
              </p>
            </div>
          )}

          {/* Carousel cards */}
          {isCarousel && ad.cards?.length > 0 && (
            <div className="py-3">
              <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-[0.06em] mb-2 flex items-center gap-1.5">
                <Layers size={12} /> Carousel Slides · {ad.cards.length}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {ad.cards.map((card, i) => {
                  const c = card as Record<string, unknown>;
                  const imgSrc = (c.image ?? c.thumbnail) as string | undefined;
                  return (
                    <div key={i} className="relative w-16 h-16 shrink-0 rounded-[6px] bg-content-bg overflow-hidden border border-border-subtle">
                      {imgSrc ? (
                        <Image src={imgSrc} alt={`Slide ${i + 1}`} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[9px] text-text-tertiary">{i + 1}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ad / Brand IDs for reference */}
          <Row icon={<Tag size={14} />} label="Ad ID"
            value={<span className="font-mono text-[11px] text-text-tertiary break-all">{ad.ad_id || ad.id}</span>} />
        </div>
      </div>
    </Sheet>
  );
}
