import type { OpenClawAgentTask, CrawlOptions } from "../types";

const OPENCLAW_URL = process.env.OPENCLAW_API_URL || "http://localhost:3100";

async function openclawFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${OPENCLAW_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenClaw API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// --- Meta Ad Library Crawl ---

const META_AD_LIBRARY_PROMPT = `You are a competitor intelligence agent. Your task is to search the Meta Ad Library for ads related to the following query.

INSTRUCTIONS:
1. Go to https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q={query}
2. Wait for results to load
3. For each ad found (up to {maxResults}), extract:
   - Advertiser name
   - Ad text/copy (primary text)
   - Image URL (if image ad)
   - Video URL (if video ad)
   - Landing page URL (from CTA button)
   - Start date
   - Whether it's currently active
   - Platform (Facebook, Instagram, etc.)
4. Return results as a JSON array

Return ONLY valid JSON array with objects having these fields:
[{"advertiserName": "", "adText": "", "imageUrl": "", "videoUrl": "", "landingPageUrl": "", "startDate": "", "isActive": true, "platform": []}]`;

export async function crawlMetaAdLibrary(
  query: string,
  options: CrawlOptions = {}
): Promise<OpenClawAgentTask> {
  const maxResults = options.maxResults ?? 20;
  const country = options.country ?? "US";

  const prompt = META_AD_LIBRARY_PROMPT.replace("{query}", query)
    .replace("{maxResults}", String(maxResults))
    .replace("country=US", `country=${country}`);

  return openclawFetch<OpenClawAgentTask>("/api/agent/task", {
    method: "POST",
    body: JSON.stringify({
      prompt,
      tools: ["browser_control", "web_fetch"],
      timeout: 120,
    }),
  });
}

// --- TikTok Top Ads Crawl ---

const TIKTOK_ADS_PROMPT = `You are a competitor intelligence agent. Your task is to find top-performing TikTok ads related to the following query.

INSTRUCTIONS:
1. Go to https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en
2. Search for: "{query}"
3. Sort by performance/engagement
4. For each ad found (up to {maxResults}), extract:
   - Advertiser name
   - Ad text/caption
   - Video thumbnail URL
   - Video URL (if accessible)
   - Landing page URL
   - Engagement metrics (likes, shares, comments)
   - Whether it's currently running
5. Return results as a JSON array

Return ONLY valid JSON array with objects having these fields:
[{"advertiserName": "", "adText": "", "imageUrl": "", "videoUrl": "", "landingPageUrl": "", "isActive": true, "platform": ["tiktok"], "engagement": {"likes": 0, "shares": 0, "comments": 0}}]`;

export async function crawlTikTokTopAds(
  query: string,
  options: CrawlOptions = {}
): Promise<OpenClawAgentTask> {
  const maxResults = options.maxResults ?? 20;

  const prompt = TIKTOK_ADS_PROMPT.replace("{query}", query).replace(
    "{maxResults}",
    String(maxResults)
  );

  return openclawFetch<OpenClawAgentTask>("/api/agent/task", {
    method: "POST",
    body: JSON.stringify({
      prompt,
      tools: ["browser_control", "web_fetch"],
      timeout: 120,
    }),
  });
}

// --- Landing Page Scrape ---

const LANDING_PAGE_PROMPT = `You are a marketing intelligence analyst. Analyze the following landing page and extract key conversion elements.

URL: {url}

Use web_fetch to get the page content, then extract:
1. Main headline
2. Subheadline (if any)
3. Primary CTA text and button text
4. Special offers or discounts mentioned
5. Social proof elements (testimonials, ratings, user counts, trust badges)
6. Price points mentioned

Return ONLY valid JSON:
{"headline": "", "subheadline": "", "cta": "", "offers": [], "socialProof": [], "pricePoints": []}`;

export async function scrapeLandingPage(
  url: string
): Promise<OpenClawAgentTask> {
  const prompt = LANDING_PAGE_PROMPT.replace("{url}", url);

  return openclawFetch<OpenClawAgentTask>("/api/agent/task", {
    method: "POST",
    body: JSON.stringify({
      prompt,
      tools: ["web_fetch"],
      timeout: 60,
    }),
  });
}

// --- Task Status ---

export async function getCrawlStatus(
  taskId: string
): Promise<OpenClawAgentTask> {
  return openclawFetch<OpenClawAgentTask>(
    `/api/agent/task/${encodeURIComponent(taskId)}`
  );
}
