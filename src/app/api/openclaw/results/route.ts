import { NextRequest, NextResponse } from "next/server";
import { getCrawlStatus } from "@/features/openclaw/lib/openclaw-client";
import {
  parseScrapedAds,
  scrapedAdToForeplayAd,
} from "@/features/openclaw/lib/parsers";

export async function GET(request: NextRequest) {
  try {
    const taskId = request.nextUrl.searchParams.get("taskId");
    const source = request.nextUrl.searchParams.get("source") as "meta" | "tiktok" | null;
    const apifyToken = request.headers.get("X-Apify-Token") || undefined;

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    const task = await getCrawlStatus(taskId, apifyToken);

    if (task.status !== "completed" || !task.result) {
      return NextResponse.json({
        status: task.status,
        ads: [],
        foreplayCompatible: [],
      });
    }

    const scrapedAds = parseScrapedAds(
      task.result,
      taskId,
      source || "meta"
    );
    const foreplayCompatible = scrapedAds
      .map(scrapedAdToForeplayAd)
      .sort((a, b) => (b.running_duration?.days ?? 0) - (a.running_duration?.days ?? 0));

    // DEBUG: expose first raw item to identify field names
    let rawSample: Record<string, unknown> | null = null;
    try {
      const rawItems = JSON.parse(task.result);
      if (Array.isArray(rawItems) && rawItems.length > 0) rawSample = rawItems[0];
    } catch {}

    return NextResponse.json({
      status: "completed",
      ads: scrapedAds,
      foreplayCompatible,
      totalResults: scrapedAds.length,
      _debug_rawSample: rawSample,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
