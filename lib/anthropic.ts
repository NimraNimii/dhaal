import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompts";
import type { AnalysisResult, AnalyzeRequestBody, Verdict } from "./types";

const MODEL = "gemini-3.5-flash";

const VALID_VERDICTS: Verdict[] = [
  "red_flag",
  "looks_okay_but_confirm",
  "not_enough_info",
];

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local (see .env.example)."
    );
  }

  return new GoogleGenAI({ apiKey });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}


function normalizeForGrounding(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[`"'â€œâ€â€˜â€™]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}


function evidenceDetailIsGrounded(
  detail: string,
  submittedText: string
): boolean {
  const evidence = normalizeForGrounding(detail);
  const source = normalizeForGrounding(submittedText);

  if (!evidence || !source) {
    return false;
  }

  // Evidence must be directly present in the submitted text.
  return source.includes(evidence);
}



function parseAnalysisResult(
  raw: string,
  submittedText?: string
): AnalysisResult {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Model did not return valid JSON.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Model response was not a JSON object.");
  }

  const {
    verdict,
    headline,
    evidence,
    whatToDo,
    uncertaintyNote,
  } = parsed;

  if (
    typeof verdict !== "string" ||
    !VALID_VERDICTS.includes(verdict as Verdict)
  ) {
    throw new Error(
      `Model returned an invalid verdict: ${String(verdict)}`
    );
  }

  if (typeof headline !== "string" || !headline.trim()) {
    throw new Error("Model response is missing a headline.");
  }

  if (!Array.isArray(evidence)) {
    throw new Error("Model response is missing an evidence array.");
  }

  if (evidence.length > 4) {
    throw new Error("Model returned too many evidence items.");
  }

  const cleanEvidence = evidence.map((item, i) => {
    if (
      !isRecord(item) ||
      typeof item.detail !== "string" ||
      typeof item.whyItMatters !== "string" ||
      !item.detail.trim() ||
      !item.whyItMatters.trim()
    ) {
      throw new Error(`Evidence item ${i} is malformed.`);
    }

  const detail = item.detail.trim();
const whyItMatters = item.whyItMatters.trim();

if (submittedText?.trim()) {


  if (!evidenceDetailIsGrounded(detail, submittedText)) {


 console.error("UNGROUNDED EVIDENCE DETAIL:", JSON.stringify(detail));
console.error("SUBMITTED TEXT:", JSON.stringify(submittedText));

  throw new Error(
    `Evidence item ${i} is not grounded in the submitted text.`
  );
}


}

return {
  detail,
  whyItMatters,
};


  });

  if (typeof whatToDo !== "string" || !whatToDo.trim()) {
    throw new Error("Model response is missing whatToDo.");
  }

  if (
    uncertaintyNote !== null &&
    uncertaintyNote !== undefined &&
    typeof uncertaintyNote !== "string"
  ) {
    throw new Error("Model uncertaintyNote is malformed.");
  }

  return {
    verdict: verdict as Verdict,
    headline: headline.trim(),
    evidence: cleanEvidence,
    whatToDo: whatToDo.trim(),
    uncertaintyNote:
      typeof uncertaintyNote === "string"
        ? uncertaintyNote.trim()
        : null,
  };
}



const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    verdict: {
      type: "string",
      enum: [
        "red_flag",
        "looks_okay_but_confirm",
        "not_enough_info",
      ],
    },
    headline: {
      type: "string",
    },
    evidence: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          detail: {
            type: "string",
          },
          whyItMatters: {
            type: "string",
          },
        },
        required: ["detail", "whyItMatters"],
      },
    },
    whatToDo: {
      type: "string",
    },
    uncertaintyNote: {
      type: ["string", "null"],
    },
  },
  required: [
    "verdict",
    "headline",
    "evidence",
    "whatToDo",
    "uncertaintyNote",
  ],
};

export async function analyzeSubmission(
  body: AnalyzeRequestBody
): Promise<AnalysisResult> {
  const { text, imageBase64, imageMediaType } = body;

  if (!text?.trim() && !imageBase64) {
    throw new Error("Submit some text or an image to analyze.");
  }

  const parts: Array<Record<string, unknown>> = [];

  if (imageBase64 && imageMediaType) {
    parts.push({
      inlineData: {
        mimeType: imageMediaType,
        data: imageBase64,
      },
    });
  }

  parts.push({
    text:
      text?.trim() ||
      "See the attached image. No extra text was given.",
  });

  const client = getClient();

  const response = await client.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts,
      },
    ],


    config: {
  systemInstruction: SYSTEM_PROMPT,

  // Dhaal needs short, predictable structured responses.
  // Low thinking reduces unnecessary internal reasoning for this
  // simple classification task and leaves more room for the JSON.

  maxOutputTokens: 2048,

  responseMimeType: "application/json",
  responseSchema: RESPONSE_SCHEMA,
},

  });

const responseText = response.text;

if (!responseText || !responseText.trim()) {
  console.error("Gemini returned no text content.", {
    hasCandidates: Boolean(response.candidates?.length),
    finishReason: response.candidates?.[0]?.finishReason,
  });

  throw new Error("Model returned no text content.");
}

console.log("Gemini response metadata:", {
  length: responseText.length,
  startsWith: responseText.slice(0, 30),
  endsWith: responseText.slice(-30),
  finishReason: response.candidates?.[0]?.finishReason,
});

return parseAnalysisResult(responseText, text);
}