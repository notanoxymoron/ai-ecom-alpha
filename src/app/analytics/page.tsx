"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { fadeUp, staggerContainer } from "@/features/ui-facelift/lib/animations";
import { KPICard } from "@/features/ui-facelift/components/dashboard/kpi-card";
import { KPISparkline } from "@/features/ui-facelift/components/dashboard/kpi-sparkline";
import { KPIBarChart } from "@/features/ui-facelift/components/dashboard/kpi-bar-chart";
import { KPIRingGauge } from "@/features/ui-facelift/components/dashboard/kpi-ring-gauge";
import { KPITrendLine } from "@/features/ui-facelift/components/dashboard/kpi-trend-line";
import { Panel } from "@/features/ui-facelift/components/dashboard/panel";
import { PerformanceChart } from "@/features/ui-facelift/components/dashboard/performance-chart";
import { TopAdsList } from "@/features/ui-facelift/components/dashboard/top-ads-list";
import { RecentAdsTable } from "@/features/ui-facelift/components/dashboard/recent-ads-table";
import { useAppStore } from "@/shared/lib/store";
import { useGenerateStore } from "@/shared/lib/generate-store";
import { Box, DollarSign, Activity, Star, ChevronRight, BarChart3, LineChart, FlaskConical } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// ─── Demo / placeholder data ──────────────────────────────────────────────────
const DEMO_COMPETITORS_COUNT = 24;
const DEMO_ADS_ANALYZED      = 1847;
const DEMO_ADS_GENERATED     = 312;
const DEMO_COST_USD          = 482.60;

