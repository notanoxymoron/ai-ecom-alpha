import { ApifyClient } from "apify-client";
import type { OpenClawAgentTask, CrawlOptions } from "../types";

function getApifyClient(tokenOverride?: string) {
  if (!tokenOverride) {
    throw new Error("Apify API token not configured. Please add it in Settings → API Keys.");
  }
  return new ApifyClient({ token: tokenOverride });
}

export async function getCrawlStatus(taskId: string, tokenOverride?: string): Promise<OpenClawAgentTask> {
  try {
    const client = getApifyClient(tokenOverride);
    const run = await client.run(taskId).get();
    
    if (!run) {
      return { task_id: taskId, status: "failed", error: "Apify run not found" };
    }

    // Map Apify statuses to our UI statuses
    const statusMap: Record<string, OpenClawAgentTask["status"]> = {
      "READY": "queued",
      "RUNNING": "in_progress",
      "SUCCEEDED": "completed",
      "FAILED": "failed",
      "TIMING-OUT": "failed",
      "ABORTING": "failed",
      "ABORTED": "failed",
    };

    const agentTask: OpenClawAgentTask = {
      task_id: taskId,
      status: statusMap[run.status] || "failed",
    };

    if (run.status === "SUCCEEDED" && run.defaultDatasetId) {
      const dataset = await client.dataset(run.defaultDatasetId).listItems();
      agentTask.result = JSON.stringify(dataset.items);
    } else if (run.status === "FAILED") {
      agentTask.error = "Apify actor run failed";
    }

    return agentTask;
  } catch (error) {
    return {
      task_id: taskId,
      status: "failed",
      error: error instanceof Error ? error.message : "Failed to fetch Apify status",
    };
  }
}

// --- Meta Ad Library Crawl (Apify) ---

export async function crawlMetaAdLibrary(
  query: string,
  options: CrawlOptions = {},
  tokenOverride?: string
): Promise<OpenClawAgentTask> {
  const client = getApifyClient(tokenOverride);
  const maxResults = options.maxResults ?? 20;

  // We provide redundant input keys to cover common Apify Facebook Scraper schema variations.
  // The 'dz_omar/facebook-ads-scraper-pro' actor will use the ones it recognizes.
  const run = await client.actor("dz_omar/facebook-ads-scraper-pro").start({
    searchQueries: [query],
    maxAds: maxResults,
    country: options.country ?? "US",
    proxyConfiguration: {
      useApifyProxy: true,
    },
  });

  return { task_id: run.id, status: "queued" };
}

// --- TikTok Top Ads Crawl (Apify) ---

export async function crawlTikTokTopAds(
  query: string,
  options: CrawlOptions = {},
  tokenOverride?: string
): Promise<OpenClawAgentTask> {
  const client = getApifyClient(tokenOverride);
  const maxResults = options.maxResults ?? 20;

  const tiktokAllowedRegions = new Set(["FR","AT","BE","BG","HR","CY","CZ","DK","EE","FI","DE","GR","HU","IS","IE","IT","LV","LI","LT","LU","MT","NL","NO","PL","PT","RO","SK","SI","ES","SE","CH","TR","GB"]);
  const region = options.country && tiktokAllowedRegions.has(options.country) ? options.country : "all";

  const run = await client.actor("zadexinho/tiktok-ads-scraper").start({
    searchQuery: query,
    maxResults: maxResults,
    fetchDetails: true,
    region,
    proxyConfiguration: {
      useApifyProxy: true,
    },
  });

  return { task_id: run.id, status: "queued" };
}

// --- Landing Page Scrape ---

export async function scrapeLandingPage(
  url: string
): Promise<OpenClawAgentTask> {
  // Placeholder for landing page scraping (e.g., using JSDOM/Cheerio or Apify's Web Scraper)
  throw new Error("Landing page scraping via Apify is not yet implemented.");
}
