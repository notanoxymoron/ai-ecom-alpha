import { NextResponse } from "next/server";
import { getTeardown } from "@/features/teardown/lib/teardown-store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const state = getTeardown(id);
  if (!state) {
    return NextResponse.json({ error: "Teardown not found" }, { status: 404 });
  }

  return NextResponse.json(state.progress);
}
