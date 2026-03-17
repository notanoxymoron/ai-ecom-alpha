"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AdCard } from "@/features/ui-facelift/components/dashboard/ad-card";
import { AdDetailModal } from "@/features/ui-facelift/components/dashboard/ad-detail-modal";
import { Filters, type FilterValues } from "@/features/ui-facelift/components/dashboard/filters";
import { AnalysisModal } from "@/features/ui-facelift/components/dashboard/analysis-modal";
import { LoadingState } from "@/shared/components/ui/loading-state";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Spinner } from "@/shared/components/ui/spinner";
import { useAppStore } from "@/shared/lib/store";
import type { ForeplayAd } from "@/shared/types/foreplay";
import type { AdAnalysis } from "@/shared/types";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Plus } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { competitors, analyses } = useAppStore();

  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    order: "longest_running",
    minDays: "7",
    platform: "",
    niche: "",
  });
  const [selectedCompetitor, setSelectedCompetitor] = useState("all");
  const [analyzingAd, setAnalyzingAd] = useState<ForeplayAd | null>(null);
  const [detailAd, setDetailAd]       = useState<ForeplayAd | null>(null);

  // Sentinel div that triggers the next page load when it scrolls into view
  const sentinelRef = useRef<HTMLDivElement>(null);

  const brandIds =
    selectedCompetitor === "all"
      ? competitors.map((c) => c.foreplayBrandId)
      : [selectedCompetitor];

  // ── Infinite query ──────────────────────────────────────────────────────────
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["brand-ads", brandIds, filters],
    queryFn: async ({ pageParam }) => {
      if (brandIds.length === 0) return { data: [], metadata: { cursor: null } };
      const params = new URLSearchParams();
      brandIds.forEach((id) => params.append("brand_ids", id));
      if (filters.minDays)  params.set("running_duration_min_days", filters.minDays);
      if (filters.platform) params.append("publisher_platform", filters.platform);
      if (filters.niche)    params.append("niches", filters.niche);
      params.set("order", filters.order);
      params.set("display_format", "image");
      params.set("limit", "24");
      if (pageParam) params.set("cursor", String(pageParam));

      const res = await fetch(`/api/foreplay/brand-ads?${params}`);
      if (!res.ok) {
        if (res.status === 429) throw new Error("Rate limit reached — please wait a moment.");
        throw new Error("Failed to fetch ads");
      }
      return res.json();
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage?.metadata?.cursor ?? undefined,
    enabled: brandIds.length > 0,
    staleTime: 3 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
  });

  // ── Flatten all pages and deduplicate by ad.id ─────────────────────────────
  const ads: ForeplayAd[] = useMemo(() => {
    const seen = new Set<string>();
    return (data?.pages ?? [])
      .flatMap((p) => (p?.data ?? []) as ForeplayAd[])
      .filter((ad) => {
        if (seen.has(ad.id)) return false;
        seen.add(ad.id);
        return true;
      });
  }, [data]);

  // ── IntersectionObserver — trigger next page when sentinel is visible ──────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "300px" } // prefetch 300px before hitting the bottom
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAnalyze    = useCallback((ad: ForeplayAd) => setAnalyzingAd(ad), []);
  const handleOpenDetail = useCallback((ad: ForeplayAd) => setDetailAd(ad), []);

  const handleDuplicate = useCallback(
    (ad: ForeplayAd, analysis?: AdAnalysis) => {
      const existingAnalysis = analysis || analyses[ad.id];
      sessionStorage.setItem("generate_context", JSON.stringify({
        ad,
        analysis: existingAnalysis || null,
        skipAnalysis: !existingAnalysis,
      }));
      router.push("/generate");
    },
    [router, analyses]
  );

  const competitorOptions = competitors.map((c) => ({
    id: c.foreplayBrandId,
    name: c.name,
  }));

  return (
    <div className="space-y-5">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[0.02em] flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-accent" />
            Competitor Ad Feed
          </h1>
          <p className="text-[13px] text-text-secondary mt-0.5 tracking-wide">
            Track winning ads from your competitors.
          </p>
        </div>
        <Button onClick={() => router.push("/knowledge-base")} className="shrink-0">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Competitor
        </Button>
      </div>

      <Filters
        filters={filters}
        onFiltersChange={setFilters}
        competitorOptions={competitorOptions}
        selectedCompetitor={selectedCompetitor}
        onCompetitorChange={setSelectedCompetitor}
      />

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {competitors.length === 0 ? (
        <EmptyState
          illustration="competitor"
          title="No competitors tracked yet"
          description="Add your first competitor to start seeing their winning ads here."
          action={
            <Button onClick={() => router.push("/knowledge-base")}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Competitor
            </Button>
          }
        />
      ) : isLoading ? (
        <LoadingState message="Scanning competitor ads…" />
      ) : error ? (
        <EmptyState illustration="ads" title="Something went wrong"
          description={(error as Error).message} />
      ) : ads.length === 0 ? (
        <EmptyState
          illustration="filters"
          title="No ads match your filters"
          description="Try adjusting your filters or clearing them to see all available ads."
          action={
            <Button variant="outline" onClick={() =>
              setFilters({ search: "", order: "longest_running", minDays: "7", platform: "", niche: "" })
            }>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          {/* Ad grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                analysisScore={analyses[ad.id]?.overallScore}
                onAnalyze={handleAnalyze}
                onDuplicate={() => handleDuplicate(ad)}
                onOpen={handleOpenDetail}
              />
            ))}
          </div>

          {/* Sentinel + scroll status */}
          <div ref={sentinelRef} className="flex items-center justify-center py-8">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2 text-[13px] text-text-tertiary">
                <Spinner className="h-4 w-4" />
                Loading more ads…
              </div>
            ) : hasNextPage ? (
              <Button variant="outline" size="sm" onClick={() => fetchNextPage()}>
                Load more
              </Button>
            ) : (
              <p className="text-[12px] text-text-tertiary">
                {ads.length} ads — you&apos;re all caught up
              </p>
            )}
          </div>
        </>
      )}

      {/* ── Overlays ────────────────────────────────────────────────────────── */}
      {analyzingAd && (
        <AnalysisModal
          ad={analyzingAd}
          onClose={() => setAnalyzingAd(null)}
          onDuplicate={(ad, analysis) => {
            setAnalyzingAd(null);
            handleDuplicate(ad, analysis);
          }}
        />
      )}

      <AdDetailModal
        ad={detailAd}
        onClose={() => setDetailAd(null)}
        onAnalyze={(ad) => { setDetailAd(null); handleAnalyze(ad); }}
        onDuplicate={(ad) => { setDetailAd(null); handleDuplicate(ad); }}
      />
    </div>
  );
}
