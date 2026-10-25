"use client";

import { useCallback, useState, useTransition } from "react";
import {
  deleteAssessment,
  updateGradedCount,
} from "@/app/assessments/manage-actions";
import { AssessmentEditForm } from "@/components/assessment-edit-form";
import {
  formatMinutes,
  formatPromisedDate,
  hasCountMismatch,
  isComplete,
  progressPercent,
  remainingMinutes,
  remainingSubmissions,
} from "@/lib/grading";
import { LimitNotice } from "@/components/limit-notice";

type AssessmentRowProps = {
  id: string;
  title: string;
  classId: string;
  className: string;
  classes: { id: string; name: string }[];
  dueDate: string;
  promisedReturnDate: string;
  expectedSubmissions: number;
  gradedSubmissions: number;
  minutesPerSubmission: number;
};

export function AssessmentRow(props: AssessmentRowProps) {
  const [gradedInput, setGradedInput] = useState(String(props.gradedSubmissions));
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [limitReached, setLimitReached] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const closeEditor = useCallback(() => setEditing(false), []);

  // The shape our calculator functions expect.
  const assessment = {
    id: props.id,
    title: props.title,
    className: props.className,
    promisedReturnDate: props.promisedReturnDate,
    expectedSubmissions: props.expectedSubmissions,
    gradedSubmissions: props.gradedSubmissions,
    minutesPerSubmission: props.minutesPerSubmission,
  };

  const percent = progressPercent(assessment);
  const remaining = remainingSubmissions(assessment);
  const complete = isComplete(assessment);
  const mismatch = hasCountMismatch(assessment);
  const noneExpected = props.expectedSubmissions === 0;

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaved(false);

    if (gradedInput.trim() === "") {
      setError("Enter the number of graded submissions.");
      return;
    }
    const value = Number(gradedInput);

    startTransition(async () => {
      const result = await updateGradedCount(props.id, value);
            if (result.error) {
        setError(result.error);
        setLimitReached(Boolean(result.limitReached));
      } else {
        setError(null);
        setLimitReached(false);
        setSaved(true);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAssessment(props.id);
      if (result.error) {
        setError(result.error);
        setConfirmingDelete(false);
      }
      // On success the card disappears when the list reloads.
    });
  }

  if (editing) {
    return (
      <li className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-slate-900">
          Edit assessment
        </h3>
        <AssessmentEditForm
          id={props.id}
          title={props.title}
          classId={props.classId}
          dueDate={props.dueDate}
          promisedReturnDate={props.promisedReturnDate}
          expectedSubmissions={props.expectedSubmissions}
          minutesPerSubmission={props.minutesPerSubmission}
          classes={props.classes}
          onDone={closeEditor}
          onCancel={closeEditor}
        />
      </li>
    );
  }

  const barColor = mismatch ? "bg-amber-500" : "bg-teal-600";

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{props.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{props.className}</p>
        </div>
        {complete ? (
          <span className="inline-flex w-fit rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 ring-1 ring-inset ring-teal-100">
            Complete
          </span>
        ) : null}
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-slate-500">Due</dt>
          <dd className="mt-0.5 font-medium text-slate-900">
            {formatPromisedDate(props.dueDate)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Promised return</dt>
          <dd className="mt-0.5 font-medium text-slate-900">
            {formatPromisedDate(props.promisedReturnDate)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Graded</dt>
          <dd className="mt-0.5 font-medium text-slate-900">
            {props.gradedSubmissions} of {props.expectedSubmissions}{" "}
            <span className="font-normal text-slate-500">({remaining} left)</span>
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Estimated time left</dt>
          <dd className="mt-0.5 font-medium text-slate-900">
            {complete || noneExpected
              ? "None"
              : formatMinutes(remainingMinutes(assessment))}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        {noneExpected ? (
          <p className="text-sm text-slate-500">
            No submissions expected yet, so there is no progress to show.
          </p>
        ) : (
          <>
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
              aria-label={`${props.title} grading progress`}
            >
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </>
        )}
      </div>

      {mismatch ? (
        <p
          role="status"
          className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          Graded ({props.gradedSubmissions}) is higher than expected (
          {props.expectedSubmissions}). Progress is shown as 100%. Please check
          your counts.
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <form onSubmit={handleSave} className="flex items-end gap-2">
          <div>
            <label
              htmlFor={`graded-${props.id}`}
              className="block text-xs font-medium text-slate-600"
            >
              Submissions graded
            </label>
            <input
              id={`graded-${props.id}`}
              type="number"
              min={0}
              max={10000}
              step={1}
              value={gradedInput}
              onChange={(event) => {
                setGradedInput(event.target.value);
                setSaved(false);
              }}
              className="mt-1 w-28 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save"}
          </button>
          {saved ? (
            <span role="status" className="pb-1.5 text-sm text-teal-700">
              Saved
            </span>
          ) : null}
        </form>

        {confirmingDelete ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <p className="text-sm text-rose-700">
              Delete this assessment? This can&apos;t be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {pending ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={pending}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

            {error && limitReached ? (
        <div className="mt-3">
          <LimitNotice message={error} />
        </div>
      ) : error ? (
        <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </li>
  );
}