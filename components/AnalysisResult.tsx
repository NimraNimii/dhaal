import type { AnalysisResult, Verdict } from "@/lib/types";

const VERDICT_META: Record<Verdict, { label: string; color: string }> = {
  red_flag: { label: "Red flags found", color: "bg-clay" },
  looks_okay_but_confirm: {
    label: "Looks okay — one thing to confirm",
    color: "bg-sage",
  },
  not_enough_info: { label: "Can't tell yet", color: "bg-graphite" },
};

export default function AnalysisResultCard({ result }: { result: AnalysisResult }) {
  const meta = VERDICT_META[result.verdict];

  return (
    <div className="chit p-6 sm:p-8 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${meta.color}`} />
        <span className="text-sm text-graphite">{meta.label}</span>
      </div>

      <p className="font-display text-2xl italic text-ink mb-6 leading-snug">
        {result.headline}
      </p>

      {result.evidence.length > 0 && (
        <div className="mb-6">
          <p className="font-display italic text-graphite/80 mb-2">
            What tipped it off
          </p>
          <ul className="space-y-3">
            {result.evidence.map((item, i) => (
              <li key={i} className="border-l-2 border-turmeric pl-3">
                <p className="text-sm text-ink">{item.detail}</p>
                <p className="text-sm text-graphite">{item.whyItMatters}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-line pt-4">
        <p className="font-display italic text-graphite/80 mb-1">Do this next</p>
        <p className="text-ink">{result.whatToDo}</p>
      </div>

      {result.uncertaintyNote && (
        <p className="mt-4 text-sm text-graphite italic">{result.uncertaintyNote}</p>
      )}
    </div>
  );
}
