"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { TeardownRequest, TeardownProgress, TeardownReport } from "../types";

export function useStartTeardown() {
  return useMutation({
    mutationFn: async (request: TeardownRequest) => {
      const res = await fetch("/api/openclaw/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to start teardown (${res.status})`);
      }
      return res.json() as Promise<{ teardownId: string; status: string }>;
    },
  });
}

export function useTeardownProgress(id: string | null) {
  return useQuery<TeardownProgress>({
    queryKey: ["teardown-progress", id],
    queryFn: async () => {
      const res = await fetch(`/api/openclaw/status?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch teardown status");
      return res.json();
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      if (data.overallStatus === "completed" || data.overallStatus === "failed") return false;
      return 3000;
    },
  });
}

export function useTeardownReport(id: string | null, enabled: boolean) {
  return useQuery<TeardownReport>({
    queryKey: ["teardown-report", id],
    queryFn: async () => {
      const res = await fetch(`/api/openclaw/report?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch teardown report");
      return res.json();
    },
    enabled: !!id && enabled,
  });
}
