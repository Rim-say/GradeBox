import type { Assessment } from "@/lib/types";
import {
  dueStatusLabel,
  formatPromisedDate,
  getDueStatus,
  progressPercent,
  remainingSubmissions,
} from "@/lib/grading";
import { EmptyState } from "./empty-state";

const statusStyles = {
  overdue: "bg-rose-50 text-rose-700 ring-rose-100",
  "due-soon": "bg-amber-50 text-amber-800 ring-amber-100",
  upcoming: "bg-sky-50 text-sky-800 ring-sky-100",
};

const barStyles = {
  overdue: "bg-rose-500",
  "due-soon": "bg-amber-500",
  upcoming: "bg-teal-600",
};

export function AssessmentPriorityList({
  assessments,
  today,
}: {
  assessments: Assessment[];
  today: string;
}) {
  if (assessments.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="space-y-3">
      {assessments.map((assessment) => {
        const status = getDueStatus(assessment.promisedReturnDate, today);
        const remaining = remainingSubmissions(assessment);
        const percent = progressPercent(assessment);

        return (
          <li
            key={assessment.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-900">
                  {assessment.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {assessment.className}
                </p>
              </div>
              <span
                className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status]}`}
              >
                {dueStatusLabel(status)}
              </span>
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Promised return</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {formatPromisedDate(assessment.promisedReturnDate)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Graded</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {assessment.gradedSubmissions} of{" "}
                  {assessment.expectedSubmissions}{" "}
                  <span className="font-normal text-slate-500">
                    ({remaining} left)
                  </span>
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span>{percent}%</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${assessment.title} grading progress`}
              >
                <div
                  className={`h-full rounded-full ${barStyles[status]}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
