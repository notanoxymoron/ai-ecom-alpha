"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AdCard } from "@/features/ui-facelift/components/dashboard/ad-card";
import { AdDetailModal } from "@/features/ui-facelift/components/dashboard/ad-detail-modal";
import { AnalysisModal } from "@/features/ui-facelift/components/dashboard/analysis-modal";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { LoadingState } from "@/shared/components/ui/loading-state";
import { Spinner } from "@/shared/components/ui/spinner";
import { useAppStore } from "@/shared/lib/store";
import { useRecentSearches, type SavedSearch } from "@/features/discover/hooks/use-recent-searches";
import type { ForeplayAd } from "@/shared/types/foreplay";
import type { AdAnalysis } from "@/shared/types";
import { useRouter } from "next/navigation";
import { Search, Globe, Clock, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// ── Niche options ─────────────────────────────────────────────────────────────

const NICHE_OPTIONS = [
  "", "beauty", "fashion", "health", "food", "technology",
  "travel", "fitness", "home", "pets", "finance", "education",
];

// ── Recent Searches Dropdown ──────────────────────────────────────────────────

interface RecentDropdownProps {
  searches: SavedSearch[];
  onSelect: (s: SavedSearch) => void;
  onRemove: (idx: number) => void;
  onClearAll: () => void;
}

function RecentSearchesDropdown({ searches, onSelect, onRemove, onClearAll }: RecentDropdownProps) {
  if (searches.length === 0) return null;
  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-card-bg border border-border-subtle rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 border-b border-border-subtle">
        <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.07em]">
          Recent searches
        </span>
        <button
          onMouseDown={(e) => e.preventDefault()} // keep input focus
          onClick={onClearAll}
          className="text-[10px] text-text-tertiary hover:text-text-primary transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Search items */}
      <ul className="py-1">
        {searches.map((s, i) => (
          <li key={s.savedAt} className="flex items-center group">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(s)}
              className="flex-1 flex items-center gap-2.5 px-3 py-2 text-left hover:bg-content-bg transition-colors"
            >
              <Clock size={12} className="text-text-tertiary shrink-0" />
              <span className="text-[13px] text-text-primary truncate">{s.label}</span>
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onRemove(i)}
              className="px-2.5 py-2 opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-text-primary transition-all"
            >
              <X size={11} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const router = useRouter();
  const { analyses } = useAppStore();
  const { searches, addSearch, removeSearch, clearAll } = useRecentSearches();

  // ── Local search state ────────────────────────────────────────────────────
  const [query,   setQuery]   = useState("");
  const [niche,   setNiche]   = useState("");
  const [minDays, setMinDays] = useState("14");
  const [order,   setOrder]   = useState("longest_running");

  // "committed" is non-null only after the user clicks Search
  const [committed, setCommitted] = useState<{
    query: string; niche: string; minDays: string; order: string;
  } | null>(null);

  // Dropdown visibility
  const [showRecent, setShowRecent] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  // Overlays
  const [analyzingAd, setAnalyzingAd] = useState<ForeplayAd | null>(null);
  const [detailAd,    setDetailAd]    = useState<ForeplayAd | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── Search action ─────────────────────────────────────────────────────────
  const commitSearch = useCallback(
    (params = { query, niche, minDays, order }) => {
      setCommitted(params);
      setShowRecent(false);
      addSearch(params);
    },
    [query, niche, minDays, order, addSearch]
  );

  const handleSearchClick = () => commitSearch();

  // Restore from a saved search
  const handleSelectRecent = (s: SavedSearch) => {
    setQuery(s.query);
    setNiche(s.niche);
    setMinDays(s.minDays);
    setOrder(s.order);
    commitSearch({ query: s.query, niche: s.niche, minDays: s.minDays, order: s.order });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Infinite query ────────────────────────────────────────────────────────
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, error } =
    useInfiniteQuery({
      queryKey: ["discover-ads", committed],
      queryFn: async ({ pageParam }) => {
        if (!committed) return { data: [], metadata: { cursor: null } };
        const params = new URLSearchParams();
        if (committed.query)   params.set("query", committed.query);
        if (committed.niche)   params.append("niches", committed.niche);
        if (committed.minDays) params.set("running_duration_min_days", committed.minDays);
        params.set("order", committed.order);
        params.set("display_format", "image");
        params.set("limit", "24");
        if (pageParam) params.set("cursor", String(pageParam));

        const res = await fetch(`/api/foreplay/discover-ads?${params}`);
        if (!res.ok) {
          if (res.status === 429) throw new Error("Rate limit reached — please wait a moment.");
          throw new Error("Failed to discover ads");
        }
        return res.json();
      },
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (lastPage) => lastPage?.metadata?.cursor ?? undefined,
      enabled: !!committed,
      staleTime: 5 * 60 * 1000,
      gcTime:    15 * 60 * 1000,
    });

  // ── Flatten + deduplicate ─────────────────────────────────────────────────
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

  // ── Infinite scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "300px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ── Handlers ──────────────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-[0.02em] flex items-center gap-2">
          <Globe className="h-6 w-6 text-accent" />
          Discover Winning Ads
        </h1>
        <p className="text-[13px] text-text-secondary mt-0.5 tracking-wide">
          Search across millions of ads to find proven winners in any niche.
        </p>
      </div>

      {/* ── Search bar ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Search input + recent dropdown */}
        <div ref={searchWrapRef} className="relative flex-1 min-w-[220px] max-w-lg">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary pointer-events-none z-10" />
          <Input
            placeholder="Search by keyword, brand, or product…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
            onFocus={() => setShowRecent(true)}
            className="pl-8"
          />
          {showRecent && (
            <RecentSearchesDropdown
              searches={searches}
              onSelect={handleSelectRecent}
              onRemove={removeSearch}
              onClearAll={clearAll}
            />
          )}
        </div>

        <Select value={niche} onChange={(e) => setNiche(e.target.value)} className="w-36">
          <option value="">All Niches</option>
          {NICHE_OPTIONS.filter(Boolean).map((n) => (
            <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
          ))}
        </Select>

        <Select value={minDays} onChange={(e) => setMinDays(e.target.value)} className="w-32">
          <option value="">Any duration</option>
          <option value="7">7+ days</option>
          <option value="14">14+ days</option>
          <option value="30">30+ days</option>
          <option value="60">60+ days</option>
        </Select>

        <Select value={order} onChange={(e) => setOrder(e.target.value)} className="w-40">
          <option value="longest_running">Longest Running</option>
          <option value="newest">Newest</option>
          <option value="most_relevant">Most Relevant</option>
        </Select>

        <Button onClick={handleSearchClick}>
          <Search className="h-3.5 w-3.5 mr-1.5" />
          Search
        </Button>
      </div>

      {/* Active search pill */}
      {committed && (
        <div className="flex items-center gap-2 flex-wrap -mt-2">
          <div className="flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent">
            <Search size={10} />
            <span className="font-medium">
              {[committed.query, committed.niche && committed.niche.charAt(0).toUpperCase() + committed.niche.slice(1), committed.minDays && `${committed.minDays}+ days`]
                .filter(Boolean).join(" · ") || "All ads"}
            </span>
            <button
              onClick={() => { setQuery(""); setNiche(""); setMinDays(""); setCommitted(null); }}
              className="ml-0.5 hover:opacity-70 transition-opacity"
            >
              <X size={10} />
            </button>
          </div>
          {ads.length > 0 && !isLoading && (
            <span className={cn("text-[12px] text-text-tertiary")}>{ads.length} ads found</span>
          )}
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {!committed ? (
        <EmptyState
          illustration="search"
          title="Search the Ad Universe"
          description="Enter a keyword, brand name, or choose a niche to discover winning ads across 100M+ creatives."
          action={
            <Button onClick={handleSearchClick}>
              <Search className="h-3.5 w-3.5 mr-1.5" />
              Search Now
            </Button>
          }
        />
      ) : isLoading ? (
        <LoadingState message="Searching millions of ads…" />
      ) : error ? (
        <EmptyState illustration="ads" title="Search failed"
          description={(error as Error).message}
          action={<Button onClick={handleSearchClick}>Try again</Button>} />
      ) : ads.length === 0 ? (
        <EmptyState
          illustration="filters"
          title="No ads found"
          description="Try different keywords, a broader niche, or reduce the minimum running days."
          action={
            <Button variant="outline" onClick={() => {
              setQuery(""); setNiche(""); setMinDays(""); setCommitted(null);
            }}>
              Clear search
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                analysisScore={analyses[ad.id]?.overallScore}
                onAnalyze={(a) => setAnalyzingAd(a)}
                onDuplicate={() => handleDuplicate(ad)}
                onOpen={handleOpenDetail}
              />
            ))}
          </div>

          {/* Sentinel */}
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
              <p className="text-[12px] text-text-tertiary">{ads.length} ads found</p>
            )}
          </div>
        </>
      )}

      {/* ── Overlays ──────────────────────────────────────────────────────── */}
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
        onAnalyze={(ad) => { setDetailAd(null); setAnalyzingAd(ad); }}
        onDuplicate={(ad) => { setDetailAd(null); handleDuplicate(ad); }}
      />
    </div>
  );
}
