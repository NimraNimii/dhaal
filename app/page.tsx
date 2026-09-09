"use client";

import { useRef, useState } from "react";
import SubmissionForm from "../components/SubmissionForm";
import AnalysisResultCard from "../components/AnalysisResult";
import type { AnalysisResult, AnalyzeRequestBody } from "../lib/types";

const examples = [
  {
    label: "Urgency",
    message:
      '"Your account will be suspended in 24 hours unless you verify now."',
  },
  {
    label: "Payment",
    message:
      '"Payment received. Send the remaining amount to confirm your order."',
  },
  {
    label: "Link",
    message:
      '"You have won a reward. Claim it here before midnight: bit.ly/..."',
  },
];

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  async function handleAnalyze(body: AnalyzeRequestBody) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Something went wrong while checking this."
        );
      }

      setResult(data as AnalysisResult);

      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F2E6] text-[#2B2621]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#DCCFB2]/70 bg-[#F7F2E6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F5C52] text-xl text-[#F7F2E6]">
              ◈
            </div>

            <div>
              <div className="font-serif text-2xl font-bold leading-none">
                Dhaal
              </div>

              <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#5C554A]">
                Think before you tap.
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a
              href="#why"
              className="transition hover:text-[#1F5C52]"
            >
              Why Dhaal?
            </a>

            <a
              href="#how"
              className="transition hover:text-[#1F5C52]"
            >
              How it works
            </a>

            <a
              href="#examples"
              className="transition hover:text-[#1F5C52]"
            >
              Examples
            </a>

            <a
              href="#faq"
              className="transition hover:text-[#1F5C52]"
            >
              FAQ
            </a>
          </nav>

          <a
            href="#checker"
            className="rounded-full bg-[#1F5C52] px-5 py-3 text-sm font-bold text-[#F7F2E6] transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Check a message →
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-[#C98A2C]/10 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:pb-28 lg:pt-24">
          <div className="relative z-10">
            <div className="mb-6 inline-flex rounded-full border border-[#DCCFB2] bg-[#EFE6D3] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em]">
              Built for everyday internet life
            </div>

            <h1 className="max-w-3xl font-serif text-6xl font-bold leading-[0.92] tracking-tight sm:text-7xl lg:text-[88px]">
              Before you
              <br />
              tap{" "}
              <span className="text-[#1F5C52] underline decoration-[#C98A2C] decoration-4 underline-offset-8">
                anything.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#5C554A]">
              Got a weird message, suspicious screenshot, or something that
              just doesn&apos;t sit right? Send it to Dhaal. We&apos;ll show
              you what stands out — in plain language.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-[#5C554A]">
              <span className="rounded-full border border-[#DCCFB2] bg-white/50 px-4 py-2">
                No scary percentages
              </span>

              <span className="rounded-full border border-[#DCCFB2] bg-white/50 px-4 py-2">
                No auto-blocking
              </span>

              <span className="rounded-full border border-[#DCCFB2] bg-white/50 px-4 py-2">
                Nothing saved
              </span>
            </div>

            <a
              href="#checker"
              className="mt-8 inline-flex items-center rounded-full bg-[#1F5C52] px-6 py-3.5 text-sm font-bold text-[#F7F2E6] transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Check something suspicious →
            </a>
          </div>

          {/* HERO VISUAL */}
          <div className="relative z-10">
            <div className="relative rounded-[28px] border border-[#DCCFB2] bg-[#EFE6D3] p-4 shadow-[0_25px_70px_rgba(43,38,33,0.12)]">
              <div className="rounded-[22px] bg-[#171B19] p-4">
                <div className="mb-4 flex items-center justify-between px-2 text-xs text-white/60">
                  <span>9:41</span>
                  <span>● ● ●</span>
                </div>

                <div className="rounded-2xl bg-white p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F5C52] text-white">
                      D
                    </div>

                    <div>
                      <div className="font-bold">Dhaal</div>
                      <div className="text-xs text-[#5C554A]">
                        Something feels off?
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#F3F1EB] p-4 text-sm leading-6">
                    Your account will be suspended in 24 hours unless you
                    verify your account at this link.
                  </div>

                  <div className="mt-4 rounded-xl border-l-4 border-[#B5502E] bg-[#F9EAE3] p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#B5502E]">
                      <span className="h-2 w-2 rounded-full bg-[#B5502E]" />
                      Red flag found
                    </div>

                    <div className="mt-2 font-serif text-xl font-bold">
                      The urgency is doing a lot of the work here.
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-[#5C554A]">
                    Dhaal explains the evidence. You decide what happens next.
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-7 -left-7 rotate-[-4deg] rounded-xl border border-[#DCCFB2] bg-[#F7F2E6] px-5 py-4 shadow-lg">
                <div className="font-serif text-lg italic">
                  “Not sure?”
                </div>

                <div className="text-xs text-[#5C554A]">
                  Send it anyway.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHECKER */}
      <section
        id="checker"
        className="border-y border-[#DCCFB2] bg-[#EFE6D3]"
      >
        <div className="mx-auto max-w-5xl px-5 py-20 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F5C52]">
              Your turn
            </p>

            <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
              Something feels off?
              <br />
              <span className="text-[#1F5C52]">
                Send it to Dhaal.
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-[#5C554A]">
              Paste the message or upload a screenshot. Dhaal focuses on the
              details actually present in what you send.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#DCCFB2] bg-[#F7F2E6] p-5 shadow-xl sm:p-8">
            <SubmissionForm
              onSubmit={handleAnalyze}
              isLoading={isLoading}
            />

            {error && (
              <div className="mt-5 rounded-xl border border-[#B5502E]/30 bg-[#F9EAE3] p-4 text-sm text-[#B5502E]">
                <strong>Something went wrong.</strong>
                <p className="mt-1">{error}</p>
              </div>
            )}

            {isLoading && (
              <div className="mt-6 rounded-xl border border-[#DCCFB2] bg-[#EFE6D3] p-5">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-[#1F5C52]" />
                  <div>
                    <p className="font-serif text-lg font-bold">
                      Dhaal is taking a look…
                    </p>
                    <p className="mt-1 text-sm text-[#5C554A]">
                      Checking the details you actually sent.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div ref={resultRef} className="mt-6 scroll-mt-28">
                <AnalysisResultCard result={result} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section
        id="why"
        className="mx-auto max-w-7xl px-5 py-24 lg:px-8"
      >
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F5C52]">
              Why Dhaal
            </p>

            <h2 className="mt-4 font-serif text-5xl font-bold leading-tight">
              Because “looks legit” isn&apos;t evidence.
            </h2>

            <p className="mt-6 max-w-md leading-7 text-[#5C554A]">
              A polished logo or official-looking message doesn&apos;t prove
              anything. Dhaal points back to the actual details.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [
                "01",
                "Evidence first",
                "We point to the actual wording, image detail, or context that triggered the concern.",
              ],
              [
                "02",
                "No fake certainty",
                "If there isn't enough information, Dhaal says so instead of inventing an answer.",
              ],
              [
                "03",
                "You stay in control",
                "Dhaal doesn't block, reply, pay, report, or take action on your behalf.",
              ],
              [
                "04",
                "Made for real life",
                "Short explanations, familiar language, and situations people actually encounter online.",
              ],
            ].map(([number, title, body]) => (
              <div
                key={number}
                className="rounded-2xl border border-[#DCCFB2] bg-white/40 p-6 transition hover:-translate-y-1 hover:bg-white/70"
              >
                <div className="text-xs font-bold text-[#C98A2C]">
                  {number}
                </div>

                <h3 className="mt-5 font-serif text-2xl font-bold">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#5C554A]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section
        id="how"
        className="bg-[#1F5C52] text-[#F7F2E6]"
      >
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C98A2C]">
              How it works
            </p>

            <h2 className="mt-4 font-serif text-5xl font-bold">
              Three steps.
              <br />
              No detective degree required.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              [
                "01",
                "Send it",
                "Paste a message or upload a screenshot.",
              ],
              [
                "02",
                "Dhaal reads it",
                "We look for pressure tactics, impersonation, suspicious details, and missing context.",
              ],
              [
                "03",
                "You decide",
                "Get a clear explanation and one sensible next step.",
              ],
            ].map(([number, title, body]) => (
              <div
                key={number}
                className="rounded-2xl border border-white/15 bg-white/5 p-7"
              >
                <div className="text-sm font-bold text-[#C98A2C]">
                  {number}
                </div>

                <h3 className="mt-10 font-serif text-3xl font-bold">
                  {title}
                </h3>

                <p className="mt-4 leading-7 text-white/70">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAMPLES */}
      <section
        id="examples"
        className="mx-auto max-w-7xl px-5 py-24 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F5C52]">
              Examples
            </p>

            <h2 className="mt-4 font-serif text-5xl font-bold">
              What can go wrong?
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-[#5C554A]">
            These are illustrative examples — not claims about real users or
            real messages.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {examples.map((example) => (
            <article
              key={example.label}
              className="rounded-2xl border border-[#DCCFB2] bg-[#EFE6D3] p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-full bg-[#B5502E]/10 px-3 py-1 text-xs font-bold text-[#B5502E]">
                  {example.label}
                </span>

                <span className="text-xl">↗</span>
              </div>

              <p className="font-serif text-xl leading-8">
                {example.message}
              </p>

              <div className="mt-8 border-t border-[#DCCFB2] pt-5 text-sm leading-6 text-[#5C554A]">
                Dhaal would explain what stands out and what you can verify
                yourself.
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* EVIDENCE */}
      <section className="bg-[#EFE6D3]">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C98A2C]">
                No mystery verdicts
              </p>

              <h2 className="mt-4 font-serif text-5xl font-bold leading-tight">
                Show me the evidence.
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-[#5C554A]">
                Dhaal isn&apos;t meant to say “trust me.” The useful part is
                understanding exactly what in the message or screenshot made
                something look suspicious.
              </p>
            </div>

            <div className="chit rotate-[1deg] p-7">
              <div className="border-l-4 border-[#C98A2C] pl-5">
                <p className="font-serif text-xl italic">
                  “Your account will be suspended in 24 hours…”
                </p>

                <p className="mt-5 text-sm leading-6 text-[#5C554A]">
                  That specific urgency matters because it pressures you to
                  act before you have time to verify the message independently.
                </p>
              </div>

              <div className="mt-7 border-t border-[#DCCFB2] pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1F5C52]">
                  The point
                </p>

                <p className="mt-2 font-serif text-lg">
                  Evidence first. Verdict second.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY */}
      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[#2B2621] px-7 py-16 text-[#F7F2E6] sm:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C98A2C]">
                The Dhaal promise
              </p>

              <h2 className="mt-4 max-w-3xl font-serif text-5xl font-bold leading-tight">
                Dhaal helps you pause.
                <br />
                It never takes the wheel.
              </h2>

              <p className="mt-6 max-w-2xl leading-7 text-white/65">
                No automatic blocking. No automatic replies. No pretending we
                know more than the evidence gives us.
              </p>
            </div>

            <a
              href="#checker"
              className="inline-flex w-fit rounded-full bg-[#F7F2E6] px-7 py-4 font-bold text-[#2B2621] transition hover:-translate-y-1"
            >
              Check something →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="mx-auto max-w-4xl px-5 pb-24 lg:px-8"
      >
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#1F5C52]">
          FAQ
        </p>

        <h2 className="mt-4 text-center font-serif text-5xl font-bold">
          Quick answers.
        </h2>

        <div className="mt-12 divide-y divide-[#DCCFB2] border-y border-[#DCCFB2]">
          {[
            [
              "Does Dhaal guarantee something is a scam?",
              "No. Dhaal explains specific evidence and can also tell you when there isn't enough information to make a useful call.",
            ],
            [
              "Can I send a screenshot?",
              "Yes. The current checker supports screenshot uploads alongside pasted text.",
            ],
            [
              "Does Dhaal automatically block anything?",
              "No. Dhaal only gives you an explanation and a manual next step.",
            ],
            [
              "Are my submissions saved?",
              "The current MVP is designed as a stateless checker and does not provide saved history by default.",
            ],
          ].map(([question, answer]) => (
            <details key={question} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-xl font-bold">
                {question}

                <span className="text-2xl text-[#1F5C52] transition group-open:rotate-45">
                  +
                </span>
              </summary>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5C554A]">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#DCCFB2] px-5 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-sm text-[#5C554A] md:flex-row">
          <div>
            <span className="font-serif text-xl font-bold text-[#2B2621]">
              Dhaal
            </span>

            <span className="ml-3">
              Think before you tap.
            </span>
          </div>

          <div className="flex flex-wrap gap-6">
            <span>No signup required</span>
            <span>Nothing saved</span>
            <span>You stay in control</span>
          </div>
        </div>
      </footer>
    </main>
  );
}