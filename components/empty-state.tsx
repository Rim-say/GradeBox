import Link from "next/link";

type EmptyStateProps = {
  variant?: "no-assessments" | "all-caught-up";
};

export function EmptyState({ variant = "no-assessments" }: EmptyStateProps) {
  if (variant === "all-caught-up") {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <p className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-lg font-semibold text-teal-700">
          ✓
        </p>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          You&apos;re all caught up
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          Every assessment with submissions has been graded. Add a new
          assessment when more work comes in.
        </p>
        <Link
          href="/assessments?new=1"
          className="mt-6 inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Add assessment
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <p className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-lg font-semibold text-teal-700">
        G
      </p>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        Nothing to grade yet
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        Add your first assessment to see what is due, how many submissions
        remain, and how long grading might take.
      </p>
      <Link
        href="/assessments?new=1"
        className="mt-6 inline-flex items-center rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
      >
        Add assessment
      </Link>
    </div>
  );
}
