"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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
import { MasonryGrid } from "@/shared/components/masonry-grid";
import { LayoutDashboard, Plus, Bookmark, Users, Search } from "lucide-react";

// Module-level credit counter — persists across component mount/unmount so cached
// data on re-navigation doesn't trigger a double-charge (unlike useRef which resets to 0).
let prevHomeAdCount = 0;

// Stable ref for the IntersectionObserver callback to avoid observer recreation on every render
function useIntersectionCallback(cb: () => void) {
  const ref = useRef(cb);
  ref.current = cb;
  return ref;
}

export default function HomePage() {
  const router = useRouter();
  const { competitors, analyses, apiKeys, updateCompetitor, incrementUsage, savedAds } = useAppStore();

  const [activeTab, setActiveTab] = useState<"saved" | "competitors">("saved");
  const [savedFilters, setSavedFilters] = useState<FilterValues>({
    search: "",
    order: "longest_running",
    minDays: "",
    platform: "",
    niche: "",
  });
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    order: "longest_running",
    minDays: "",
    platform: "",
    niche: "",
  });
  const [selectedCompetitor, setSelectedCompetitor] = useState("");
  const [analyzingAd, setAnalyzingAd] = useState<ForeplayAd | null>(null);
  const [detailAd, setDetailAd]       = useState<ForeplayAd | null>(null);

  // Sentinel div that triggers the next page load when it scrolls into view
  const sentinelRef = useRef<HTMLDivElement>(null);

  const brandIds =
    selectedCompetitor === "all"
      ? competitors.map((c) => c.foreplayBrandId)
      : selectedCompetitor
        ? [selectedCompetitor]
        : [];

  // ── Infinite query ──────────────────────────────────────────────────────────
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["brand-ads", brandIds, { order: filters.order, minDays: filters.minDays, platform: filters.platform, niche: filters.niche }],
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

      const headers: Record<string, string> = {};
      if (apiKeys.foreplayKey) headers["X-Foreplay-Key"] = apiKeys.foreplayKey;
      const res = await fetch(`/api/foreplay/brand-ads?${params}`, { headers });
      if (!res.ok) {
        if (res.status === 429) throw new Error("Rate limit reached — please wait a moment.");
        throw new Error("Failed to fetch ads");
      }
      return res.json();
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      // Stop if the page returned no data at all
      if (!lastPage?.data?.length) return undefined;
      // Stop if the page returned fewer results than requested — the API
      // has no more results. Following a stale cursor would waste credits.
      if (lastPage.data.length < 24) return undefined;
      return lastPage?.metadata?.cursor ?? undefined;
    },
    enabled: brandIds.length > 0,
    staleTime: 2 * 60 * 60 * 1000,   // 2 hours — brand ad libraries don't change minute-to-minute
    gcTime:    4 * 60 * 60 * 1000,   // 4 hours — keep cache alive for a full work session
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

  // ── Credit tracking — charge only for genuinely new unique ads ─────────────
  // Tracking in queryFn charges raw API results including duplicates.
  // Tracking here, against the deduplicated list, means we only charge for
  // ads that actually appear in the UI.
  useEffect(() => {
    if (ads.length === 0) {
      prevHomeAdCount = 0;
      return;
    }
    const newUniqueCount = ads.length - prevHomeAdCount;
    if (newUniqueCount > 0) {
      incrementUsage("foreplayCreditsUsed", newUniqueCount);
      prevHomeAdCount = ads.length;
    }
  }, [ads.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync adCount in store with actual loaded counts ────────────────────────
  // The discoverBrands endpoint often returns ad_count: 0 even for brands that
  // have ads. After loading pages we update each competitor's adCount so the
  // knowledge-base card shows a real number.
  useEffect(() => {
    if (!data?.pages?.length) return;
    const countByBrand: Record<string, number> = {};
    for (const page of data.pages) {
      for (const ad of (page?.data ?? []) as ForeplayAd[]) {
        countByBrand[ad.brand_id] = (countByBrand[ad.brand_id] ?? 0) + 1;
      }
    }
    for (const [brandId, count] of Object.entries(countByBrand)) {
      const comp = competitors.find((c) => c.foreplayBrandId === brandId);
      if (comp && count > (comp.adCount ?? 0)) {
        updateCompetitor(comp.id, { adCount: count });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // ── Client-side search filter + sort ────────────────────────────────────────
  const filteredAds = useMemo(() => {
    const getRunningDays = (ad: ForeplayAd) =>
      ad.live && ad.started_running
        ? Math.floor((Date.now() - new Date(ad.started_running).getTime()) / 86_400_000)
        : (ad.running_duration?.days ?? 0);

    let result = ads;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (ad) =>
          (ad as any).brandName?.toLowerCase().includes(q) ||
          (ad as any).headline?.toLowerCase().includes(q) ||
          (ad as any).body?.toLowerCase().includes(q) ||
          (ad as any).name?.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      switch (filters.order) {
        case "longest_running":
          return getRunningDays(b) - getRunningDays(a);
        case "newest":
          return (b.started_running ?? 0) - (a.started_running ?? 0);
        case "oldest":
          return (a.started_running ?? 0) - (b.started_running ?? 0);
        default:
          return 0;
      }
    });
  }, [ads, filters.search, filters.order]);

  const hasActiveFilters = !!(filters.search || filters.minDays || filters.platform || filters.niche);

  // ── IntersectionObserver — trigger next page when sentinel is visible ──────
  // Use a stable ref for the callback so the observer is created only once
  // (avoids rapid re-firing that occurred when the observer was recreated on
  // every hasNextPage / isFetchingNextPage state change).
  const intersectCb = useIntersectionCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) intersectCb.current();
      },
      { rootMargin: "0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // create observer once; latest values accessed via ref

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
            Analyze Competitor Ads
          </h1>
          <p className="text-[13px] text-text-secondary mt-0.5 tracking-wide">
            Track winning ads from your competitors.
          </p>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setActiveTab("saved")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "saved"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Saved Ads
          {Object.keys(savedAds).length > 0 && (
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full transition-colors ${
              activeTab === "saved"
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            }`}>
              {Object.keys(savedAds).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("competitors")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "competitors"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Competitor Ads
          {competitors.length > 0 && (
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full transition-colors ${
              activeTab === "competitors"
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            }`}>
              {competitors.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Saved Ads tab ─────────────────────────────────────────────────────── */}
      {activeTab === "saved" && (
        <>
          <Filters
            filters={savedFilters}
            onFiltersChange={setSavedFilters}
          />

          {Object.keys(savedAds).length === 0 ? (
            <EmptyState
              illustration="ads"
              title="No saved ads yet"
              description="Save ads from the Discover page to analyze them here."
              action={
                <Button onClick={() => router.push("/discover")}>
                  <Search className="h-3.5 w-3.5 mr-1.5" />
                  Discover Ads
                </Button>
              }
            />
          ) : (() => {
            const savedAdsList = Object.values(savedAds).filter((ad) => {
              if (savedFilters.search) {
                const q = savedFilters.search.toLowerCase();
                if (
                  !ad.name?.toLowerCase().includes(q) &&
                  !ad.description?.toLowerCase().includes(q) &&
                  !ad.cta_title?.toLowerCase().includes(q)
                ) return false;
              }
              if (savedFilters.minDays && (ad.running_duration?.days ?? 0) < Number(savedFilters.minDays)) return false;
              if (savedFilters.platform && !ad.publisher_platform?.includes(savedFilters.platform)) return false;
              if (savedFilters.niche && !ad.niches?.includes(savedFilters.niche)) return false;
              return true;
            }).sort((a, b) => {
              const getRunningDays = (ad: typeof a) =>
                ad.live && ad.started_running
                  ? Math.floor((Date.now() - new Date(ad.started_running).getTime()) / 86_400_000)
                  : (ad.running_duration?.days ?? 0);
              switch (savedFilters.order) {
                case "longest_running":
                  return getRunningDays(b) - getRunningDays(a);
                case "newest":
                  return (b.started_running ?? 0) - (a.started_running ?? 0);
                case "oldest":
                  return (a.started_running ?? 0) - (b.started_running ?? 0);
                default:
                  return 0;
              }
            });

            if (savedAdsList.length === 0) {
              return (
                <EmptyState
                  illustration="filters"
                  title="No saved ads match your filters"
                  description="Try adjusting your filters or clearing them."
                  action={
                    <Button variant="outline" onClick={() =>
                      setSavedFilters({ search: "", order: "longest_running", minDays: "", platform: "", niche: "" })
                    }>
                      Clear filters
                    </Button>
                  }
                />
              );
            }

            return (
              <MasonryGrid ads={savedAdsList} analyses={analyses} onAnalyze={handleAnalyze} onDuplicate={handleDuplicate} onOpen={handleOpenDetail} variant="saved" />
            );
          })()}
        </>
      )}

      {/* ── Competitor Ads tab ────────────────────────────────────────────────── */}
      {activeTab === "competitors" && (
        <>
          <Filters
            filters={filters}
            onFiltersChange={setFilters}
            competitorOptions={competitorOptions}
            selectedCompetitor={selectedCompetitor}
            onCompetitorChange={setSelectedCompetitor}
          />

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
          ) : !selectedCompetitor ? (
            <EmptyState
              illustration="search"
              title="Select a competitor"
              description="Choose a competitor from the dropdown above to view their ads."
            />
          ) : isLoading ? (
            <LoadingState message="Scanning competitor ads…" />
          ) : error ? (
            <EmptyState illustration="ads" title="Something went wrong"
              description={(error as Error).message} />
          ) : ads.length === 0 ? (
            <EmptyState
              illustration="ads"
              title="No ads found"
              description="Your competitors don't have any ads yet, or they haven't been indexed. Try adding more competitors."
            />
          ) : filteredAds.length === 0 ? (
            <EmptyState
              illustration="filters"
              title="No ads match your filters"
              description="Try adjusting your filters or clearing them to see all available ads."
              action={
                <Button variant="outline" onClick={() =>
                  setFilters({ search: "", order: "longest_running", minDays: "", platform: "", niche: "" })
                }>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <MasonryGrid ads={filteredAds} analyses={analyses} onAnalyze={handleAnalyze} onDuplicate={handleDuplicate} onOpen={handleOpenDetail} />

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
                    {filteredAds.length} ads — you&apos;re all caught up
                  </p>
                )}
              </div>
            </>
          )}
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
