import { NextRequest, NextResponse } from "next/server";
import { getAdsByBrandId } from "@/lib/foreplay/client";
import { checkRateLimit, getClientIp } from "@/lib/foreplay/rate-limiter";

export async function GET(request: NextRequest) {
  // ── Rate limiting (30 req / 60 s per IP) ────────────────────────────────────
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip);

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before retrying." },
      {
        status: 429,
        headers: {
          "Retry-After":           String(Math.ceil(rl.resetInMs / 1000)),
          "X-RateLimit-Limit":     "30",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // ── Parameter parsing ────────────────────────────────────────────────────────
  const params   = request.nextUrl.searchParams;
  const brandIds = params.getAll("brand_ids");

  if (!brandIds.length) {
    return NextResponse.json({ error: "brand_ids required" }, { status: 400 });
  }

  const cursor = params.get("cursor") ? Number(params.get("cursor")) : undefined;

  // Clamp limit: min 1, max 48 (two full 4-col pages max per request)
  const rawLimit = params.get("limit") ? Number(params.get("limit")) : 24;
  const limit    = Math.max(1, Math.min(48, rawLimit));

  try {
    const result = await getAdsByBrandId({
      brand_ids:                 brandIds,
      live:                      params.get("live") === "true" ? true : undefined,
      display_format:            params.getAll("display_format").length
                                   ? params.getAll("display_format")
                                   : ["image"],
      publisher_platform:        params.getAll("publisher_platform").length
                                   ? params.getAll("publisher_platform")
                                   : undefined,
      niches:                    params.getAll("niches").length
                                   ? params.getAll("niches")
                                   : undefined,
      running_duration_min_days: params.get("running_duration_min_days")
                                   ? Number(params.get("running_duration_min_days"))
                                   : undefined,
      order:                     (params.get("order") as "newest" | "oldest" | "longest_running" | "most_relevant") || "newest",
      limit,
      cursor,
    });

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Remaining": String(rl.remaining),
        // First pages are cached; paginated results are not
        "Cache-Control": cursor
          ? "no-store"
          : "public, s-maxage=180, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
