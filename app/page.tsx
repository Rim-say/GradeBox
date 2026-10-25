import { Suspense } from "react";
import { connection } from "next/server";
import { AssessmentPriorityList } from "@/components/assessment-priority-list";
import { SummaryCards } from "@/components/summary-cards";
import { prioritizeAssessments, summarizeAssessments } from "@/lib/grading";
import { createClient } from "@/lib/supabase/server";
import type { Assessment } from "@/lib/types";

async function DashboardContent() {
  await connection();
  const supabase = await createClient();

  // RLS means this only returns the logged-in teacher's assessments.
  const { data, error } = await supabase
    .from("assessments")
    .select(
      "id, title, promised_return_date, expected_submissions, graded_submissions, minutes_per_submission, classes(name)",
    );

  if (error) {
    return (
      <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
        Couldn&apos;t load your dashboard. Please refresh the page.
      </p>
    );
  }

  // Convert database rows into the shape the calculator expects.
  const assessments: Assessment[] = (data ?? []).map((row) => {
      const related = row.classes as unknown as
      | { name: string }
      | { name: string }[]
      | null;
    const className = Array.isArray(related)
      ? related[0]?.name
      : related?.name;

    return {
      id: row.id,
      title: row.title,
      className: className ?? "Unknown class",
      promisedReturnDate: row.promised_return_date,
      expectedSubmissions: row.expected_submissions,
      gradedSubmissions: row.graded_submissions,
      minutesPerSubmission: row.minutes_per_submission,
    };
  });

  // "Today" is worked out once here and passed everywhere (YYYY-MM-DD, UTC).
  const today = new Date().toISOString().slice(0, 10);

  const ranked = prioritizeAssessments(assessments, today);
  const summary = summarizeAssessments(assessments);

  return (
    <>
      <SummaryCards
        activeAssessments={summary.activeAssessments}
        remainingSubmissions={summary.remainingSubmissions}
        estimatedMinutes={summary.estimatedMinutes}
      />

      <section aria-labelledby="grade-next-heading">
        <div className="mb-4">
          <h1
            id="grade-next-heading"
            className="text-2xl font-semibold tracking-tight text-slate-900"
          >
            What should I grade next?
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Assessments are ordered by promised return date, with overdue work
            first. Time estimates are based on your own per-paper estimates,
            not measured grading time.
          </p>
        </div>
        <AssessmentPriorityList
          assessments={ranked}
          today={today}
          hasAnyAssessments={assessments.length > 0}
        />
      </section>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}