"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdCard } from "@/features/ui-facelift/components/dashboard/ad-card";
import { Filters, type FilterValues } from "@/features/ui-facelift/components/dashboard/filters";
import { AnalysisModal } from "@/features/ui-facelift/components/dashboard/analysis-modal";
import { Spinner } from "@/shared/components/ui/spinner";
import { Button } from "@/shared/components/ui/button";
import { useAppStore } from "@/shared/lib/store";
import { getAdMediaType, getDisplayFormatValues } from "@/shared/lib/media";
import type { ForeplayAd } from "@/shared/types/foreplay";
import type { AdAnalysis } from "@/shared/types";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { competitors, analyses } = useAppStore();
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    order: "longest_running",
    minDays: "7",
    platform: "",
    niche: "",
    mediaType: "image",
  });
  const [selectedCompetitor, setSelectedCompetitor] = useState("all");
  const [analyzingAd, setAnalyzingAd] = useState<ForeplayAd | null>(null);
  const [cursor, setCursor] = useState<number | undefined>(undefined);

  const brandIds =
    selectedCompetitor === "all"
      ? competitors.map((c) => c.foreplayBrandId)
      : [selectedCompetitor];

  const { data, isLoading, error } = useQuery({
    queryKey: ["brand-ads", brandIds, filters, cursor],
    queryFn: async () => {
      if (brandIds.length === 0) return null;
      const params = new URLSearchParams();
      brandIds.forEach((id) => params.append("brand_ids", id));
      if (filters.minDays) params.set("running_duration_min_days", filters.minDays);
      if (filters.platform) params.append("publisher_platform", filters.platform);
      if (filters.niche) params.append("niches", filters.niche);
      params.set("order", filters.order);
      getDisplayFormatValues(filters.mediaType).forEach((value) => params.append("display_format", value));
      params.set("limit", "30");
      if (cursor) params.set("cursor", String(cursor));

      const res = await fetch(`/api/foreplay/brand-ads?${params}`);
      if (!res.ok) throw new Error("Failed to fetch ads");
      return res.json();
    },
    enabled: brandIds.length > 0,
  });

  const ads: ForeplayAd[] = data?.data ?? [];

  const handleAnalyze = useCallback((ad: ForeplayAd) => {
    setAnalyzingAd(ad);
  }, []);

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

  const competitorOptions = competitors.map((c) => ({
    id: c.foreplayBrandId,
    name: c.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          Competitor Ad Feed
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track winning ads from your competitors. Add competitors in the Knowledge Base to get started.
        </p>
      </div>

      <Filters
        filters={filters}
        onFiltersChange={setFilters}
        competitorOptions={competitorOptions}
        selectedCompetitor={selectedCompetitor}
        onCompetitorChange={setSelectedCompetitor}
      />

      {competitors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <LayoutDashboard className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">No competitors tracked yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Go to the Knowledge Base to add your brand profile and start tracking competitors.
          </p>
          <Button className="mt-4" onClick={() => router.push("/knowledge-base")}>
            Set Up Knowledge Base
          </Button>
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
          No ads found with current filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                analysisScore={analyses[ad.id]?.overallScore}
                onAnalyze={handleAnalyze}
                onDuplicate={() => handleDuplicate(ad)}
              />
            ))}
          </div>

          {data?.metadata?.cursor && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setCursor(data.metadata.cursor)}
              >
                Load More
              </Button>
            </div>
          )}
        </>
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
