import { AssessmentPriorityList } from "@/components/assessment-priority-list";
import { SummaryCards } from "@/components/summary-cards";
import { prioritizeAssessments, summarizeAssessments } from "@/lib/grading";
import { sampleAssessments, sampleToday } from "@/lib/sample-data";

export default function DashboardPage() {
  const rankedAssessments = prioritizeAssessments(
    sampleAssessments,
    sampleToday,
  );
  const summary = summarizeAssessments(sampleAssessments);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
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
            first.
          </p>
        </div>
        <AssessmentPriorityList
          assessments={rankedAssessments}
          today={sampleToday}
          hasAnyAssessments={sampleAssessments.length > 0}
        />
      </section>
    </div>
  );
}
