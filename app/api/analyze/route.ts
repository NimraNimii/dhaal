import { NextRequest, NextResponse } from "next/server";
import { analyzeSubmission } from "@/lib/anthropic";
import type { AnalyzeRequestBody } from "@/lib/types";

// MVP is deliberately stateless: nothing submitted here is written to a
// database or file. It exists in memory for the duration of this request
// and is discarded once the response is sent. That's the privacy-first
// posture the concept validated on â€” don't add persistence without
// updating this comment and telling users.
export async function POST(req: NextRequest) {
  let body: AnalyzeRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Malformed request body." },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeSubmission(body);
    return NextResponse.json(result);

    } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong.";

    console.error("analyze error:", message);

    const isClientError =
      message === "Submit some text or an image to analyze.";

    return NextResponse.json(
      { error: message },
      { status: isClientError ? 400 : 502 }
    );
  }


}
