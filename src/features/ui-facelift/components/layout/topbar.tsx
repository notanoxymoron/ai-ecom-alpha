"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Search, BookMarked, BarChart3,
  Zap, Bot, AlertTriangle, Users, FlaskConical, TrendingUp, Settings,
} from "lucide-react";
import { useAppStore } from "@/shared/lib/store";
import { cn } from "@/shared/lib/utils";

// ── Page map — matches sidebar nav ─────────────────────────────────────────
const PAGE_MAP: Record<string, { label: string; icon: React.ElementType; description: string }> = {
  "/":              { label: "Feed",           icon: LayoutDashboard, description: "Competitor ad feed" },
  "/discover":      { label: "Discover",      icon: Search,          description: "Search 100M+ ads" },
  "/knowledge-base":{ label: "Brand",          icon: BookMarked,      description: "Brand & competitor data" },
  "/analytics":     { label: "Analytics",     icon: BarChart3,       description: "Performance & trends" },
  "/generate":      { label: "Generate",      icon: Zap,             description: "AI-powered ad variants" },
  "/openclaw":      { label: "Openclaw",      icon: Bot,             description: "AI intelligence" },
  "/errors":        { label: "Reports",       icon: AlertTriangle,   description: "Error logs" },
  "/settings":      { label: "Settings",      icon: Settings,        description: "API keys, preferences & data management" },
};

function useCurrentPage() {
  const pathname = usePathname();
  // exact match first, then prefix
  return (
    PAGE_MAP[pathname] ??
    Object.entries(PAGE_MAP)
      .filter(([k]) => k !== "/" && pathname.startsWith(k))
      .sort(([a], [b]) => b.length - a.length)[0]?.[1] ??
    null
  );
}

// ── Stat chip ───────────────────────────────────────────────────────────────

interface StatChipProps {
  href: string;
  icon: React.ElementType;
  value: number;
  label: string;
  accent?: boolean;
}

function StatChip({ href, icon: Icon, value, label, accent }: StatChipProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-[8px] border transition-colors duration-100 group",
        accent && value > 0
          ? "bg-accent/8 border-accent/20 hover:bg-accent/14 hover:border-accent/30"
          : "bg-content-bg border-border-subtle hover:border-border-default hover:bg-card-bg"
      )}
    >
      <Icon
        size={13}
        className={cn(
          "shrink-0",
          accent && value > 0 ? "text-accent" : "text-text-tertiary group-hover:text-text-secondary"
        )}
        strokeWidth={1.8}
      />
      <span className={cn(
        "text-[13px] font-semibold tabular-nums",
        accent && value > 0 ? "text-accent" : "text-text-primary"
      )}>
        {value.toLocaleString()}
      </span>
      <span className="text-[11px] text-text-tertiary group-hover:text-text-secondary transition-colors hidden sm:block">
        {label}
      </span>
    </Link>
  );
}

// ── Topbar ──────────────────────────────────────────────────────────────────

export function Topbar() {
  const page = useCurrentPage();
  const { competitors, analyses, generatedAds } = useAppStore();

  const competitorCount  = competitors.length;
  const analysisCount    = Object.keys(analyses).length;
  const generationCount  = generatedAds.length;

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-0 h-[57px] bg-card-bg border-b border-card-border lg:px-8 shrink-0">

      {/* ── Left: current page breadcrumb ─────────────────────────────────── */}
      <div className="flex items-center gap-2.5 min-w-0">
        {page && (
          <>
            <div className="flex items-center justify-center w-7 h-7 rounded-[7px] bg-content-bg border border-border-subtle shrink-0">
              <page.icon size={14} className="text-text-secondary" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <span className="text-[13px] font-semibold text-text-primary leading-none">{page.label}</span>
              <span className="hidden sm:inline text-[12px] text-text-tertiary ml-2 leading-none">{page.description}</span>
            </div>
          </>
        )}
      </div>

      {/* ── Right: live workspace stats ───────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0 ml-4">
        <StatChip
          href="/knowledge-base?tab=competitors"
          icon={Users}
          value={competitorCount}
          label={competitorCount === 1 ? "competitor" : "competitors"}
        />
        <StatChip
          href="/"
          icon={FlaskConical}
          value={analysisCount}
          label={analysisCount === 1 ? "analysed" : "analysed"}
        />
        <StatChip
          href="/generate"
          icon={TrendingUp}
          value={generationCount}
          label={generationCount === 1 ? "variation" : "variations"}
        />
      </div>
    </header>
  );
}
