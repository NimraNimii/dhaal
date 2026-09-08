"use client";

import { useState } from "react";
import SubmissionForm from "@/components/SubmissionForm";
import AnalysisResultCard from "@/components/AnalysisResult";
import type { AnalyzeRequestBody, AnalysisResult } from "@/lib/types";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(body: AnalyzeRequestBody) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      setResult(data as AnalysisResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't check that one. Try again in a second?"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-prose">
        <h1 className="font-display text-4xl sm:text-5xl text-shield mb-4 leading-tight">
          Before you tap anything.
        </h1>
        <p className="text-graphite mb-10 leading-relaxed">
          Forward the weird message, the urgent email, the screenshot that
          doesn't sit right — before you click, pay, or reply. Dhaal reads it
          with you and tells you exactly what looks off, or what to check to
          be sure. No scary percentages, no auto-blocking, just a straight
          answer.
        </p>

        <SubmissionForm onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <p className="mt-4 text-clay text-sm">
            {error} Agar yeh phir se ho, text paste karke try kar lein.
          </p>
        )}

        {result && <AnalysisResultCard result={result} />}

        <p className="mt-10 text-sm text-graphite/70 leading-relaxed">
          Nothing you send here is saved. It's read once, to answer you, and
          then it's gone.
        </p>
      </div>
    </main>
  );
}
