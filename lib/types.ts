export type Verdict = "red_flag" | "looks_okay_but_confirm" | "not_enough_info";

export interface EvidenceItem {
  /** The specific detail pulled from what was submitted — a quote, a link, a number, a phrasing. */
  detail: string;
  /** Why that specific detail matters, in plain language. */
  whyItMatters: string;
}

export interface AnalysisResult {
  verdict: Verdict;
  /** One short sentence, the first thing the person reads. */
  headline: string;
  /** 1-4 cited pieces of evidence. Never empty unless verdict is not_enough_info. */
  evidence: EvidenceItem[];
  /** One concrete, manual next step for the person to take themselves. */
  whatToDo: string;
  /** Only present for real caveats or when verdict is not_enough_info. */
  uncertaintyNote?: string | null;
}

export interface AnalyzeRequestBody {
  text?: string;
  imageBase64?: string;
  imageMediaType?: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
}
