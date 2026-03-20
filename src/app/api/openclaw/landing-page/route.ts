import { NextRequest, NextResponse } from "next/server";
import { scrapeLandingPage, getCrawlStatus } from "@/features/openclaw/lib/openclaw-client";
import { parseLandingPageIntel } from "@/features/openclaw/lib/parsers";

export async function POST(request: NextRequest) {
  try {
    const apifyToken = request.headers.get("X-Apify-Token") || undefined;
    const { url } = (await request.json()) as { url: string };

    if (!url) {
      return NextResponse.json(
        { error: "url is required" },
        { status: 400 }
      );
    }

    // Start the scrape task
    const task = await scrapeLandingPage(url);

    // Poll until complete (with timeout)
    const maxWaitMs = 60_000;
    const pollIntervalMs = 2_000;
    const startTime = Date.now();

    let result = task;
    while (
      result.status !== "completed" &&
      result.status !== "failed" &&
      Date.now() - startTime < maxWaitMs
    ) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      result = await getCrawlStatus(task.task_id, apifyToken);
    }

    if (result.status === "failed") {
      return NextResponse.json(
        { error: result.error || "Scrape failed" },
        { status: 500 }
      );
    }

    if (result.status !== "completed" || !result.result) {
      return NextResponse.json(
        { error: "Scrape timed out" },
        { status: 504 }
      );
    }

    const intel = parseLandingPageIntel(result.result, url);
    return NextResponse.json(intel);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
