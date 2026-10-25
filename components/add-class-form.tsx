"use client";

import { useActionState, useEffect, useRef } from "react";
import { createClass, type ClassFormState } from "@/app/classes/actions";
import { LimitNotice } from "@/components/limit-notice";

const initialState: ClassFormState = { error: null, message: null };

export function AddClassForm() {
  const [state, formAction, pending] = useActionState(createClass, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the input after a successful add.
  useEffect(() => {
    if (state.message) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="class-name" className="sr-only">
          Class name
        </label>
        <input
          id="class-name"
          name="name"
          type="text"
          required
          maxLength={100}
          placeholder="e.g. History 10A"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Adding..." : "Add class"}
        </button>
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
    </form>
  );
}