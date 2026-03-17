import { NextRequest, NextResponse } from "next/server";
import { discoverAds } from "@/lib/foreplay/client";
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
  const params = request.nextUrl.searchParams;
  const cursor = params.get("cursor") ? Number(params.get("cursor")) : undefined;

  // Clamp limit: min 1, max 48
  const rawLimit = params.get("limit") ? Number(params.get("limit")) : 24;
  const limit    = Math.max(1, Math.min(48, rawLimit));

  try {
    const result = await discoverAds({
      query:                     params.get("query") || undefined,
      niches:                    params.getAll("niches").length
                                   ? params.getAll("niches")
                                   : undefined,
      display_format:            params.getAll("display_format").length
                                   ? params.getAll("display_format")
                                   : ["image"],
      publisher_platform:        params.getAll("publisher_platform").length
                                   ? params.getAll("publisher_platform")
                                   : undefined,
      running_duration_min_days: params.get("running_duration_min_days")
                                   ? Number(params.get("running_duration_min_days"))
                                   : undefined,
      start_date:                params.get("start_date") || undefined,
      end_date:                  params.get("end_date") || undefined,
      order:                     (params.get("order") as "newest" | "oldest" | "longest_running" | "most_relevant") || "longest_running",
      limit,
      cursor,
      live:                      params.get("live") === "true" ? true : undefined,
    });

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Remaining": String(rl.remaining),
        // Discovery first pages are stable — cache 5 min; pagination skips cache
        "Cache-Control": cursor
          ? "no-store"
          : "public, s-maxage=300, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
