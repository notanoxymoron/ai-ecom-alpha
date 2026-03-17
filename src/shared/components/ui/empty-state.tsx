import React, { type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

// ── Inline SVG illustrations ───────────────────────────────────────────────────

function IlluCompetitor() {
  return (
    <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-16">
      {/* Browser window */}
      <rect x="8" y="4" width="64" height="48" rx="6" fill="#F0EFFE" stroke="#6C5CE7" strokeWidth="1.5"/>
      <rect x="8" y="4" width="64" height="13" rx="6" fill="#E5E1FC"/>
      <rect x="8" y="11" width="64" height="6" fill="#E5E1FC"/>
      {/* Nav dots */}
      <circle cx="20" cy="11" r="2" fill="#6C5CE7" opacity="0.6"/>
      <circle cx="28" cy="11" r="2" fill="#6C5CE7" opacity="0.3"/>
      <circle cx="36" cy="11" r="2" fill="#6C5CE7" opacity="0.2"/>
      {/* Content lines */}
      <rect x="18" y="24" width="24" height="3" rx="1.5" fill="#6C5CE7" opacity="0.2"/>
      <rect x="18" y="31" width="36" height="2" rx="1" fill="#6C5CE7" opacity="0.12"/>
      <rect x="18" y="37" width="30" height="2" rx="1" fill="#6C5CE7" opacity="0.12"/>
      {/* Plus badge */}
      <circle cx="60" cy="52" r="10" fill="#6C5CE7"/>
      <path d="M60 47v10M55 52h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IlluSearch() {
  return (
    <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-16">
      {/* Search circle */}
      <circle cx="34" cy="30" r="18" fill="#F0EFFE" stroke="#6C5CE7" strokeWidth="1.5"/>
      {/* Magnifier handle */}
      <line x1="47" y1="43" x2="58" y2="56" stroke="#6C5CE7" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Inner lines — like results */}
      <rect x="26" y="25" width="16" height="2.5" rx="1.25" fill="#6C5CE7" opacity="0.35"/>
      <rect x="26" y="31" width="12" height="2.5" rx="1.25" fill="#6C5CE7" opacity="0.2"/>
      {/* Sparkle dots */}
      <circle cx="14" cy="12" r="2" fill="#6C5CE7" opacity="0.25"/>
      <circle cx="65" cy="18" r="1.5" fill="#6C5CE7" opacity="0.18"/>
      <circle cx="70" cy="42" r="2" fill="#6C5CE7" opacity="0.15"/>
    </svg>
  );
}

function IlluAds() {
  return (
    <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-16">
      {/* Ad card stack */}
      <rect x="22" y="12" width="44" height="32" rx="5" fill="#E5E1FC" stroke="#6C5CE7" strokeWidth="1.5"/>
      <rect x="14" y="18" width="44" height="32" rx="5" fill="#F0EFFE" stroke="#6C5CE7" strokeWidth="1.5"/>
      {/* Image placeholder */}
      <rect x="20" y="24" width="32" height="14" rx="3" fill="#6C5CE7" opacity="0.15"/>
      {/* Play triangle */}
      <path d="M33 28.5l8 4.5-8 4.5V28.5z" fill="#6C5CE7" opacity="0.5"/>
      {/* Text lines */}
      <rect x="20" y="42" width="20" height="2.5" rx="1.25" fill="#6C5CE7" opacity="0.25"/>
      <rect x="20" y="47" width="14" height="2" rx="1" fill="#6C5CE7" opacity="0.15"/>
    </svg>
  );
}

function IlluFilters() {
  return (
    <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-16">
      {/* Funnel */}
      <path d="M12 12h56l-22 22v16l-12-6V34L12 12z" fill="#F0EFFE" stroke="#6C5CE7" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Filter lines inside */}
      <line x1="25" y1="20" x2="55" y2="20" stroke="#6C5CE7" strokeWidth="1.5" opacity="0.3"/>
      {/* X badge */}
      <circle cx="58" cy="50" r="10" fill="#F6F5F2" stroke="#6C5CE7" strokeWidth="1.5"/>
      <path d="M54 46l8 8M62 46l-8 8" stroke="#6C5CE7" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IlluChart() {
  return (
    <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-16">
      {/* Chart area */}
      <rect x="10" y="8" width="60" height="44" rx="6" fill="#F0EFFE"/>
      {/* Bars */}
      <rect x="22" y="36" width="8" height="12" rx="2" fill="#6C5CE7" opacity="0.25"/>
      <rect x="34" y="26" width="8" height="22" rx="2" fill="#6C5CE7" opacity="0.4"/>
      <rect x="46" y="18" width="8" height="30" rx="2" fill="#6C5CE7" opacity="0.6"/>
      <rect x="58" y="22" width="8" height="26" rx="2" fill="#6C5CE7" opacity="0.5"/>
      {/* Trend line */}
      <path d="M22 40 Q38 24 58 26" stroke="#6C5CE7" strokeWidth="1.5" strokeDasharray="3 2" fill="none"/>
    </svg>
  );
}

const ILLUSTRATIONS: Record<string, () => React.ReactElement> = {
  competitor: IlluCompetitor,
  search: IlluSearch,
  ads: IlluAds,
  filters: IlluFilters,
  chart: IlluChart,
};

// ── EmptyState ─────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  /** Which illustration to show */
  illustration?: "competitor" | "search" | "ads" | "filters" | "chart";
  /** Main heading */
  title: string;
  /** Supporting description */
  description?: string;
  /** Optional CTA button rendered below the description */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  illustration = "ads",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Illus = ILLUSTRATIONS[illustration] ?? IlluAds;

  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center gap-3", className)}>
      <div className="mb-1 opacity-90">
        <Illus />
      </div>
      <p className="text-[14px] font-semibold text-text-primary tracking-tight max-w-[260px]">
        {title}
      </p>
      {description && (
        <p className="text-[13px] text-text-tertiary max-w-[300px] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
