import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { AddAssessmentForm } from "@/components/add-assessment-form";
import { AssessmentRow } from "@/components/assessment-row";
import { createClient } from "@/lib/supabase/server";

async function AssessmentsContent() {
  await connection();
  const supabase = await createClient();

  // RLS means both queries only return the logged-in teacher's rows.
  const [classesResult, assessmentsResult] = await Promise.all([
    supabase.from("classes").select("id, name").order("name"),
    supabase
      .from("assessments")
      .select(
        "id, title, class_id, due_date, promised_return_date, expected_submissions, graded_submissions, minutes_per_submission, classes(name)",
      )
      .order("promised_return_date"),
  ]);

  if (classesResult.error || assessmentsResult.error) {
    return (
      <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
        Couldn&apos;t load your assessments. Please refresh the page.
      </p>
    );
  }

  const classes = classesResult.data ?? [];
  const assessments = assessmentsResult.data ?? [];

  return (
    <>
      <section
        aria-labelledby="add-assessment-heading"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2
          id="add-assessment-heading"
          className="mb-4 text-base font-semibold text-slate-900"
        >
          Add an assessment
        </h2>
        {classes.length === 0 ? (
          <p className="text-sm text-slate-600">
            You need a class first.{" "}
            <Link href="/classes" className="font-medium text-teal-700 hover:underline">
              Create a class
            </Link>{" "}
            and then come back to add assessments.
          </p>
        ) : (
          <AddAssessmentForm classes={classes} />
        )}
      </section>

      <section aria-labelledby="assessment-list-heading">
        <h2
          id="assessment-list-heading"
          className="mb-3 text-base font-semibold text-slate-900"
        >
          Your assessments
        </h2>

        {assessments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              No assessments yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Add your first assessment above to start tracking your grading.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {assessments.map((assessment) => {
              const related = assessment.classes as unknown as
                | { name: string }
                | { name: string }[]
                | null;
              const className = Array.isArray(related)
                ? related[0]?.name
                : related?.name;

              return (
                <AssessmentRow
                  key={assessment.id}
                  id={assessment.id}
                  title={assessment.title}
                  classId={assessment.class_id}
                  className={className ?? "Unknown class"}
                  classes={classes}
                  dueDate={assessment.due_date}
                  promisedReturnDate={assessment.promised_return_date}
                  expectedSubmissions={assessment.expected_submissions}
                  gradedSubmissions={assessment.graded_submissions}
                  minutesPerSubmission={assessment.minutes_per_submission}
                />
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

function AssessmentsSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

export default function AssessmentsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Assessments
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track what you need to grade and when you promised it back.
        </p>
      </div>
      <Suspense fallback={<AssessmentsSkeleton />}>
        <AssessmentsContent />
      </Suspense>
    </div>
  );
}