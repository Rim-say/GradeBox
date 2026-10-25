"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createAssessment,
  type AssessmentFormState,
} from "@/app/assessments/actions";
import { LimitNotice } from "@/components/limit-notice";

const initialState: AssessmentFormState = { error: null, message: null };

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100";
const labelClass = "block text-sm font-medium text-slate-700";

export function AddAssessmentForm({
  classes,
}: {
  classes: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    createAssessment,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form after a successful add.
  useEffect(() => {
    if (state.message) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={150}
            placeholder="e.g. Essay: The Industrial Revolution"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="class_id" className={labelClass}>
            Class
          </label>
          <select
            id="class_id"
            name="class_id"
            required
            defaultValue=""
            className={inputClass}
          >
            <option value="" disabled>
              Choose a class
            </option>
            {classes.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>
                {schoolClass.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="due_date" className={labelClass}>
            Due date
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            required
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">
            When students hand in their work.
          </p>
        </div>

        <div>
          <label htmlFor="promised_return_date" className={labelClass}>
            Promised return date
          </label>
          <input
            id="promised_return_date"
            name="promised_return_date"
            type="date"
            required
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">
            When students expect their grades back.
          </p>
        </div>

        <div>
          <label htmlFor="expected_submissions" className={labelClass}>
            Expected submissions
          </label>
          <input
            id="expected_submissions"
            name="expected_submissions"
            type="number"
            required
            min={0}
            max={10000}
            step={1}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="minutes_per_submission" className={labelClass}>
            Minutes to grade one submission
          </label>
          <input
            id="minutes_per_submission"
            name="minutes_per_submission"
            type="number"
            required
            min={1}
            max={600}
            step={1}
            defaultValue={5}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">
            An estimate, not a measured time.
          </p>
        </div>
      </div>

            {state.error && state.limitReached ? (
        <LimitNotice message={state.error} />
      ) : state.error ? (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p role="status" className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add assessment"}
      </button>
    </form>
  );
}