import { NextResponse } from "next/server";
import { getTeardown, getReport } from "@/features/teardown/lib/teardown-store";

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

  if (state.progress.overallStatus !== "completed") {
    return NextResponse.json(
      { error: "Teardown not yet completed", status: state.progress.overallStatus },
      { status: 202 }
    );
  }

  const report = getReport(id);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}