export default function AnalyticsDashboard() {
  const [useDemoData, setUseDemoData] = useState(false);

  // ── Real store data ──────────────────────────────────────────────────────────
  const { competitors, analyses, usage } = useAppStore();
  const variations = useGenerateStore((s) => s.variations);

  // ── KPI values — real or demo ────────────────────────────────────────────────
  const competitorsCount = useDemoData ? DEMO_COMPETITORS_COUNT : competitors.length;
  const adsAnalyzed      = useDemoData ? DEMO_ADS_ANALYZED      : usage.adsAnalyzed;
  const adsGenerated     = useDemoData ? DEMO_ADS_GENERATED     : usage.adsGenerated;
  const costUsd          = useDemoData ? DEMO_COST_USD          : usage.generationCostUsd;

  // ── Approval rate (for KPI ring gauge label) ─────────────────────────────────
  const completed     = variations.filter(v => v.status === "completed" || v.status === "approved");
  const approved      = variations.filter(v => v.status === "approved");
  const approvalRate  = useDemoData
    ? 52
    : (completed.length > 0 ? Math.round((approved.length / completed.length) * 100) : 0);

  // ── PerformanceChart derived values ──────────────────────────────────────────
  const perfApprovalRate  = useDemoData ? 78  : approvalRate;
  const perfTotalGen      = useDemoData ? 312 : adsGenerated;
  const perfTotalApproved = useDemoData ? 243 : approved.length;
  const perfSpend         = useDemoData ? 482.60 : costUsd;
  const perfCostPerAd     = perfTotalGen > 0 ? perfSpend / perfTotalGen : 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="mx-auto"
    >
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[0.02em] flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-accent" />
            Analytics
          </h1>
          <p className="text-[13px] text-text-secondary mt-0.5 tracking-wide">
            Track your ad engine usage and performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Demo data toggle */}
          <button
            onClick={() => setUseDemoData((v) => !v)}
            title={useDemoData ? "Showing demo data — click to use real data" : "Click to preview with demo data"}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium border transition-all duration-100",
              useDemoData
                ? "bg-accent-muted border-accent text-accent"
                : "bg-card-bg border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"
            )}
          >
            <FlaskConical size={12} />
            {useDemoData ? "Demo on" : "Demo data"}
          </button>

          <select className="bg-card-bg border border-border-subtle rounded-sm px-3 py-1.5 text-xs font-medium text-text-secondary cursor-pointer hover:border-border-default transition-colors">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-card-bg text-text-secondary border border-border-subtle rounded-sm text-xs font-medium transition-colors hover:border-border-default hover:text-text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filters
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-card-bg text-text-secondary border border-border-subtle rounded-sm text-xs font-medium transition-colors hover:border-border-default hover:text-text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
        </div>
      </motion.div>

      {/* ── KPI cards ───────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-5">

        <KPICard label="Competitors tracked" icon={Activity} iconVariant="purple">
          <div className="font-mono text-[28px] font-semibold tracking-[-0.03em] leading-none text-text-primary mb-2">
            {competitorsCount}
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium font-mono px-2 py-0.5 rounded-full bg-winning-bg text-winning-text">
              +{useDemoData ? 3 : Math.max(0, competitors.length)}
            </span>
            <span className="text-[10px] text-text-tertiary ml-1.5">this week</span>
          </div>
          <KPISparkline />
        </KPICard>

        <KPICard label="Ads analyzed" icon={LineChart} iconVariant="blue">
          <div className="font-mono text-[28px] font-semibold tracking-[-0.03em] leading-none text-text-primary mb-2">
            {adsAnalyzed.toLocaleString()}
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium font-mono px-2 py-0.5 rounded-full bg-winning-bg text-winning-text">
              +{useDemoData ? "12.4%" : `${usage.adsAnalyzed}`}
            </span>
            <span className="text-[11px] text-text-tertiary ml-1.5">vs last period</span>
          </div>
          <KPIBarChart />
        </KPICard>

        <KPICard label="Ads generated" icon={Box} iconVariant="green">
          <div className="font-mono text-[28px] font-semibold tracking-[-0.03em] leading-none text-text-primary mb-0.5">
            {adsGenerated}
          </div>
          <div className="text-[11px] text-text-tertiary mb-1">
            {approvalRate}% approval rate
          </div>
          <KPIRingGauge
            percentage={useDemoData ? 78 : approvalRate}
            approvedCount={useDemoData ? 243 : approved.length}
            totalCount={useDemoData ? 312 : completed.length}
            deltaLabel={useDemoData ? "+8.2%" : undefined}
          />
        </KPICard>

        <KPICard label="Generation cost" icon={DollarSign} iconVariant="amber">
          <div className="font-mono text-[28px] font-semibold tracking-[-0.03em] leading-none text-text-primary mb-1.5">
            ${Math.floor(costUsd).toLocaleString()}
            <span className="text-[18px] text-text-tertiary">
              .{String(costUsd.toFixed(2).split(".")[1])}
            </span>
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium font-mono px-2 py-0.5 rounded-full bg-winning-bg text-winning-text">
              {useDemoData ? "-3.1%" : (costUsd > 0 ? `$${costUsd.toFixed(2)}` : "$0.00")}
            </span>
            <span className="text-[11px] text-text-tertiary ml-1.5">vs last period</span>
          </div>
          <KPITrendLine />
        </KPICard>

      </motion.div>

      {/* ── Panel row ───────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-3.5 mb-5">
        <Panel title="Generation performance" icon={Activity} actionText="View all" actionHref="#">
          <PerformanceChart
            approvalRate={perfApprovalRate}
            totalGenerated={perfTotalGen}
            totalApproved={perfTotalApproved}
            totalSpendUsd={perfSpend}
            costPerAdUsd={perfCostPerAd}
          />
        </Panel>

        <Panel title="Top analyzed ads" icon={Star} actionText="See all" actionHref="#">
          <TopAdsList
            analyses={analyses}
            useDemoData={useDemoData}
          />
        </Panel>
      </motion.div>

      {/* ── Recent generated ads table ───────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="bg-card-bg border border-card-border rounded-[14px] p-5 lg:p-6 transition-all duration-150 hover:border-border-default">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-text-primary">
              <Box size={16} className="text-text-tertiary" />
              Recently generated ads
            </div>
            <a
              href="#"
              className="flex items-center gap-1 text-xs font-medium text-text-link no-underline transition-opacity duration-100 hover:opacity-75"
            >
              View all <ChevronRight size={13} />
            </a>
          </div>
          <RecentAdsTable
            variations={variations}
            useDemoData={useDemoData}
          />
        </div>
      </motion.div>

    </motion.div>
  );
}
