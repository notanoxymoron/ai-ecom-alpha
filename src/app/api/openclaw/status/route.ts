import { NextRequest, NextResponse } from "next/server";
import { getCrawlStatus } from "@/features/openclaw/lib/openclaw-client";

export async function GET(request: NextRequest) {
  try {
    const taskId = request.nextUrl.searchParams.get("taskId");
    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    const task = await getCrawlStatus(taskId);

    return NextResponse.json({
      taskId: task.task_id,
      status: task.status,
      hasResult: !!task.result,
      error: task.error || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
