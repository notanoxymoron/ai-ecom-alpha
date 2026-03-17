import type {
  ForeplayBrand,
  ForeplayAd,
  ForeplayPaginatedResponse,
  ForeplayAdResponse,
  DiscoverBrandsParams,
  DiscoverAdsParams,
  BrandAdsParams,
} from "@/shared/types/foreplay";

const BASE_URL = "https://public.api.foreplay.co";

function getApiKey(): string {
  const key = process.env.FOREPLAY_API_KEY;
  if (!key) throw new Error("FOREPLAY_API_KEY is not set");
  return key;
}

function buildParams(params: Record<string, unknown>): URLSearchParams {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.set(key, String(value));
    }
  }
  return searchParams;
}

interface FetchOptions {
  /**
   * Next.js ISR revalidation period in seconds.
   * Set to 0 to opt out of caching (e.g. for cursor-based pagination pages).
   * Defaults to 300 (5 min).
   */
  revalidate?: number;
}

async function foreplayFetch<T>(
  path: string,
  params?: Record<string, unknown>,
  { revalidate = 300 }: FetchOptions = {}
): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (params) {
    url.search = buildParams(params).toString();
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: getApiKey(),
      "Content-Type": "application/json",
    },
    // Next.js App Router cache control:
    // - Pages 1 (no cursor) get ISR caching so the same brand/niche
    //   query is served from cache for `revalidate` seconds.
    // - Cursor pages (pagination) skip cache (revalidate: 0) because
    //   the cursor value makes them unique and short-lived.
    next: { revalidate },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Foreplay API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// --- Discovery Endpoints ---

export async function discoverBrands(
  params: DiscoverBrandsParams
): Promise<ForeplayPaginatedResponse<ForeplayBrand>> {
  return foreplayFetch(
    "/api/discovery/brands",
    {
      query:  params.query,
      niches: params.niches,
      limit:  params.limit ?? 20,
      cursor: params.cursor,
    },
    // Brand lists are relatively stable — cache for 10 min
    { revalidate: params.cursor ? 0 : 600 }
  );
}

export async function discoverAds(
  params: DiscoverAdsParams
): Promise<ForeplayPaginatedResponse<ForeplayAd>> {
  return foreplayFetch(
    "/api/discovery/ads",
    {
      query:                       params.query,
      niches:                      params.niches,
      display_format:              params.display_format ?? ["image"],
      publisher_platform:          params.publisher_platform,
      running_duration_min_days:   params.running_duration_min_days,
      running_duration_max_days:   params.running_duration_max_days,
      start_date:                  params.start_date,
      end_date:                    params.end_date,
      order:                       params.order ?? "longest_running",
      limit:                       params.limit ?? 24,
      cursor:                      params.cursor,
      live:                        params.live,
    },
    // Discovery is expensive — cache first pages for 5 min, skip for paginated
    { revalidate: params.cursor ? 0 : 300 }
  );
}

// --- Brand Endpoints ---

export async function getAdsByBrandId(
  params: BrandAdsParams
): Promise<ForeplayPaginatedResponse<ForeplayAd>> {
  return foreplayFetch(
    "/api/brand/getAdsByBrandId",
    {
      brand_ids:                   params.brand_ids,
      live:                        params.live,
      display_format:              params.display_format ?? ["image"],
      publisher_platform:          params.publisher_platform,
      niches:                      params.niches,
      running_duration_min_days:   params.running_duration_min_days,
      running_duration_max_days:   params.running_duration_max_days,
      start_date:                  params.start_date,
      end_date:                    params.end_date,
      order:                       params.order ?? "newest",
      // Reduced from 50 to 24 — one full page in the 4-col grid,
      // costs fewer API credits and loads faster
      limit:                       params.limit ?? 24,
      cursor:                      params.cursor,
    },
    // Brand feeds change more often — shorter 3-min cache; skip for pagination
    { revalidate: params.cursor ? 0 : 180 }
  );
}

// --- Ad Endpoints ---

export async function getAdDetails(adId: string): Promise<ForeplayAdResponse> {
  // Individual ad details are stable — cache for 1 hour
  return foreplayFetch(`/api/ad/${encodeURIComponent(adId)}`, undefined, {
    revalidate: 3600,
  });
}
