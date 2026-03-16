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

    const mappedStatus =
      task.status === "queued"
        ? "pending"
        : task.status === "in_progress"
        ? "running"
        : task.status;

    let resultCount = 0;
    if (task.result) {
        try {
            const parsed = JSON.parse(task.result);
            resultCount = Array.isArray(parsed) ? parsed.length : 0;
        } catch (e) {
            // Ignore parse errors for status check
        }
    }

    return NextResponse.json({
      taskId: task.task_id,
      status: mappedStatus,
      hasResult: !!task.result,
      error: task.error || null,
      resultCount,
      _debug: {
        rawResultLength: task.result?.length ?? 0,
        resultIsArray: task.result ? Array.isArray(JSON.parse(task.result)) : false,
        firstItemKeys: task.result ? Object.keys((JSON.parse(task.result)[0]) ?? {}) : [],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
