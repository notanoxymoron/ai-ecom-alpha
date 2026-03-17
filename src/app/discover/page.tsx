"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdCard } from "@/features/ui-facelift/components/dashboard/ad-card";
import { AnalysisModal } from "@/features/ui-facelift/components/dashboard/analysis-modal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import { useAppStore } from "@/shared/lib/store";
import { getAdMediaType, getDisplayFormatValues } from "@/shared/lib/media";
import type { ForeplayAd } from "@/shared/types/foreplay";
import type { AdAnalysis } from "@/shared/types";
import { useRouter } from "next/navigation";
import { Search, Globe } from "lucide-react";

const NICHE_OPTIONS = [
  "",
  "beauty",
  "fashion",
  "health",
  "food",
  "technology",
  "travel",
  "fitness",
  "home",
  "pets",
  "finance",
  "education",
];

export default function DiscoverPage() {
  const router = useRouter();
  const { analyses } = useAppStore();
  const [query, setQuery] = useState("");
  const [niche, setNiche] = useState("");
  const [minDays, setMinDays] = useState("14");
  const [order, setOrder] = useState("longest_running");
  const [mediaType, setMediaType] = useState<"image" | "video" | "all">("image");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [analyzingAd, setAnalyzingAd] = useState<ForeplayAd | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["discover-ads", query, niche, minDays, order, mediaType, searchTrigger],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.set("query", query);
      if (niche) params.append("niches", niche);
      if (minDays) params.set("running_duration_min_days", minDays);
      params.set("order", order);
      getDisplayFormatValues(mediaType).forEach((value) => params.append("display_format", value));
      params.set("limit", "40");

      const res = await fetch(`/api/foreplay/discover-ads?${params}`);
      if (!res.ok) throw new Error("Failed to discover ads");
      return res.json();
    },
    enabled: searchTrigger > 0,
  });

  const ads: ForeplayAd[] = data?.data ?? [];

  const handleSearch = () => setSearchTrigger((t) => t + 1);

  const handleDuplicate = useCallback(
    (ad: ForeplayAd, analysis?: AdAnalysis) => {
      const existingAnalysis = analysis || analyses[ad.id];
      sessionStorage.setItem(
        "generate_context",
        JSON.stringify({
          ad,
          analysis: existingAnalysis || null,
          skipAnalysis: getAdMediaType(ad) === "image" && !existingAnalysis,
        })
      );
      router.push("/generate");
    },
    [router, analyses]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          Discover Winning Ads
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search across millions of ads to find proven winners in any niche.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by keyword, brand, or product..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>

        <Select value={niche} onChange={(e) => setNiche(e.target.value)} className="w-36">
          <option value="">All Niches</option>
          {NICHE_OPTIONS.filter(Boolean).map((n) => (
            <option key={n} value={n}>
              {n.charAt(0).toUpperCase() + n.slice(1)}
            </option>
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

        <Select value={mediaType} onChange={(e) => setMediaType(e.target.value as "image" | "video" | "all")} className="w-28">
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="all">All</option>
        </Select>

        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {searchTrigger === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">Search the Ad Universe</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Enter a keyword or select a niche to discover winning ads across millions of brands.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-destructive">{(error as Error).message}</p>
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No ads found. Try different search terms or filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ads.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              analysisScore={analyses[ad.id]?.overallScore}
              onAnalyze={(a) => setAnalyzingAd(a)}
              onDuplicate={() => handleDuplicate(ad)}
            />
          ))}
        </div>
      )}

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
    </div>
  );
}
