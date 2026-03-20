import { NextRequest, NextResponse } from "next/server";
import { discoverBrands } from "@/lib/foreplay/client";

export async function GET(request: NextRequest) {
  const foreplayKey = request.headers.get("X-Foreplay-Key") || undefined;
  const params = request.nextUrl.searchParams;
  try {
    const result = await discoverBrands({
      query: params.get("query") || undefined,
      niches: params.getAll("niches").length ? params.getAll("niches") : undefined,
      limit: params.get("limit") ? Number(params.get("limit")) : 20,
      cursor: params.get("cursor") ? Number(params.get("cursor")) : undefined,
    }, foreplayKey);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
