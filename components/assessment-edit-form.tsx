"use client";

import { useActionState, useEffect } from "react";
import { updateAssessment } from "@/app/assessments/manage-actions";
import type { AssessmentFormState } from "@/app/assessments/actions";
import { LimitNotice } from "@/components/limit-notice";

const initialState: AssessmentFormState = { error: null, message: null };

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100";
const labelClass = "block text-sm font-medium text-slate-700";

type AssessmentEditFormProps = {
  id: string;
  title: string;
  classId: string;
  dueDate: string;
  promisedReturnDate: string;
  expectedSubmissions: number;
  minutesPerSubmission: number;
  classes: { id: string; name: string }[];
  onDone: () => void;
  onCancel: () => void;
};

export function AssessmentEditForm(props: AssessmentEditFormProps) {
  const { onDone } = props;
  const [state, formAction, pending] = useActionState(
    updateAssessment,
    initialState,
  );

  // Close the form after a successful save.
  useEffect(() => {
    if (state.message) {
      onDone();
    }
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={props.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`title-${props.id}`} className={labelClass}>
            Title
          </label>
          <input
            id={`title-${props.id}`}
            name="title"
            type="text"
            required
            maxLength={150}
            defaultValue={props.title}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`class-${props.id}`} className={labelClass}>
            Class
          </label>
          <select
            id={`class-${props.id}`}
            name="class_id"
            required
            defaultValue={props.classId}
            className={inputClass}
          >
            {props.classes.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>
                {schoolClass.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`due-${props.id}`} className={labelClass}>
            Due date
          </label>
          <input
            id={`due-${props.id}`}
            name="due_date"
            type="date"
            required
            defaultValue={props.dueDate}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`return-${props.id}`} className={labelClass}>
            Promised return date
          </label>
          <input
            id={`return-${props.id}`}
            name="promised_return_date"
            type="date"
            required
            defaultValue={props.promisedReturnDate}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`expected-${props.id}`} className={labelClass}>
            Expected submissions
          </label>
          <input
            id={`expected-${props.id}`}
            name="expected_submissions"
            type="number"
            required
            min={0}
            max={10000}
            step={1}
            defaultValue={props.expectedSubmissions}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`minutes-${props.id}`} className={labelClass}>
            Minutes to grade one submission
          </label>
          <input
            id={`minutes-${props.id}`}
            name="minutes_per_submission"
            type="number"
            required
            min={1}
            max={600}
            step={1}
            defaultValue={props.minutesPerSubmission}
            className={inputClass}
          />
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Editing details never changes how many submissions you have graded.
      </p>

        {state.error && state.limitReached ? (
        <LimitNotice message={state.error} />
      ) : state.error ? (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={props.onCancel}
          disabled={pending}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}