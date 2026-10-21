import { formatMinutes } from "@/lib/grading";

type SummaryCardsProps = {
  activeAssessments: number;
  remainingSubmissions: number;
  estimatedMinutes: number;
};

const cards = [
  {
    key: "active" as const,
    label: "Active assessments",
    hint: "Still waiting on grading",
  },
  {
    key: "remaining" as const,
    label: "Remaining submissions",
    hint: "Not graded yet",
  },
  {
    key: "time" as const,
    label: "Estimated grading time",
    hint: "Based on remaining work",
  },
];

export function SummaryCards({
  activeAssessments,
  remainingSubmissions,
  estimatedMinutes,
}: SummaryCardsProps) {
  const values = {
    active: String(activeAssessments),
    remaining: String(remainingSubmissions),
    time: formatMinutes(estimatedMinutes),
  };

  return (
    <section aria-label="Grading summary">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.key}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {values[card.key]}
            </p>
            <p className="mt-1 text-sm text-slate-500">{card.hint}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
