import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompts";
import type { AnalysisResult, AnalyzeRequestBody, Verdict } from "./types";

// Model choice: claude-sonnet-5 is a good default balance of quality and
// cost for a consumer product. If per-check cost matters more than nuance
// at your scale, claude-haiku-4-5-20251001 is a cheaper drop-in swap.
// Check https://docs.claude.com for current model IDs and pricing before
// you ship — this list changes over time.
const MODEL = "claude-sonnet-5";

const VALID_VERDICTS: Verdict[] = [
  "red_flag",
  "looks_okay_but_confirm",
  "not_enough_info",
];

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.example)."
    );
  }
  return new Anthropic({ apiKey });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validates the model's JSON output actually matches our contract before
 * it ever reaches the UI. Never trust model output blindly for something
 * users make decisions from.
 */
function parseAnalysisResult(raw: string): AnalysisResult {
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Model did not return valid JSON.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Model response was not a JSON object.");
  }

  const { verdict, headline, evidence, whatToDo, uncertaintyNote } = parsed;

  if (typeof verdict !== "string" || !VALID_VERDICTS.includes(verdict as Verdict)) {
    throw new Error(`Model returned an invalid verdict: ${String(verdict)}`);
  }
  if (typeof headline !== "string" || !headline.trim()) {
    throw new Error("Model response is missing a headline.");
  }
  if (!Array.isArray(evidence)) {
    throw new Error("Model response is missing an evidence array.");
  }
  const cleanEvidence = evidence.map((item, i) => {
    if (
      !isRecord(item) ||
      typeof item.detail !== "string" ||
      typeof item.whyItMatters !== "string"
    ) {
      throw new Error(`Evidence item ${i} is malformed.`);
    }
    return { detail: item.detail, whyItMatters: item.whyItMatters };
  });
  if (typeof whatToDo !== "string" || !whatToDo.trim()) {
    throw new Error("Model response is missing whatToDo.");
  }

  return {
    verdict: verdict as Verdict,
    headline,
    evidence: cleanEvidence,
    whatToDo,
    uncertaintyNote:
      typeof uncertaintyNote === "string" ? uncertaintyNote : null,
  };
}

export async function analyzeSubmission(
  body: AnalyzeRequestBody
): Promise<AnalysisResult> {
  const { text, imageBase64, imageMediaType } = body;

  if (!text?.trim() && !imageBase64) {
    throw new Error("Submit some text or an image to analyze.");
  }

  const content: Array<Anthropic.Messages.TextBlockParam | Anthropic.Messages.ImageBlockParam> = [];

  if (imageBase64 && imageMediaType) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: imageMediaType,
        data: imageBase64,
      },
    });
  }

  content.push({
    type: "text",
    text: text?.trim() || "See the attached image. No extra text was given.",
  });

  const client = getClient();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.Messages.TextBlock => block.type === "text"
  );
  if (!textBlock) {
    throw new Error("Model returned no text content.");
  }

  return parseAnalysisResult(textBlock.text);
}
