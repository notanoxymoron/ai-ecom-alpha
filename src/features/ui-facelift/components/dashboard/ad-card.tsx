"use client";

import React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Card } from "@/shared/components/ui/card";
import { getWinnerTier, getWinnerTierLabel, getWinnerTierColor } from "@/shared/types";
import type { ForeplayAd } from "@/shared/types/foreplay";
import { useAppStore } from "@/shared/lib/store";
import { getAdMediaType } from "@/shared/lib/media";
import { Play, ImageIcon, Layers, Trophy, TrendingUp, Zap, Bookmark, UserPlus, Clock, X, Sparkles, Copy, Check, Film } from "lucide-react";
import { createPortal } from "react-dom";

interface AdCardProps {
  ad: ForeplayAd;
  analysisScore?: number;
  onAnalyze: (ad: ForeplayAd) => void;
  onDuplicate: (ad: ForeplayAd) => void;
  onOpen?: (ad: ForeplayAd) => void;
  selected?: boolean;
  variant?: "discover" | "saved";
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AdCard({ ad, analysisScore, onAnalyze, onDuplicate, variant }: AdCardProps) {
  const days = ad.live && ad.started_running
    ? Math.floor((Date.now() - new Date(ad.started_running).getTime()) / 86_400_000)
    : (ad.running_duration?.days ?? 0);
  const tier = getWinnerTier(days);
  const imageUrl = ad.image || ad.thumbnail;
  const hasVideo = !!ad.video;
  const mediaType = getAdMediaType(ad);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [copyExpanded, setCopyExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);


  const isSaved = useAppStore((s) => ad.id in s.savedAds);
  const saveAd = useAppStore((s) => s.saveAd);
  const unsaveAd = useAppStore((s) => s.unsaveAd);
  const addCompetitor = useAppStore((s) => s.addCompetitor);
  const removeCompetitor = useAppStore((s) => s.removeCompetitor);
  const isCompetitor = useAppStore((s) => s.competitors.some((c) => c.foreplayBrandId === ad.brand_id));

  const format = ad.display_format ?? "image";
  const domain = ad.link_url
    ? (() => { try { return new URL(ad.link_url).hostname.replace(/^www\./, ""); } catch { return null; } })()
    : null;

  // Preload video duration on first hover
  const metaLoaded = useRef(false);
  useEffect(() => {
    if (!isHovered || !hasVideo || !ad.video || metaLoaded.current) return;
    metaLoaded.current = true;
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      setDuration(probe.duration);
      probe.remove();
    };
    probe.src = ad.video;
  }, [isHovered, hasVideo, ad.video]);

  const handlePlayClick = useCallback(() => {
    if (isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current.play();
    }
  }, []);

  // Truncate ad copy
  const adCopy = ad.description || "";
  const COPY_LIMIT = 120;
  const isCopyLong = adCopy.length > COPY_LIMIT;
  const displayCopy = copyExpanded ? adCopy : adCopy.slice(0, COPY_LIMIT);

