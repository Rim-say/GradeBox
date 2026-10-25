"use client";

import { useState, useTransition } from "react";
import { deleteClass, renameClass } from "@/app/classes/actions";

type ClassRowProps = {
  id: string;
  name: string;
  assessmentCount: number;
};

type Mode = "view" | "rename" | "confirm-delete";

export function ClassRow({ id, name, assessmentCount }: ClassRowProps) {
  const [mode, setMode] = useState<Mode>("view");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRename(formData: FormData) {
    startTransition(async () => {
      const result = await renameClass(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
        setMode("view");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteClass(id);
      if (result.error) {
        setError(result.error);
        setMode("view");
      }
      // On success the row disappears when the list reloads.
    });
  }

  function cancel() {
    setError(null);
    setMode("view");
  }

  const buttonBase =
    "rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-60";

  return (
    <li className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      {mode === "rename" ? (
        <form action={handleRename} className="flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="id" value={id} />
          <label htmlFor={`rename-${id}`} className="sr-only">
            Class name
          </label>
          <input
            id={`rename-${id}`}
            name="name"
            type="text"
            defaultValue={name}
            required
            maxLength={100}
            autoFocus
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className={`${buttonBase} bg-teal-600 text-white hover:bg-teal-700`}
            >
              {pending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={pending}
              className={`${buttonBase} text-slate-600 hover:bg-slate-100`}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-900">{name}</p>

          {mode === "confirm-delete" ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <p className="text-sm text-rose-700">
                {assessmentCount > 0
                  ? `This will also delete ${assessmentCount} ${
                      assessmentCount === 1 ? "assessment" : "assessments"
                    }. This can't be undone.`
                  : "Delete this class? This can't be undone."}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={pending}
                  className={`${buttonBase} bg-rose-600 text-white hover:bg-rose-700`}
                >
                  {pending ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  type="button"
                  onClick={cancel}
                  disabled={pending}
                  className={`${buttonBase} text-slate-600 hover:bg-slate-100`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("rename")}
                className={`${buttonBase} text-slate-600 hover:bg-slate-100`}
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => setMode("confirm-delete")}
                className={`${buttonBase} text-rose-700 hover:bg-rose-50`}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </li>
  );
}