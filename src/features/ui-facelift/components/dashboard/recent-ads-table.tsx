"use client";

import Image from "next/image";
import { useMediaQuery } from "@/features/ui-facelift/lib/use-media-query";
import { StatusBadge } from "./status-badge";
import { ImageIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { GeneratedVariation } from "@/shared/lib/generate-store";

// ─── Demo data ────────────────────────────────────────────────────────────────
const MOCK_TABLE = [
  { id: "1", name: "Flash sale banner — variant A",    type: "1200×628 · Static image", platform: "Meta",     status: "approved" as const, score: 91,   time: "2h ago", cost: "$1.20", thumb: null },
  { id: "2", name: "UGC reaction hook — 9:16",         type: "1080×1920 · Video 15s",   platform: "TikTok",   status: "approved" as const, score: 87,   time: "4h ago", cost: "$2.10", thumb: null },
  { id: "3", name: "Competitor angle — social proof",  type: "1080×1080 · Carousel",    platform: "Meta",     status: "pending"  as const, score: null, time: "6h ago", cost: "$1.85", thumb: null },
  { id: "4", name: "Feature callout — decision maker", type: "1200×628 · Static image", platform: "LinkedIn", status: "rejected" as const, score: 38,   time: "1d ago", cost: "$1.40", thumb: null },
  { id: "5", name: "Retargeting reminder — urgency",   type: "1080×1920 · Video 30s",   platform: "YouTube",  status: "approved" as const, score: 83,   time: "2d ago", cost: "$2.45", thumb: null },
];

function mapStatus(s: GeneratedVariation["status"]): "approved" | "pending" | "rejected" {
  if (s === "approved") return "approved";
  if (s === "rejected") return "rejected";
  return "pending";
}

interface RecentAdsTableProps {
  variations?: GeneratedVariation[];
  useDemoData?: boolean;
}

type Row = {
  id: string; name: string; type: string; platform: string;
  status: "approved" | "pending" | "rejected";
  score: number | null; time: string; cost: string; thumb: string | null;
};

export function RecentAdsTable({ variations = [], useDemoData = false }: RecentAdsTableProps) {
  const isMobile   = useMediaQuery("(max-width: 767px)");
  const hasReal    = !useDemoData && variations.length > 0;

  // Empty state
  if (!useDemoData && !hasReal) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-10 h-10 rounded-full bg-content-bg flex items-center justify-center mb-3">
          <ImageIcon size={18} className="text-text-tertiary opacity-50" />
        </div>
        <p className="text-[13px] font-medium text-text-secondary">No ads generated yet</p>
        <p className="text-[11px] text-text-tertiary mt-1 max-w-[220px]">
          Head to Generate to create your first AI ad variation.
        </p>
      </div>
    );
  }

  const rows: Row[] = hasReal
    ? variations
        .filter((v) => v.status !== "generating")
        .slice().reverse().slice(0, 10)
        .map((v, i) => ({
          id:       v.id,
          name:     v.label || `Variation ${i + 1}`,
          type:     `${v.aspectRatio} · Generated`,
          platform: "Generated",
          status:   mapStatus(v.status),
          score:    null,
          time:     "—",
          cost:     "—",
          thumb:    v.imageDataUrl || null,
        }))
    : MOCK_TABLE;

  // Mobile
  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="p-3 bg-content-bg rounded-[10px] flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <Thumb src={row.thumb} size={40} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-text-primary truncate">{row.name}</div>
                <div className="text-[11px] text-text-tertiary mt-0.5 truncate">{row.type}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={row.status} label={row.status === "pending" ? "In review" : row.status.charAt(0).toUpperCase() + row.status.slice(1)} />
              <ScoreChip score={row.score} />
              <span className="font-mono text-xs text-text-secondary">{row.platform}</span>
              <span className="font-mono text-xs text-text-tertiary ml-auto">{row.cost}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop
  return (
    <div className="-mx-6 px-6 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider pb-3 border-b border-border-subtle w-[35%]">Creative</th>
            <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider pb-3 border-b border-border-subtle">Platform</th>
            <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider pb-3 border-b border-border-subtle">Status</th>
            <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider pb-3 border-b border-border-subtle">Score</th>
            <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider pb-3 border-b border-border-subtle">Generated</th>
            <th className="text-right text-[11px] font-medium text-text-tertiary uppercase tracking-wider pb-3 border-b border-border-subtle">Cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="cursor-pointer group hover:bg-content-bg transition-colors duration-100">
              <td className="py-3 border-b border-border-subtle group-last:border-none">
                <div className="flex items-center gap-2.5">
                  <Thumb src={row.thumb} size={36} />
                  <div>
                    <div className="text-[13px] font-medium text-text-primary">{row.name}</div>
                    <div className="text-[11px] text-text-tertiary mt-0.5">{row.type}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 border-b border-border-subtle group-last:border-none">
                <span className="font-mono text-xs text-text-secondary">{row.platform}</span>
              </td>
              <td className="py-3 border-b border-border-subtle group-last:border-none">
                <StatusBadge status={row.status} label={row.status === "pending" ? "In review" : row.status.charAt(0).toUpperCase() + row.status.slice(1)} />
              </td>
              <td className="py-3 border-b border-border-subtle group-last:border-none">
                <ScoreChip score={row.score} />
              </td>
              <td className="py-3 border-b border-border-subtle group-last:border-none">
                <span className="font-mono text-xs text-text-secondary">{row.time}</span>
              </td>
              <td className="py-3 border-b border-border-subtle group-last:border-none text-right">
                <span className="font-mono text-xs text-text-secondary">{row.cost}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Thumb({ src, size }: { src: string | null; size: number }) {
  const base = "rounded-sm overflow-hidden shrink-0 flex items-center justify-center bg-accent-muted text-accent";
  if (src) {
    return (
      <div className={cn(base, "relative")} style={{ width: size, height: size }}>
        <Image src={src} alt="" fill className="object-cover" unoptimized />
      </div>
    );
  }
  return (
    <div className={base} style={{ width: size, height: size }}>
      <ImageIcon size={Math.round(size * 0.4)} />
    </div>
  );
}

function ScoreChip({ score }: { score: number | null }) {
  if (score === null) return <span className="font-mono text-xs text-text-tertiary">—</span>;
  const cls = score >= 80 ? "text-winning-text" : score >= 60 ? "text-testing-text" : "text-losing-text";
  return <span className={cn("font-mono text-xs", cls)}>{score}</span>;
}
