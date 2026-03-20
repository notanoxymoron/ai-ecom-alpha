"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { CrawlLauncher } from "@/features/openclaw/components/crawl-launcher";
import { CrawlStatusCard } from "@/features/openclaw/components/crawl-status-card";
import { AdCard } from "@/features/ui-facelift/components/dashboard/ad-card";
import { AnalysisModal } from "@/features/ui-facelift/components/dashboard/analysis-modal";
import { Spinner } from "@/shared/components/ui/spinner";
import { Button } from "@/shared/components/ui/button";
import { useAppStore } from "@/shared/lib/store";
import type { CrawlTask } from "@/features/openclaw/types";
import type { ForeplayAd } from "@/shared/types/foreplay";
import type { AdAnalysis } from "@/shared/types";
import { useRouter } from "next/navigation";
import { Bot, RefreshCw } from "lucide-react";

export default function OpenClawPage() {
  const router = useRouter();
  const { analyses, apiKeys } = useAppStore();
  const [crawlTasks, setCrawlTasks] = useState<CrawlTask[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [analyzingAd, setAnalyzingAd] = useState<ForeplayAd | null>(null);

  // Poll status for running tasks
  const runningTasks = crawlTasks.filter(
    (t) => t.status === "pending" || t.status === "running"
  );

  useQuery({
    queryKey: ["openclaw-poll", runningTasks.map((t) => t.id)],
    queryFn: async () => {
      const updates = await Promise.all(
        runningTasks.map(async (task) => {
          try {
            const apifyHeaders: Record<string, string> = {};
            if (apiKeys.apifyToken) apifyHeaders["X-Apify-Token"] = apiKeys.apifyToken;
            const res = await fetch(
              `/api/openclaw/status?taskId=${encodeURIComponent(task.id)}`,
              { headers: apifyHeaders }
            );
            if (!res.ok) return task;
            const data = await res.json();

            if (data.status === "completed" || data.status === "failed") {
              if (data.status === "completed") {
                setSelectedTaskId(task.id);
              }
              return {
                ...task,
                status: data.status as CrawlTask["status"],
                completedAt: new Date().toISOString(),
                error: data.error || undefined,
                resultCount: data.resultCount || 0,
              };
            }
            return { ...task, status: data.status as CrawlTask["status"] };
          } catch {
            return task;
          }
        })
      );

      setCrawlTasks((prev) =>
        prev.map((t) => {
          const updated = updates.find((u) => u.id === t.id);
          return updated || t;
        })
      );

      return updates;
    },
    enabled: runningTasks.length > 0,
    refetchInterval: 3000,
  });

  // Fetch results for selected task
  const selectedTask = crawlTasks.find((t) => t.id === selectedTaskId);
  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ["openclaw-results", selectedTaskId],
    queryFn: async () => {
      const source =
        selectedTask?.source === "tiktok_top_ads" ? "tiktok" : "meta";
      const apifyHeaders: Record<string, string> = {};
      if (apiKeys.apifyToken) apifyHeaders["X-Apify-Token"] = apiKeys.apifyToken;
      const res = await fetch(
        `/api/openclaw/results?taskId=${encodeURIComponent(
          selectedTaskId!
        )}&source=${source}`,
        { headers: apifyHeaders }
      );
      if (!res.ok) throw new Error("Failed to fetch results");
      return res.json();
    },
    enabled: !!selectedTaskId && selectedTask?.status === "completed",
  });

  const resultAds: ForeplayAd[] = (resultsData?.foreplayCompatible ?? []).filter(
    (ad: ForeplayAd) => ad.image || ad.thumbnail || ad.video
  );

  const handleStartCrawl = async (
    source: string,
    query: string,
    options: Record<string, unknown>
  ) => {
    setIsLaunching(true);
    try {
      const crawlHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKeys.apifyToken) crawlHeaders["X-Apify-Token"] = apiKeys.apifyToken;
      const res = await fetch("/api/openclaw/crawl", {
        method: "POST",
        headers: crawlHeaders,
        body: JSON.stringify({ source, query, options }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to start crawl");
      }
      const data = await res.json();

      const newTask: CrawlTask = {
        id: data.taskId,
        source: source as CrawlTask["source"],
        query,
        status: "running",
        createdAt: new Date().toISOString(),
        resultCount: 0,
      };

      setCrawlTasks((prev) => [newTask, ...prev]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to start crawl";
      const failedTask: CrawlTask = {
        id: `failed-${Date.now()}`,
        source: source as CrawlTask["source"],
        query,
        status: "failed",
        createdAt: new Date().toISOString(),
        resultCount: 0,
        error: message,
      };
      setCrawlTasks((prev) => [failedTask, ...prev]);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleViewResults = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleDuplicate = useCallback(
    (ad: ForeplayAd, analysis?: AdAnalysis) => {
      const existingAnalysis = analysis || analyses[ad.id];
      sessionStorage.setItem(
        "generate_context",
        JSON.stringify({
          ad,
          analysis: existingAnalysis || null,
          skipAnalysis: !existingAnalysis,
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
          <Bot className="h-6 w-6 text-primary" />
          OpenClaw Intelligence
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Autonomous competitor ad scraping powered by OpenClaw AI agents.
        </p>
      </div>

      {/* Crawl Launcher */}
      <CrawlLauncher onStartCrawl={handleStartCrawl} isLoading={isLaunching} />

      {/* Crawl Tasks */}
      {crawlTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Crawl History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {crawlTasks.map((task) => (
              <CrawlStatusCard
                key={task.id}
                task={task}
                onViewResults={handleViewResults}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results Feed */}
      {selectedTaskId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Scraped Results
              {selectedTask && (
                <span className="ml-2 text-foreground normal-case">
                  — &ldquo;{selectedTask.query}&rdquo;
                </span>
              )}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTaskId(null)}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>

          {resultsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : resultAds.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No ads found in this crawl result.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resultAds.map((ad) => (
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
        </div>
      )}

      {/* Empty State */}
      {crawlTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bot className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">No Crawls Yet</h3>
          <p className="text-sm text-muted-foreground mt-1 whitespace-nowrap">
            Launch a crawl above to scrape the Meta Ad Library or TikTok Top Ads.
          </p>
        </div>
      )}

      {/* Analysis Modal */}
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
