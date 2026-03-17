"use client";

import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { useAppStore } from "@/shared/lib/store";
import { useGenerateStore } from "@/shared/lib/generate-store";
import { isImageAnalysis } from "@/shared/lib/media";
import type { ImageAdAnalysis } from "@/shared/types";
import {
  BarChart3,
  Eye,
  Sparkles,
  DollarSign,
  Brain,
  Image as ImageIcon,
  Film,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";

export default function AnalyticsPage() {
  const { usage, competitors, analyses } = useAppStore();
  const variations = useGenerateStore((s) => s.variations);

  const completedVariations = variations.filter(
    (v) => v.status === "completed" || v.status === "approved"
  );
  const approvedVariations = variations.filter((v) => v.status === "approved");
  const approvalRate =
    completedVariations.length > 0
      ? Math.round((approvedVariations.length / completedVariations.length) * 100)
      : 0;

  const stats = [
    {
      label: "Competitors Tracked",
      value: competitors.length,
      icon: Eye,
      color: "text-blue-400",
    },
    {
      label: "Ads Analyzed",
      value: usage.adsAnalyzed,
      icon: Brain,
      color: "text-purple-400",
    },
    {
      label: "Ads Generated",
      value: usage.adsGenerated,
      icon: ImageIcon,
      color: "text-green-400",
    },
    {
      label: "Generation Cost",
      value: `$${usage.generationCostUsd.toFixed(2)}`,
      icon: DollarSign,
      color: "text-yellow-400",
    },
  ];

  const analysisEntries = Object.entries(analyses);
  const topAnalyses = analysisEntries
    .filter((entry): entry is [string, ImageAdAnalysis] => isImageAnalysis(entry[1]))
    .sort(([, a], [, b]) => b.overallScore - a.overallScore)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your ad engine usage and performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Performance */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Generation Performance
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-3xl font-bold">{approvalRate}%</p>
                <p className="text-xs text-muted-foreground">Approval Rate</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{usage.adsGenerated}</p>
                <p className="text-xs text-muted-foreground">Total Generated</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{approvedVariations.length}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>

            {/* Cost per ad */}
            <div className="p-3 rounded-lg bg-muted text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg cost per generated ad</span>
                <span>
                  {usage.adsGenerated > 0
                    ? `$${(usage.generationCostUsd / usage.adsGenerated).toFixed(3)}`
                    : "$0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total generation spend</span>
                <span>${usage.generationCostUsd.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Analyzed Ads */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Top Analyzed Ads
            </h3>
          </CardHeader>
          <CardContent>
            {topAnalyses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ads analyzed yet. Start analyzing from the Ad Feed.
              </p>
            ) : (
              <div className="space-y-3">
                {topAnalyses.map(([adId, analysis]) => (
                  <div key={adId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="text-lg font-bold text-primary w-8 text-center">
                      {analysis.overallScore}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {analysis.conversionElements.hook.text || "Ad"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {analysis.conversionElements.visualHierarchy.layoutType} •{" "}
                        {analysis.conversionElements.hook.type}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      Relevance: {analysis.relevanceToBrand.score}/10
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Generated Ads */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Recently Generated Ads
            </h3>
          </CardHeader>
          <CardContent>
            {completedVariations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ads generated yet. Go to Generate to create your first ad.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {completedVariations.slice(0, 12).map((v) => (
                  <div key={v.id} className="relative aspect-[4/5] rounded-lg overflow-hidden border border-border group">
                    {v.assetUrl ? (
                      v.mediaType === "video" ? (
                        <video src={v.assetUrl} className="h-full w-full object-cover bg-black" muted playsInline />
                      ) : (
                        <Image src={v.assetUrl} alt="" fill className="object-cover" unoptimized />
                      )
                    ) : null}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          className={
                            v.status === "approved"
                              ? "bg-green-500/20 text-green-400 text-[9px]"
                              : "bg-zinc-500/20 text-zinc-400 text-[9px]"
                          }
                        >
                          {v.status}
                        </Badge>
                        <span className="flex items-center gap-1 text-[9px] text-zinc-400">
                          {v.mediaType === "video" ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                          {v.label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
