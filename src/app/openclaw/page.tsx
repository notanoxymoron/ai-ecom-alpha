"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { useAppStore } from "@/shared/lib/store";
import { TeardownLauncher } from "@/features/teardown/components/teardown-launcher";
import { TeardownProgress } from "@/features/teardown/components/teardown-progress";
import { TeardownReport } from "@/features/teardown/components/teardown-report";
import {
  useStartTeardown,
  useTeardownProgress,
  useTeardownReport,
} from "@/features/teardown/hooks/use-teardown";
import { Bot, Clock, CheckCircle, XCircle, Loader2, Plus } from "lucide-react";
import type { TeardownRequest } from "@/features/teardown/types";

export default function TeardownPage() {
  const [activeTeardownId, setActiveTeardownId] = useState<string | null>(null);

  const teardownHistory = useAppStore((s) => s.teardownHistory);
  const addTeardownHistory = useAppStore((s) => s.addTeardownHistory);
  const updateTeardownHistory = useAppStore((s) => s.updateTeardownHistory);
  const teardownReportCache = useAppStore((s) => s.teardownReportCache);
  const cacheTeardownReport = useAppStore((s) => s.cacheTeardownReport);

  const startMutation = useStartTeardown();

  // Check if we have a cached report for this teardown (survives server restarts)
  const cachedEntry = activeTeardownId ? teardownReportCache[activeTeardownId] : undefined;

  const { data: progress, isLoading: isProgressLoading, isError: isProgressError } = useTeardownProgress(activeTeardownId);
  const isCompleted = progress?.overallStatus === "completed";
  const isFailed = progress?.overallStatus === "failed";
  const { data: report } = useTeardownReport(activeTeardownId, isCompleted);

  // Use cached data when server session is unavailable
  const effectiveProgress = progress ?? (isProgressError && cachedEntry ? cachedEntry.progress : undefined);
  const effectiveReport = report ?? (cachedEntry ? cachedEntry.report : undefined);
  const effectiveCompleted = effectiveProgress?.overallStatus === "completed";
  const effectiveFailed = effectiveProgress?.overallStatus === "failed";
  // True error only if server fails AND we have no cached fallback
  const showSessionError = isProgressError && !cachedEntry;


  // Update history when status changes
  useEffect(() => {
    if (activeTeardownId && progress) {
      const historyEntry = teardownHistory.find((h) => h.id === activeTeardownId);
      if (historyEntry && historyEntry.status !== progress.overallStatus) {
        updateTeardownHistory(activeTeardownId, {
          status: progress.overallStatus,
          completedAt: progress.completedAt,
          adCount: progress.analyzedAdsCount ?? historyEntry.adCount,
        });
      }
    }
  }, [activeTeardownId, progress, teardownHistory, updateTeardownHistory]);

  // Cache completed reports to localStorage so they survive server restarts
  useEffect(() => {
    if (activeTeardownId && isCompleted && report && progress) {
      cacheTeardownReport(activeTeardownId, report, progress);
    }
  }, [activeTeardownId, isCompleted, report, progress, cacheTeardownReport]);

  const handleStart = (request: TeardownRequest) => {
    startMutation.mutate(request, {
      onSuccess: (data) => {
        setActiveTeardownId(data.teardownId);
        addTeardownHistory({
          id: data.teardownId,
          competitorName: request.competitorName,
          startedAt: new Date().toISOString(),
          status: "running",
          adCount: 0,
        });
      },
    });
  };

  const showLauncher = !activeTeardownId;

  return (
    <div className="flex gap-6 h-full">
      {/* Main Content */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-purple-500/10">
              <Bot className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Openclaw Intelligence
              </h1>
              <p className="text-sm text-muted-foreground">
                Autonomous multi-step competitor analysis
              </p>
            </div>
          </div>
          {!showLauncher && (
            <button
              onClick={() => setActiveTeardownId(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Analysis
            </button>
          )}
        </div>

        {showLauncher && (
          <Card>
            <CardContent className="p-6">
              <TeardownLauncher
                onStart={handleStart}
                isLoading={startMutation.isPending}
              />
            </CardContent>
          </Card>
        )}

        {activeTeardownId && isProgressLoading && !effectiveProgress && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Initializing teardown...
            </p>
          </div>
        )}

        {activeTeardownId && effectiveProgress && !effectiveCompleted && !effectiveFailed && (
          <TeardownProgress progress={effectiveProgress} />
        )}

        {effectiveFailed && effectiveProgress && (
          <TeardownProgress progress={effectiveProgress} />
        )}

        {effectiveCompleted && effectiveReport && <TeardownReport report={effectiveReport} />}

        {effectiveCompleted && !effectiveReport && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Loading report...</p>
          </div>
        )}

        {activeTeardownId && showSessionError && (
          <div className="text-center py-12">
            <XCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              This teardown session is no longer available on the server.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start a new teardown using the button above.
            </p>
          </div>
        )}

        {!activeTeardownId && teardownHistory.length === 0 && (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Run your first competitor teardown to get started.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              The agent will discover ads, analyze top performers, scrape landing
              pages, and generate an actionable report.
            </p>
          </div>
        )}
      </div>

      {/* History Sidebar */}
      {teardownHistory.length > 0 && (
        <div className="w-72 border-l border-border p-4 overflow-y-auto space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            History
          </p>
          {teardownHistory.map((entry) => {
            const isActive = entry.id === activeTeardownId;
            return (
              <button
                key={entry.id}
                onClick={() => setActiveTeardownId(entry.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate flex-1">
                    {entry.competitorName}
                  </p>
                  {entry.status === "running" && (
                    <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400">
                      <Clock className="h-3 w-3 mr-0.5" />
                    </Badge>
                  )}
                  {entry.status === "completed" && (
                    <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                  )}
                  {entry.status === "failed" && (
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(entry.startedAt).toLocaleDateString()}
                  {entry.adCount > 0 && ` · ${entry.adCount} ads`}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