  return (
    <Card
      className="overflow-hidden group hover:border-primary/30 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── 1. Brand header + Days live ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {ad.avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={ad.avatar}
              alt={ad.name || "Brand"}
              className="w-7 h-7 rounded-full object-cover shrink-0 border border-border-subtle"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-muted shrink-0 flex items-center justify-center text-[11px] font-semibold text-text-tertiary border border-border-subtle">
              {(ad.name || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-[13px] font-semibold text-text-primary truncate">
            {ad.name || "Unknown Brand"}
          </span>
        </div>

        <div className="relative flex items-center gap-1.5 shrink-0 group/days">
          {ad.live && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          )}
          <span className="text-[12px] font-semibold text-text-secondary tabular-nums cursor-default">
            {days}D
          </span>

          {/* Hover tooltip — start/end dates */}
          <div className="absolute top-full right-0 mt-1.5 z-30 hidden group-hover/days:block">
            <div className="bg-[#1a1a2e] text-white rounded-xl shadow-xl px-4 py-3 min-w-[180px] space-y-2 text-[13px]">
              {/* Arrow */}
              <div className="absolute -top-1.5 right-4 w-3 h-3 bg-[#1a1a2e] rotate-45" />
              <div className="flex items-center gap-2 relative">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="font-medium">
                  {new Date(ad.started_running).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                </span>
              </div>
              <div className="flex items-center gap-2 relative">
                <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
                <span className="font-medium">
                  {ad.live
                    ? "Still Running..."
                    : new Date(ad.started_running + days * 86400000).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                </span>
              </div>
              <div className="flex items-center gap-2 relative text-gray-300 border-t border-white/10 pt-2">
                <Clock size={14} className="shrink-0 opacity-70" />
                <span className="font-medium">{days} Days</span>
              </div>
            </div>
          </div>
        </div>

        {mediaType === "video" && (
          <div className="absolute bottom-2 right-2">
            <span className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] bg-black/60 text-white backdrop-blur-sm">
              <Film size={10} />
              Video
            </span>
          </div>
        )}
      </div>

      {/* ── Winner badge ────────────────────────────────────────────────── */}
      {tier && (
        <div className="px-3 pb-2">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getWinnerTierColor(tier)}`}>
            {tier === "proven" ? <Trophy size={11} /> : tier === "strong" ? <TrendingUp size={11} /> : <Zap size={11} />}
            {getWinnerTierLabel(tier)}
          </span>
        </div>
      )}

      {/* ── 2. Ad Copy ──────────────────────────────────────────────────────── */}
      {adCopy && (
        <div className="px-3 pb-2.5">
          <p className="text-[13px] leading-[1.45] text-text-primary whitespace-pre-line">
            {displayCopy}
            {isCopyLong && !copyExpanded && "…"}
          </p>
          {isCopyLong && (
            <button
              onClick={() => setCopyExpanded(!copyExpanded)}
              className="text-[12px] font-medium text-text-tertiary hover:text-text-primary mt-0.5 transition-colors"
            >
              {copyExpanded ? "Show less" : "Read More"}
            </button>
          )}
        </div>
      )}

      {/* ── 3. Media — natural aspect ratio ─────────────────────────────────── */}
      <div className="relative bg-muted overflow-hidden cursor-pointer" onClick={() => !isPlaying && setLightboxOpen(true)}>
        {isPlaying && ad.video ? (
          <video
            ref={videoRef}
            src={ad.video}
            controls
            className="w-full h-auto block"
            onClick={(e) => e.stopPropagation()}
            onLoadedMetadata={handleVideoLoaded}
            onEnded={() => setIsPlaying(false)}
          />
        ) : imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={ad.name || "Ad"}
              className="w-full h-auto block"
              loading="lazy"
            />
            {hasVideo && (
              <button
                onClick={(e) => { e.stopPropagation(); handlePlayClick(); }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/25 transition-transform hover:scale-110">
                  <Play size={18} fill="white" stroke="none" className="ml-0.5" />
                </div>
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-text-tertiary">
            <ImageIcon size={22} opacity={0.25} />
            <span className="text-[10px] opacity-35">No preview</span>
          </div>
        )}

        {/* Duration badge — visible on hover */}
        {hasVideo && !isPlaying && duration !== null && isHovered && (
          <div className="absolute top-2 right-2 z-10">
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[4px] bg-black/70 text-white backdrop-blur-sm">
              {formatDuration(duration)}
            </span>
          </div>
        )}

        {/* Carousel badge */}
        {format === "carousel" && !isPlaying && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] bg-black/60 text-white backdrop-blur-sm">
              <Layers size={10} />
              {ad.cards?.length ?? 2} slides
            </span>
          </div>
        )}
      </div>

      {/* ── 4. Headline / CTA ───────────────────────────────────────────────── */}
      {(ad.cta_title || domain) && (
        <div className="px-3 pt-2.5 pb-2 space-y-1.5">
          {ad.cta_title && (
            <p className="text-[14px] font-semibold leading-snug text-text-primary">
              {ad.cta_title}
            </p>
          )}
          {domain && (
            <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-[6px] bg-content-bg border border-border-subtle">
              <span className="text-[11px] text-text-tertiary font-mono uppercase tracking-wide truncate">
                {domain}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── 5. Bottom action panels ────────────────────────────────────────── */}
      {variant === "saved" ? (
        <div className="px-3 pt-1 pb-3 space-y-1.5">
          <button
            onClick={() => onAnalyze(ad)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-[8px] border text-[12px] font-medium transition-all duration-200 cursor-pointer ${
              analysisScore != null
                ? "border-accent bg-accent text-white hover:bg-accent-hover"
                : "border-border-subtle bg-content-bg text-text-secondary hover:bg-accent hover:border-accent hover:text-white"
            }`}
          >
            <Sparkles size={14} />
            {analysisScore != null ? "Analyzed" : "Analyze this Ad"}
          </button>
          <button
            onClick={() => {
              if (isCompetitor) {
                removeCompetitor(`comp-${ad.brand_id}`);
              } else {
                addCompetitor({
                  id: `comp-${ad.brand_id}`,
                  name: ad.name || "Unknown Brand",
                  url: ad.link_url || "",
                  foreplayBrandId: ad.brand_id,
                  facebookPageId: null,
                  avatar: ad.avatar,
                  notes: "",
                  trackingSince: new Date().toISOString(),
                  adCount: 0,
                });
              }
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-[8px] border text-[12px] font-medium transition-all duration-200 cursor-pointer ${
              isCompetitor
                ? "border-accent bg-accent text-white hover:bg-accent-hover"
                : "border-border-subtle bg-content-bg text-text-secondary hover:bg-accent hover:border-accent hover:text-white"
            }`}
          >
            <UserPlus size={14} />
            {isCompetitor ? "Remove Competitor" : "Add this Competitor"}
          </button>
          <button
            onClick={() => onDuplicate(ad)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-[8px] border border-border-subtle bg-content-bg text-text-secondary text-[12px] font-medium transition-all duration-200 cursor-pointer hover:bg-accent hover:border-accent hover:text-white"
          >
            <Copy size={14} />
            Duplicate this Ad
          </button>
        </div>
      ) : (
        <div className="px-3 pt-1 pb-3 space-y-1.5">
          <button
            onClick={() => {
              if (isSaved) {
                unsaveAd(ad.id);
              } else {
                saveAd(ad);
              }
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-[8px] border text-[12px] font-medium transition-all duration-200 cursor-pointer ${
              isSaved
                ? "bg-accent border-accent text-white hover:bg-accent-hover"
                : "border-border-subtle bg-content-bg text-text-secondary hover:bg-accent hover:border-accent hover:text-white"
            }`}
          >
            <Bookmark size={14} className={isSaved ? "fill-white" : ""} />
            {isSaved ? "Saved" : "Save to Analyze"}
          </button>
        </div>
      )}

      {/* ── Media lightbox ──────────────────────────────────────────────────── */}
      {lightboxOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Media content */}
          <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {hasVideo && ad.video ? (
              <video
                src={ad.video}
                controls
                autoPlay
                className="max-w-[90vw] max-h-[90vh] rounded-lg"
              />
            ) : imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageUrl}
                alt={ad.name || "Ad"}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              />
            ) : null}
          </div>
        </div>,
        document.body
      )}
    </Card>
  );
}
