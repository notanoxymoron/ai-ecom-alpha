"use client";

import { useState } from "react";
import type { AdAnalysis } from "@/shared/types";
import type { ForeplayAd } from "@/shared/types/foreplay";
import { useAppStore } from "@/shared/lib/store";
import { X, Sparkles, Copy, Loader2 } from "lucide-react";
import Image from "next/image";

interface AnalysisModalProps {
  ad: ForeplayAd;
  onClose: () => void;
  onDuplicate: (ad: ForeplayAd, analysis: AdAnalysis) => void;
}

export function AnalysisModal({ ad, onClose, onDuplicate }: AnalysisModalProps) {
  const { brandProfile, analyses, setAnalysis, incrementUsage } = useAppStore();
  const existingAnalysis = analyses[ad.id];
  const [analysis, setLocalAnalysis] = useState<AdAnalysis | null>(existingAnalysis || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openaiKey, setOpenaiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("openai_api_key") || "";
    }
    return "";
  });

  const runAnalysis = async () => {
    if (!openaiKey) { setError("Please enter your OpenAI API key"); return; }
    localStorage.setItem("openai_api_key", openaiKey);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad, brandProfile, openaiApiKey: openaiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setLocalAnalysis(data.data);
      setAnalysis(ad.id, data.data);
      incrementUsage("adsAnalyzed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = ad.image || ad.thumbnail;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="bg-card-bg border border-border-default rounded-xl w-full max-w-[960px] max-h-[90vh] overflow-y-auto" style={{ animation: "modal-enter 180ms cubic-bezier(0.16, 1, 0.3, 1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 bg-card-bg border-b border-border-subtle px-5 h-12 flex items-center justify-between"
        >
          <span
            className="text-base font-medium text-text-primary"
          >
            Ad analysis
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-md cursor-pointer text-text-tertiary transition-all duration-120 hover:bg-content-bg hover:text-text-secondary"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div
          className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {/* Left: Ad preview */}
          <div className="flex flex-col gap-4">
            {imageUrl && (
              <div
                className="relative aspect-[4/5] rounded-lg overflow-hidden bg-content-bg"
              >
                <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />
              </div>
            )}
            {ad.description && (
              <p
                className="text-[13px] text-text-secondary leading-relaxed"
              >
                {ad.description}
              </p>
            )}
            <div
              className="text-xs text-text-tertiary font-mono"
            >
              {ad.running_duration?.days ?? 0}d running
              {ad.publisher_platform?.length > 0 && ` · ${ad.publisher_platform.join(", ")}`}
            </div>
          </div>

          {/* Right: Analysis panel */}
          <div className="flex flex-col gap-4">
            {!analysis && !loading && (
              <div className="flex flex-col gap-4">
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  Analyze this ad with GPT-4o Vision to understand why it converts.
                </p>
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                    OpenAI API key
                  </label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runAnalysis()}
                    className="h-9 px-3 bg-content-bg border border-border-subtle rounded-md text-text-primary text-[13px] font-mono outline-none transition-all duration-120 focus:border-border-default"
                  />
                </div>
                {error && (
                  <p className="text-[13px] text-losing">
                    {error}
                  </p>
                )}
                <PrimaryButton onClick={runAnalysis} icon={<Sparkles size={14} />}>
                  Analyze ad
                </PrimaryButton>
              </div>
            )}

            {loading && (
              <div
                className="flex flex-col items-center justify-center py-12 gap-3"
              >
                <Loader2
                  size={24}
                  className="text-accent animate-spin"
                />
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                  Analyzing with GPT-4o Vision...
                </p>
              </div>
            )}

            {analysis && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Score */}
                <div
                  className="flex items-center gap-4 py-4 px-5 bg-card-bg border border-card-border hover:border-border-default rounded-[14px]"
                >
                  <span
                    className="text-[28px] font-semibold text-accent font-mono"
                  >
                    {analysis.overallScore}/10
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-text-primary">
                      Overall score
                    </p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
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
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.6 }}>
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
                          className="w-[14px] h-[14px] rounded-sm border border-border-default shrink-0" style={{ backgroundColor: c }}
                        />
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                          {c}
                        </span>
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
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: 1.6, marginTop: "4px" }}>
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
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: "4px" }}>
                        Keep these elements
                      </p>
                      <ul style={{ paddingLeft: "16px", margin: 0 }}>
                        {analysis.replicationBrief.mustKeepElements.map((el, i) => (
                          <li key={i} style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                            {el}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <MetaRow label="Suggested headline" value={`"${analysis.replicationBrief.textToRender.headline}"`} />
                    <MetaRow label="Suggested CTA" value={`"${analysis.replicationBrief.textToRender.cta}"`} />
                  </div>
                </AnalysisSection>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {analysis && (
          <div
            className="border-t border-border-subtle py-3 px-6 flex justify-end gap-2"
          >
            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            <PrimaryButton
              onClick={() => onDuplicate(ad, analysis)}
              icon={<Copy size={14} />}
            >
              Duplicate this ad
            </PrimaryButton>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modal-enter {
          from { transform: translateY(8px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .api-key-input:focus {
          border-color: var(--border-strong) !important;
        }
        @media (max-width: 640px) {
          .modal-body { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ---- Sub-components ---- */

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
      className={["p-[14px] px-4 bg-card-bg border rounded-[14px]", accent ? "border-accent" : "border-card-border"].join(" ")}
    >
      <p
        className={["text-sm font-semibold tracking-tight mb-2.5", accent ? "text-accent" : "text-text-primary"].join(" ")}
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

function PrimaryButton({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 h-9 px-4.5 bg-accent text-white rounded-lg text-[13px] font-medium transition-all duration-120 hover:bg-accent-hover active:scale-[0.98] cursor-pointer"
    >
      {icon}
      {children}
    </button>
  );
}

function SecondaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 h-9 px-4.5 bg-card-bg text-text-secondary border border-border-subtle rounded-lg text-[13px] font-medium transition-all duration-120 hover:border-border-default hover:text-text-primary cursor-pointer"
    >
      {children}
    </button>
  );
}
