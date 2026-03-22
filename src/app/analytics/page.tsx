"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { fadeUp, staggerContainer } from "@/features/ui-facelift/lib/animations";
import { KPICard } from "@/features/ui-facelift/components/dashboard/kpi-card";
import { KPISparkline } from "@/features/ui-facelift/components/dashboard/kpi-sparkline";
import { KPIBarChart } from "@/features/ui-facelift/components/dashboard/kpi-bar-chart";
import { KPITrendLine } from "@/features/ui-facelift/components/dashboard/kpi-trend-line";
import { Panel } from "@/features/ui-facelift/components/dashboard/panel";
import { PerformanceChart, type PerformanceChartDataPoint } from "@/features/ui-facelift/components/dashboard/performance-chart";
import { TopAdsList } from "@/features/ui-facelift/components/dashboard/top-ads-list";
import { AnalysisDetailModal } from "@/features/ui-facelift/components/dashboard/analysis-detail-modal";
import type { ImageAdAnalysis } from "@/shared/types";
import { useAppStore } from "@/shared/lib/store";
import { DollarSign, Activity, Star, BarChart3, LineChart, Download } from "lucide-react";

// ─── Demo / placeholder data ──────────────────────────────────────────────────
const DEMO_COMPETITORS_COUNT = 24;
const DEMO_ADS_ANALYZED      = 1847;
const DEMO_ADS_GENERATED     = 312;
const DEMO_COST_USD          = 482.60;

export default function AnalyticsDashboard() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<{ adId: string; analysis: ImageAdAnalysis; name: string } | null>(null);
  const useDemoData = false;

  // ── Real store data ──────────────────────────────────────────────────────────
  const { competitors, analyses, usage, savedAds, generatedAds } = useAppStore();

  // ── KPI values — real or demo ────────────────────────────────────────────────
  const competitorsCount = useDemoData ? DEMO_COMPETITORS_COUNT : competitors.length;
  const adsAnalyzed      = useDemoData ? DEMO_ADS_ANALYZED      : usage.adsAnalyzed;
  const adsGenerated     = useDemoData ? DEMO_ADS_GENERATED     : usage.adsGenerated;
  const costUsd          = useDemoData ? DEMO_COST_USD          : usage.generationCostUsd;

  // ── Approval rate (from persisted generatedAds) ──────────────────────────────
  const approved      = generatedAds.filter(a => a.status === "approved");
  const totalGenCount = Math.max(generatedAds.length, adsGenerated);
  const approvalRate  = useDemoData
    ? 52
    : (totalGenCount > 0 ? Math.round((approved.length / totalGenCount) * 100) : 0);

  // ── Monthly chart data (from persisted generatedAds) ────────────────────────
  const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const perfChartData = useMemo<PerformanceChartDataPoint[]>(() => {
    if (adsGenerated === 0 && generatedAds.length === 0) return [];
    const buckets: Record<string, { generated: number; approved: number }> = {};
    for (const ad of generatedAds) {
      const d = new Date(ad.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!buckets[key]) buckets[key] = { generated: 0, approved: 0 };
      buckets[key].generated++;
      if (ad.status === "approved") buckets[key].approved++;
    }
    const trackedTotal = generatedAds.length;
    const untracked = Math.max(0, adsGenerated - trackedTotal);
    if (untracked > 0) {
      const keys = Object.keys(buckets).sort();
      if (keys.length > 0) {
        buckets[keys[keys.length - 1]].generated += untracked;
      } else {
        const now = new Date();
        const key = `${now.getFullYear()}-${now.getMonth()}`;
        buckets[key] = { generated: adsGenerated, approved: 0 };
      }
    }
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, counts]) => ({
        month: MONTH_LABELS[parseInt(key.split("-")[1])],
        ...counts,
      }));
  }, [generatedAds, adsGenerated]);

  // ── Export CSV ──────────────────────────────────────────────────────────────
  const handleExportCsv = () => {
    const rows: string[][] = [
      ["Metric", "Value"],
      ["Competitors tracked", String(competitorsCount)],
      ["Ads analyzed", String(adsAnalyzed)],
      ["Ads generated", String(adsGenerated)],
      ["Approved", String(approved.length)],
      ["Approval rate", `${approvalRate}%`],
      ["Generation cost (USD)", costUsd.toFixed(2)],
      ["Avg cost per ad (USD)", adsGenerated > 0 ? (costUsd / adsGenerated).toFixed(2) : "0.00"],
      [],
      ["Generated Ad ID", "Source Ad ID", "Status", "Aspect Ratio", "Created At"],
      ...generatedAds.map(ad => [
        ad.id,
        ad.sourceAdId,
        ad.status,
        ad.aspectRatio,
        ad.createdAt,
      ]),
    ];
    const csvContent = rows.map(r => r.map(c => `"${(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── PerformanceChart derived values ──────────────────────────────────────────
  const perfApprovalRate  = useDemoData ? 78  : approvalRate;
  const perfTotalGen      = useDemoData ? 312 : adsGenerated;
  const perfTotalApproved = useDemoData ? 243 : approved.length;
  const perfSpend         = useDemoData ? 482.60 : costUsd;
  const perfCostPerAd     = perfTotalGen > 0 ? perfSpend / perfTotalGen : 0;

  return (
    <>
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
            Analytics Dashboard
          </h1>
          <p className="text-[13px] text-text-secondary mt-0.5 tracking-wide">
            Track your ad engine usage and performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select defaultValue="7" className="bg-card-bg border border-border-subtle rounded-sm px-3 py-1.5 text-xs font-medium text-text-secondary cursor-pointer hover:border-border-default transition-colors">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-card-bg text-text-secondary border border-border-subtle rounded-sm text-xs font-medium transition-all duration-150 hover:border-accent hover:text-accent hover:bg-accent/5 hover:shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Download size={14} className="shrink-0" />
            Export
          </button>
        </div>
      </motion.div>

      {/* ── KPI cards ───────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">

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
        <Panel title="Generation performance" icon={Activity}>
          <PerformanceChart
            chartData={perfChartData}
            approvalRate={perfApprovalRate}
            totalGenerated={perfTotalGen}
            totalApproved={perfTotalApproved}
            totalSpendUsd={perfSpend}
            costPerAdUsd={perfCostPerAd}
          />
        </Panel>

        <Panel title="Top analyzed ads" icon={Star}>
          <TopAdsList
            analyses={analyses}
            savedAds={savedAds}
            useDemoData={useDemoData}
            onAdClick={(adId, analysis, name) => setSelectedAnalysis({ adId, analysis, name })}
          />
        </Panel>
      </motion.div>

    </motion.div>

    {selectedAnalysis && (() => {
      const ad = savedAds[selectedAnalysis.adId];
      return (
        <AnalysisDetailModal
          name={selectedAnalysis.name}
          analysis={selectedAnalysis.analysis}
          onClose={() => setSelectedAnalysis(null)}
          imageUrl={ad?.image || ad?.thumbnail || undefined}
          videoUrl={ad?.video || undefined}
          description={ad?.description}
          runningDays={ad?.running_duration?.days}
          platforms={ad?.publisher_platform}
        />
      );
    })()}
    </>
  );
}
