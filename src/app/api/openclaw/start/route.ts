import { NextResponse } from "next/server";
import { runTeardown } from "@/features/teardown/lib/orchestrator";
import type { TeardownRequest } from "@/features/teardown/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TeardownRequest;

    if (!body.competitorName?.trim()) {
      return NextResponse.json(
        { error: "competitorName is required" },
        { status: 400 }
      );
    }

    if (!body.sources || body.sources.length === 0) {
      return NextResponse.json(
        { error: "At least one source must be selected" },
        { status: 400 }
      );
    }

    const id = `td_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Fire and forget — the orchestrator updates its own state
    runTeardown(id, {
      ...body,
      maxAdsToAnalyze: body.maxAdsToAnalyze || 5,
    }).catch(() => {
      // Errors are captured inside runTeardown via the store
    });

    return NextResponse.json({ teardownId: id, status: "running" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start teardown" },
      { status: 500 }
    );
  }
}
