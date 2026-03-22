"use client";

import { X } from "lucide-react";
import Image from "next/image";
import type { ImageAdAnalysis } from "@/shared/types";

interface AnalysisDetailModalProps {
  name: string;
  analysis: ImageAdAnalysis;
  onClose: () => void;
  imageUrl?: string;
  videoUrl?: string;
  description?: string;
  runningDays?: number;
  platforms?: string[];
}

function AnalysisSection({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={[
        "p-[14px] px-4 bg-card-bg border rounded-[14px]",
        accent ? "border-accent" : "border-card-border",
      ].join(" ")}
    >
      <p
        className={[
          "text-sm font-semibold tracking-tight mb-2.5",
          accent ? "text-accent" : "text-text-primary",
        ].join(" ")}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[13px] text-text-secondary leading-relaxed">
      <span className="text-text-primary font-medium">{label}: </span>
      {value}
    </p>
  );
}

function Tag({ children, variant }: { children: React.ReactNode; variant?: "mono" }) {
  return (
    <span
      className={`inline-flex items-center h-[22px] px-2 rounded font-medium text-[11px] text-text-secondary bg-content-bg border border-border-subtle ${variant === "mono" ? "font-mono" : "font-sans"}`}
    >
      {children}
    </span>
  );
}

export function AnalysisDetailModal({ name, analysis, onClose, imageUrl, videoUrl, description, runningDays, platforms }: AnalysisDetailModalProps) {
  const hasMedia = !!imageUrl || !!videoUrl;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={`bg-card-bg border border-border-default rounded-xl w-full ${hasMedia ? "max-w-[960px]" : "max-w-[560px]"} max-h-[90vh] overflow-y-auto`}
        style={{ animation: "modal-enter 180ms cubic-bezier(0.16, 1, 0.3, 1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card-bg border-b border-border-subtle px-5 h-12 flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-4">
            <span className="text-base font-medium text-text-primary truncate block">{name}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-md text-text-tertiary hover:bg-content-bg hover:text-text-secondary transition-all duration-120 shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className={`p-5 ${hasMedia ? "grid grid-cols-1 sm:grid-cols-2 gap-6" : "flex flex-col gap-3"}`}>
          {/* Left: Ad preview (image or video) */}
          {hasMedia && (
            <div className="flex flex-col gap-4">
              {videoUrl ? (
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-content-bg">
                  <video
                    src={videoUrl}
                    poster={imageUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : imageUrl ? (
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-content-bg">
                  <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />
                </div>
              ) : null}
              {description && (
                <p className="text-[13px] text-text-secondary leading-relaxed">{description}</p>
              )}
              <div className="text-xs text-text-tertiary font-mono">
                {runningDays ?? 0}d running
                {platforms && platforms.length > 0 && ` · ${platforms.join(", ")}`}
              </div>
            </div>
          )}

          {/* Right: Analysis content */}
          <div className="flex flex-col gap-3">
          {/* Score */}
          <div className="flex items-center gap-4 py-4 px-5 bg-card-bg border border-card-border hover:border-border-default rounded-[14px]">
            <span className="text-[28px] font-semibold text-accent font-mono">
              {analysis.overallScore}/10
            </span>
            <div>
              <p className="text-[13px] font-medium text-text-primary">Overall score</p>
              <p className="text-[11px] text-text-tertiary font-mono">
                Relevance: {analysis.relevanceToBrand.score}/10
              </p>
            </div>
          </div>

          {/* Hook */}
          <AnalysisSection title="Hook">
            <p className="text-[13px] font-medium text-text-primary leading-[1.5]">
              &ldquo;{analysis.conversionElements.hook.text}&rdquo;
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <Tag>{analysis.conversionElements.hook.type}</Tag>
              <Tag variant="mono">{analysis.conversionElements.hook.effectivenessScore}/10</Tag>
            </div>
            <p className="text-[12px] text-text-secondary mt-1.5 leading-relaxed">
              {analysis.conversionElements.hook.whyItWorks}
            </p>
          </AnalysisSection>

          {/* Visual */}
          <AnalysisSection title="Visual hierarchy">
            <MetaRow label="Layout" value={analysis.conversionElements.visualHierarchy.layoutType} />
            <MetaRow label="Focal point" value={analysis.conversionElements.visualHierarchy.focalPoint} />
            <MetaRow label="Flow" value={analysis.conversionElements.visualHierarchy.visualFlow} />
          </AnalysisSection>

          {/* Colors */}
          <AnalysisSection title="Color psychology">
            <div className="flex flex-wrap gap-2 mb-2">
              {analysis.conversionElements.colorPsychology.dominantColors.map((c) => (
                <div key={c} className="flex items-center gap-1.5">
                  <div
                    className="w-[14px] h-[14px] rounded-sm border border-border-default shrink-0"
                    style={{ backgroundColor: c }}
                  />
                  <span className="text-[11px] text-text-tertiary font-mono">{c}</span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              {analysis.conversionElements.colorPsychology.emotionalImpact}
            </p>
          </AnalysisSection>

          {/* Copy */}
          <AnalysisSection title="Copy analysis">
            <MetaRow label="Headline" value={analysis.conversionElements.copyAnalysis.headline} />
            <p className="text-[12px] text-text-secondary leading-relaxed mt-1">
              {analysis.conversionElements.copyAnalysis.bodyCopySummary}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {analysis.conversionElements.copyAnalysis.powerWords.map((w) => (
                <Tag key={w}>{w}</Tag>
              ))}
            </div>
          </AnalysisSection>

          {/* Replication brief */}
          <AnalysisSection title="Replication brief" accent>
            <div className="flex flex-col gap-2.5">
              <div>
                <p className="text-[11px] text-text-tertiary mb-1">Keep these elements</p>
                <ul className="pl-4 m-0">
                  {analysis.replicationBrief.mustKeepElements.map((el, i) => (
                    <li key={i} className="text-[12px] text-text-secondary leading-[1.8]">
                      {el}
                    </li>
                  ))}
                </ul>
              </div>
              <MetaRow
                label="Suggested headline"
                value={`"${analysis.replicationBrief.textToRender.headline}"`}
              />
              <MetaRow
                label="Suggested CTA"
                value={`"${analysis.replicationBrief.textToRender.cta}"`}
              />
            </div>
          </AnalysisSection>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modal-enter {
          from { transform: translateY(8px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
