import Groq from "groq-sdk";
import { SYSTEM_PROMPT } from "./prompts";
import type { AnalysisResult, AnalyzeRequestBody, Verdict } from "./types";

const TEXT_MODEL = "openai/gpt-oss-20b";
const VISION_MODEL = "qwen/qwen3.8-27b";

const VALID_VERDICTS: Verdict[] = [
  "red_flag",
  "looks_okay_but_confirm",
  "not_enough_info",
];

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to .env.local (see .env.example)."
    );
  }

  return new Groq({ apiKey });
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

  return source.includes(evidence);
}
function whatToDoHasMultipleActions(value: string): boolean {
  const normalized = value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  // Detect repeated imperative/action clauses rather than
  // simply treating "aur", "and", etc. as multiple actions.
  const actionClauses = normalized.match(
    /\b(?:na\s+(?:karein|dein|bhejein|share\s+karein)|(?:karein|dein|bhejein|share\s+karein|click\s+karein|reply\s+karein|verify\s+karein))\b/g
  );

  if (actionClauses && actionClauses.length > 1) {
    return true;
  }

  // English-style separate actions.
  const englishActions = normalized.match(
    /\b(?:do not|don't|never)\s+\w+(?:\s+\w+){0,3}\b|\b(?:click|reply|verify|share|send|open|contact|call|visit|download|install|enter)\b/g
  );

  if (englishActions && englishActions.length > 1) {
    return true;
  }

  return false;
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
        console.error(
          "UNGROUNDED EVIDENCE DETAIL:",
          JSON.stringify(detail)
        );
        console.error(
          "SUBMITTED TEXT:",
          JSON.stringify(submittedText)
        );

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

const cleanWhatToDo = whatToDo.trim();

if (whatToDoHasMultipleActions(cleanWhatToDo)) {
  console.error(
    "MULTIPLE ACTIONS IN whatToDo:",
    JSON.stringify(cleanWhatToDo)
  );

  throw new Error(
    "Model returned multiple actions in whatToDo."
  );
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
    whatToDo: cleanWhatToDo,
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
        additionalProperties: false,
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
  additionalProperties: false,
};

export async function analyzeSubmission(
  body: AnalyzeRequestBody
): Promise<AnalysisResult> {
  const { text, imageBase64, imageMediaType } = body;

  if (!text?.trim() && !imageBase64) {
    throw new Error("Submit some text or an image to analyze.");
  }



  const client = getClient();


  const userContent =
  text?.trim() ||
  "Analyze the attached screenshot according to the Dhaal rules.";

const isVisionRequest = Boolean(imageBase64 && imageMediaType);

const model = isVisionRequest ? VISION_MODEL : TEXT_MODEL;

const messageContent = isVisionRequest
  ? [
      {
        type: "text" as const,
        text: userContent,
      },
      {
        type: "image_url" as const,
        image_url: {
          url: `data:${imageMediaType};base64,${imageBase64}`,
        },
      },
    ]
  : userContent;

const response = await client.chat.completions.create({
  model,

  messages: [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: messageContent,
    },
  ],

  response_format: {
    type: "json_schema",
    json_schema: {
      name: "dhaal_analysis",
      strict: true,
      schema: RESPONSE_SCHEMA,
    },
  },
  include_reasoning: false,
max_completion_tokens: 1000,

});

const responseText = response.choices[0]?.message?.content;

if (!responseText || !responseText.trim()) {
  console.error("Groq returned no text content.", {
    model,
    finishReason: response.choices[0]?.finish_reason,
  });

  throw new Error("Model returned no text content.");
}

console.log("Groq response metadata:", {
  model,
  isVisionRequest,
  length: responseText.length,
  startsWith: responseText.slice(0, 30),
  endsWith: responseText.slice(-30),
  finishReason: response.choices[0]?.finish_reason,
});

return parseAnalysisResult(responseText, text);
}