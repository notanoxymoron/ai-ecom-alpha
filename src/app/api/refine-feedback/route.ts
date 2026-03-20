import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { feedback } = (await request.json()) as { feedback: string };
    if (!feedback?.trim()) {
      return NextResponse.json({ error: "feedback required" }, { status: 400 });
    }

    const googleApiKey = request.headers.get("X-Google-Ai-Key");
    if (!googleApiKey) {
      return NextResponse.json({ error: "Google AI API key required" }, { status: 400 });
    }

    const systemPrompt = `You convert user rejection feedback about an AI-generated ad image into a concise, constructive instruction for the image generation model.

Rules:
- Turn complaints into positive instructions (what TO do, not what went wrong)
- Be specific and actionable
- Keep it to 1-2 sentences max
- Do NOT add any preamble, explanation, or formatting — just output the instruction directly

Examples:
- Feedback: "The text/words below the image are illegible and do not make sense"
  Instruction: "Any text or wording in the image must be legible, correctly spelled, and semantically coherent."
- Feedback: "Colors are too dark, doesn't match my brand"
  Instruction: "Use lighter, vibrant colors that closely match the provided brand color palette."
- Feedback: "The layout is completely different from the original"
  Instruction: "Closely replicate the original ad's layout, element positioning, and visual hierarchy."`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: feedback }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 150 },
        }),
      }
    );

    if (!res.ok) {
      // Fallback: return a simple rewrite if the API call fails
      return NextResponse.json({ instruction: feedback });
    }

    const data = await res.json();
    const instruction =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || feedback;

    return NextResponse.json({ instruction });
  } catch {
    return NextResponse.json({ error: "Failed to refine feedback" }, { status: 500 });
  }
}
