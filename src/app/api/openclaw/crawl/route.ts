import { NextRequest, NextResponse } from "next/server";
import {
  crawlMetaAdLibrary,
  crawlTikTokTopAds,
  scrapeLandingPage,
} from "@/features/openclaw/lib/openclaw-client";
import type { CrawlOptions } from "@/features/openclaw/types";

export async function POST(request: NextRequest) {
  try {
    const apifyToken = request.headers.get("X-Apify-Token") || undefined;
    const body = await request.json();
    const {
      source,
      query,
      options = {},
    } = body as {
      source: "meta_ad_library" | "tiktok_top_ads" | "landing_page";
      query: string;
      options?: CrawlOptions;
    };

    if (!source || !query) {
      return NextResponse.json(
        { error: "source and query are required" },
        { status: 400 }
      );
    }

    let task;
    switch (source) {
      case "meta_ad_library":
        task = await crawlMetaAdLibrary(query, options, apifyToken);
        break;
      case "tiktok_top_ads":
        task = await crawlTikTokTopAds(query, options, apifyToken);
        break;
      case "landing_page":
        task = await scrapeLandingPage(query);
        break;
      default:
        return NextResponse.json(
          { error: `Invalid source: ${source}` },
          { status: 400 }
        );
    }

    const mappedStatus =
      task.status === "queued"
        ? "pending"
        : task.status === "in_progress"
        ? "running"
        : task.status;

    return NextResponse.json({
      taskId: task.task_id,
      status: mappedStatus,
      source,
      query,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
