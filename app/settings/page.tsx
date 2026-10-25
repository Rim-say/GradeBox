import { Suspense } from "react";
import { connection } from "next/server";
import { PlanSwitcher } from "@/components/plan-switcher";
import { isComplete } from "@/lib/grading";
import { FREE_LIMITS, getPlan } from "@/lib/plan";
import { createClient } from "@/lib/supabase/server";

function UsageRow({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const over = limit !== null && used > limit;

  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <dt className="text-slate-600">{label}</dt>
      <dd className="font-medium text-slate-900">
        {limit === null ? `${used} (unlimited)` : `${used} of ${limit}`}
        {over ? (
          <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
            Over limit
          </span>
        ) : null}
      </dd>
    </div>
  );
}

async function SettingsContent() {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
        You need to sign in to see your settings.
      </p>
    );
  }

  // RLS means these only count the logged-in teacher's rows.
  const [plan, classesResult, assessmentsResult] = await Promise.all([
    getPlan(supabase, user.id),
    supabase.from("classes").select("id", { count: "exact", head: true }),
    supabase
      .from("assessments")
      .select("expected_submissions, graded_submissions"),
  ]);

  const classCount = classesResult.count ?? 0;
  const activeAssessmentCount = (assessmentsResult.data ?? []).filter(
    (row) =>
      !isComplete({
        expectedSubmissions: row.expected_submissions,
        gradedSubmissions: row.graded_submissions,
      }),
  ).length;

  const isPro = plan === "pro";
  const overFreeLimit =
    !isPro &&
    (classCount > FREE_LIMITS.classes ||
      activeAssessmentCount > FREE_LIMITS.activeAssessments);

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="account-heading"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 id="account-heading" className="text-base font-semibold text-slate-900">
          Account
        </h2>
        <p className="mt-2 text-sm text-slate-600">{user.email}</p>
      </section>

      <section
        aria-labelledby="plan-heading"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="plan-heading" className="text-base font-semibold text-slate-900">
            Plan
          </h2>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
              isPro
                ? "bg-teal-50 text-teal-800 ring-teal-100"
                : "bg-slate-50 text-slate-700 ring-slate-200"
            }`}
          >
            {isPro ? "Pro (demo)" : "Free"}
          </span>
        </div>

        <dl className="mt-3 divide-y divide-slate-100">
          <UsageRow
            label="Classes"
            used={classCount}
            limit={isPro ? null : FREE_LIMITS.classes}
          />
          <UsageRow
            label="Active assessments"
            used={activeAssessmentCount}
            limit={isPro ? null : FREE_LIMITS.activeAssessments}
          />
        </dl>

        {overFreeLimit ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            You&apos;re over the free limits. Nothing has been deleted, but you
            can&apos;t add more until you&apos;re back under them or upgrade.
          </p>
        ) : null}

        <div className="mt-5 border-t border-slate-100 pt-5">
          <h3 className="text-sm font-semibold text-slate-900">
            {isPro ? "Pro includes" : "Upgrade to Pro for"}
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Unlimited classes and active assessments</li>
            <li>Weekly workload forecast</li>
          </ul>
          <div className="mt-4">
            <PlanSwitcher plan={plan} />
          </div>
        </div>
      </section>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your account, plan and usage.
        </p>
      </div>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}