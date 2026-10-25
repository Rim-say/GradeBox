"use client";

import { useState, useTransition } from "react";
import { setDemoPlan } from "@/app/settings/actions";
import type { Plan } from "@/lib/plan";

export function PlanSwitcher({ plan }: { plan: Plan }) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function change(next: Plan) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await setDemoPlan(next);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage(result.message);
      }
    });
  }

  return (
    <div className="space-y-3">
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
        <span className="font-semibold">Demo only.</span> No payment is taken.
        This button simulates an upgrade so the Pro features can be tried. A
        real version would connect a payment provider.
      </p>

      {plan === "free" ? (
        <button
          type="button"
          onClick={() => change("pro")}
          disabled={pending}
          className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Working..." : "Upgrade to Pro (demo)"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => change("free")}
          disabled={pending}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {pending ? "Working..." : "Switch back to Free (demo)"}
        </button>
      )}

      {error ? (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">
          {message}
        </p>
      ) : null}
    </div>
  );
}