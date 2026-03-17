import { NextRequest, NextResponse } from "next/server";
import { downloadGeneratedVideo } from "@/lib/video/generator";

export const maxDuration = 120;

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get("jobId");
    const asDownload = request.nextUrl.searchParams.get("download") === "1";
    if (!jobId) {
      return NextResponse.json({ error: "jobId required" }, { status: 400 });
    }

    const googleApiKey = process.env.GOOGLE_AI_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json({ error: "GOOGLE_AI_API_KEY not configured" }, { status: 500 });
    }

    const { buffer, mimeType } = await downloadGeneratedVideo(jobId, googleApiKey);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `${asDownload ? "attachment" : "inline"}; filename="${jobId.split("/").pop() || "generated-video"}.mp4"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
