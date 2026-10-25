import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  buildWeeklyForecast,
  formatDayLabel,
  type ForecastItem,
} from "@/lib/forecast";
import { formatMinutes, formatPromisedDate } from "@/lib/grading";
import { getPlan } from "@/lib/plan";
import { createClient } from "@/lib/supabase/server";
import type { Assessment } from "@/lib/types";

function LockedForecast() {
  return (
    <section
      aria-labelledby="locked-heading"
      className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
    >
      <h2 id="locked-heading" className="text-lg font-semibold text-slate-900">
        The weekly forecast is a Pro feature
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        See how much grading remains this week, which days are heaviest, and
        which assessments take the most time.
      </p>
      <Link
        href="/settings"
        className="mt-6 inline-flex items-center rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
      >
        See plans and upgrade
      </Link>
    </section>
  );
}

function ItemLine({
  item,
  showReturnDate = false,
}: {
  item: ForecastItem;
  showReturnDate?: boolean;
}) {
  return (
    <li className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-slate-900">
        {item.title} <span className="text-slate-500">· {item.className}</span>
        {showReturnDate ? (
          <span className="text-slate-500">
            {" "}
            · was due back {formatPromisedDate(item.promisedReturnDate)}
          </span>
        ) : null}
      </span>
      <span className="text-slate-600">
        {item.remainingSubmissions} left · {formatMinutes(item.remainingMinutes)}
      </span>
    </li>
  );
}

async function ForecastContent() {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
        You need to sign in to see the forecast.
      </p>
    );
  }

  // The plan check happens on the server BEFORE any forecast data is
  // fetched. Free users never get past this point.
  const plan = await getPlan(supabase, user.id);
  if (plan !== "pro") {
    return <LockedForecast />;
  }

  // RLS means this only returns the logged-in teacher's assessments.
  const { data, error } = await supabase
    .from("assessments")
    .select(
      "id, title, promised_return_date, expected_submissions, graded_submissions, minutes_per_submission, classes(name)",
    );

  if (error) {
    return (
      <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
        Couldn&apos;t load your forecast. Please refresh the page.
      </p>
    );
  }

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

  // Same "today" rule as the dashboard: worked out once, in UTC.
  const today = new Date().toISOString().slice(0, 10);
  const forecast = buildWeeklyForecast(assessments, today);

  const busiestDay = Math.max(...forecast.days.map((day) => day.minutes), 1);

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="forecast-total-heading"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 id="forecast-total-heading" className="text-sm font-medium text-slate-500">
          This week
        </h2>
        {forecast.weekMinutes === 0 ? (
          <p className="mt-2 text-xl font-semibold text-slate-900">
            No grading remaining for the next 7 days.
          </p>
        ) : (
          <p className="mt-2 text-xl font-semibold text-slate-900">
            About {formatMinutes(forecast.weekMinutes)} of grading remaining
            this week.
          </p>
        )}
        {forecast.overdueMinutes > 0 ? (
          <p className="mt-1 text-sm text-rose-700">
            {formatMinutes(forecast.overdueMinutes)} of that is already overdue.
          </p>
        ) : null}
        <p className="mt-2 text-xs text-slate-500">
          These are estimates based on the minutes per submission you entered,
          not measured grading time.
        </p>
      </section>

      {forecast.overdueItems.length > 0 ? (
        <section
          aria-labelledby="overdue-heading"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="overdue-heading" className="text-base font-semibold text-rose-800">
              Overdue
            </h2>
            <span className="text-sm font-medium text-rose-800">
              {formatMinutes(forecast.overdueMinutes)}
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {forecast.overdueItems.map((item) => (
              <ItemLine key={item.id} item={item} showReturnDate />
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="days-heading">
        <h2 id="days-heading" className="mb-3 text-base font-semibold text-slate-900">
          By promised return date
        </h2>
        <ul className="space-y-2">
          {forecast.days.map((day) => (
            <li
              key={day.date}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-900">
                  {formatDayLabel(day.date, forecast.today)}
                </span>
                <span className="text-slate-600">
                  {day.minutes === 0 ? "Nothing due" : formatMinutes(day.minutes)}
                </span>
              </div>
              {day.minutes > 0 ? (
                <>
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-teal-600"
                      style={{ width: `${Math.round((day.minutes / busiestDay) * 100)}%` }}
                    />
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {day.items.map((item) => (
                      <ItemLine key={item.id} item={item} />
                    ))}
                  </ul>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {forecast.topContributors.length > 0 ? (
        <section
          aria-labelledby="top-heading"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 id="top-heading" className="text-base font-semibold text-slate-900">
            Biggest contributors this week
          </h2>
          <ol className="mt-3 space-y-2">
            {forecast.topContributors.map((item) => (
              <ItemLine key={item.id} item={item} />
            ))}
          </ol>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          How this is calculated
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            &quot;This week&quot; is today plus the next 6 days (
            {formatDayLabel(forecast.today, forecast.today)} to{" "}
            {formatDayLabel(forecast.windowEnd, forecast.today)}).
          </li>
          <li>
            Overdue work is shown separately and included in the weekly total,
            because it still needs to be graded.
          </li>
          <li>
            Finished assessments and ones with no expected submissions are not
            counted.
          </li>
          <li>
            {forecast.laterCount === 0
              ? "No assessments have a return date after this week."
              : `${forecast.laterCount} ${
                  forecast.laterCount === 1 ? "assessment has" : "assessments have"
                } a later return date (${formatMinutes(
                  forecast.laterMinutes,
                )}) and ${forecast.laterCount === 1 ? "is" : "are"} not included.`}
          </li>
        </ul>
      </section>
    </div>
  );
}

function ForecastSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

export default function ForecastPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Weekly workload forecast
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          How much grading is left before your promised return dates.
        </p>
      </div>
      <Suspense fallback={<ForecastSkeleton />}>
        <ForecastContent />
      </Suspense>
    </div>
  );
}