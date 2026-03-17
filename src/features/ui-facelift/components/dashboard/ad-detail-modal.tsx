"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { ForeplayAd } from "@/shared/types/foreplay";
import { getWinnerTier, getWinnerTierLabel } from "@/shared/types";
import { timeAgo } from "@/features/ui-facelift/lib/theme";
import {
  X, ExternalLink, Play, Layers, Globe, CalendarDays,
  Clock, Tag, Languages, Target, Mic, MonitorPlay,
  Sparkles, Search, Trophy, TrendingUp, Zap,
} from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────────────────────

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

// ── Tier badge config ────────────────────────────────────────────────────────
const TIER_BADGE = {
  proven:    { bg: "#064E3B", text: "#6EE7B7", Icon: Trophy },
  strong:    { bg: "#78350F", text: "#FCD34D", Icon: TrendingUp },
  potential: { bg: "#1E1B4B", text: "#A5B4FC", Icon: Zap },
} as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-3 border-b border-border-subtle last:border-0">
      <div className="w-4 h-4 mt-0.5 shrink-0 text-text-tertiary">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-[0.06em] mb-1">{label}</p>
        <div className="text-[13px] text-text-primary">{value}</div>
      </div>
    </div>
  );
}

function Pill({ label, color }: { label: string; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-content-bg border border-border-subtle text-text-secondary capitalize">
      {color && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />}
      {label}
    </span>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdDetailModalProps {
  ad: ForeplayAd | null;
  onClose: () => void;
  onAnalyze?: (ad: ForeplayAd) => void;
  onDuplicate?: (ad: ForeplayAd) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdDetailModal({ ad, onClose, onAnalyze, onDuplicate }: AdDetailModalProps) {
  const open = !!ad;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!ad) return null;

  const imageUrl    = resolveImage(ad);
  const domain      = extractDomain(ad.link_url);
  const days        = ad.running_duration?.days ?? 0;
  const tier        = getWinnerTier(days);
  const tierLabel   = getWinnerTierLabel(tier);
  const tierCfg     = tier ? TIER_BADGE[tier] : null;
  const platforms   = ad.publisher_platform ?? [];
  const isVideo     = ad.display_format === "video" || !!ad.video;
  const isCarousel  = ad.display_format === "carousel" || (ad.cards?.length ?? 0) > 1;

  const startedDate = ad.started_running
    ? new Date(
        ad.started_running.toString().length === 10
          ? ad.started_running * 1000
          : ad.started_running
      ).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[3px]"
      />

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ad Details"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="relative bg-card-bg rounded-[16px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full max-w-[920px] max-h-[88vh] flex flex-col overflow-hidden pointer-events-auto">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
            <div className="flex items-center gap-2.5">
              {ad.avatar ? (
                <Image src={ad.avatar} alt="" width={24} height={24}
                  className="rounded-full shrink-0" unoptimized />
              ) : (
                <div className="w-6 h-6 rounded-full bg-content-bg border border-border-subtle flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-text-tertiary">
                    {ad.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </span>
                </div>
              )}
              <span className="text-[15px] font-semibold text-text-primary">{ad.name}</span>
              {domain && (
                <span className="text-[12px] text-text-tertiary font-mono hidden sm:block">· {domain}</span>
              )}
              {tierCfg && tierLabel && (
                <span
                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: tierCfg.bg, color: tierCfg.text }}
                >
                  <tierCfg.Icon size={9} />
                  {tierLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {ad.link_url && (
                <a href={ad.link_url} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-content-bg transition-colors">
                  <ExternalLink size={14} />
                </a>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-content-bg transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ── Body (2 columns) ────────────────────────────────────────── */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* ── LEFT — Creative + actions ─────────────────────────────── */}
            <div className="w-[340px] shrink-0 border-r border-border-subtle flex flex-col overflow-y-auto">
              {/* Creative */}
              <div className="relative w-full aspect-[4/5] bg-content-bg overflow-hidden">
                {imageUrl ? (
                  <Image src={imageUrl} alt={ad.name || "Ad creative"} fill
                    className="object-cover" sizes="340px" unoptimized />
                ) : (
                  <div className="flex items-center justify-center h-full text-text-tertiary opacity-30">
                    <MonitorPlay size={40} />
                  </div>
                )}

                {/* Video play ring */}
                {isVideo && imageUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-14 h-14 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                      <Play size={20} fill="white" stroke="none" className="ml-1" />
                    </div>
                  </div>
                )}

                {/* Live badge */}
                {ad.live && (
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-[6px] bg-winning-bg text-winning-text">
                      <span className="w-1.5 h-1.5 rounded-full bg-winning animate-pulse" />
                      Live
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

              {/* Quick stats strip */}
              <div className="flex items-center gap-0 border-b border-border-subtle divide-x divide-border-subtle shrink-0">
                <div className="flex-1 px-4 py-3 text-center">
                  <p className="text-[18px] font-bold text-text-primary">{days}</p>
                  <p className="text-[10px] text-text-tertiary uppercase tracking-wide mt-0.5">Days running</p>
                </div>
                {platforms.length > 0 && (
                  <div className="flex-1 px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {platforms.slice(0, 3).map((p) => (
                        <span key={p} className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[p.toLowerCase()] ?? "#999" }} title={platformLabel(p)} />
                      ))}
                    </div>
                    <p className="text-[10px] text-text-tertiary uppercase tracking-wide mt-1">Platforms</p>
                  </div>
                )}
                <div className="flex-1 px-4 py-3 text-center">
                  <p className="text-[13px] font-semibold text-text-primary capitalize">{ad.display_format || "Image"}</p>
                  <p className="text-[10px] text-text-tertiary uppercase tracking-wide mt-0.5">Format</p>
                </div>
              </div>

              {/* Action buttons */}
              {(onAnalyze || onDuplicate) && (
                <div className="flex gap-2 p-4 shrink-0">
                  {onAnalyze && (
                    <button onClick={() => onAnalyze(ad)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[10px] bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover transition-colors">
                      <Search size={13} /> Analyze
                    </button>
                  )}
                  {onDuplicate && (
                    <button onClick={() => onDuplicate(ad)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[10px] bg-content-bg border border-border-subtle text-text-secondary text-[13px] font-medium hover:border-border-default hover:text-text-primary transition-colors">
                      <Sparkles size={13} /> Duplicate
                    </button>
                  )}
                </div>
              )}

              {/* Carousel slides (shown in left col) */}
              {isCarousel && ad.cards?.length > 0 && (
                <div className="px-4 pb-4 shrink-0">
                  <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-[0.06em] mb-2 flex items-center gap-1.5">
                    <Layers size={11} /> Slides · {ad.cards.length}
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
            </div>

            {/* ── RIGHT — Detail info ───────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 min-w-0">

              {/* Ad Copy */}
              {ad.description && (
                <div className="mb-4 pb-4 border-b border-border-subtle">
                  <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-[0.06em] mb-2">Ad Copy</p>
                  <p className="text-[13px] text-text-primary leading-relaxed whitespace-pre-wrap">{ad.description}</p>
                </div>
              )}

              {/* Detail rows */}
              <div className="divide-y divide-border-subtle">
                <Row icon={<Clock size={14} />} label="Running Duration"
                  value={<span className="font-mono font-semibold">{days} days</span>} />

                <Row icon={<CalendarDays size={14} />} label="Started Running"
                  value={startedDate
                    ? <span>{startedDate} <span className="text-text-tertiary">· {timeAgo(ad.started_running)}</span></span>
                    : null} />

                <Row icon={<Globe size={14} />} label="Publisher Platforms"
                  value={platforms.length > 0
                    ? <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {platforms.map((p) => (
                          <Pill key={p} label={platformLabel(p)} color={PLATFORM_COLORS[p.toLowerCase()]} />
                        ))}
                      </div>
                    : null} />

                <Row icon={<MonitorPlay size={14} />} label="Display Format"
                  value={<span className="capitalize">{ad.display_format || "Image"}</span>} />

                {(ad.cta_title || ad.cta_type) && (
                  <Row icon={<Target size={14} />} label="Call to Action"
                    value={
                      <div className="flex items-center gap-2 flex-wrap">
                        {ad.cta_title && (
                          <span className="px-2 py-0.5 rounded-[5px] bg-content-bg border border-border-subtle text-[12px] font-semibold">
                            {ad.cta_title}
                          </span>
                        )}
                        {ad.cta_type && <span className="text-text-tertiary text-[12px]">({ad.cta_type})</span>}
                      </div>
                    } />
                )}

                {ad.link_url && (
                  <Row icon={<ExternalLink size={14} />} label="Destination URL"
                    value={
                      <a href={ad.link_url} target="_blank" rel="noopener noreferrer"
                        className="text-accent hover:underline underline-offset-2 break-all text-[12px]">
                        {ad.link_url}
                      </a>
                    } />
                )}

                {ad.niches?.length > 0 && (
                  <Row icon={<Tag size={14} />} label="Niches"
                    value={
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {ad.niches.map((n) => <Pill key={n} label={n} />)}
                      </div>
                    } />
                )}

                {ad.categories?.length > 0 && (
                  <Row icon={<Tag size={14} />} label="Categories"
                    value={
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {ad.categories.map((c) => <Pill key={c} label={c} />)}
                      </div>
                    } />
                )}

                {ad.product_category && (
                  <Row icon={<Tag size={14} />} label="Product Category" value={ad.product_category} />
                )}

                {ad.languages?.length > 0 && (
                  <Row icon={<Languages size={14} />} label="Languages"
                    value={
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {ad.languages.map((l) => <Pill key={l} label={l} />)}
                      </div>
                    } />
                )}

                {ad.market_target && (
                  <Row icon={<Target size={14} />} label="Market Target" value={ad.market_target} />
                )}

                {ad.full_transcription && (
                  <div className="py-3">
                    <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-[0.06em] mb-2 flex items-center gap-1.5">
                      <Mic size={12} /> Full Transcription
                    </p>
                    <p className="text-[12px] text-text-secondary leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto pr-1">
                      {ad.full_transcription}
                    </p>
                  </div>
                )}

                <Row icon={<Tag size={14} />} label="Ad ID"
                  value={<span className="font-mono text-[11px] text-text-tertiary break-all">{ad.ad_id || ad.id}</span>} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
