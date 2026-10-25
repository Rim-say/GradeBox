"use client";

import { useActionState, useState } from "react";
import { login, signup, type AuthState } from "@/app/login/actions";

const initialState: AuthState = { error: null, message: null };

function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, formAction, pending] = useActionState(
    mode === "login" ? login : signup,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "signup" ? 8 : undefined}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100"
        />
      </div>

      {state.error ? (
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
        className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
      >
        {pending
          ? "Please wait..."
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </button>
    </form>
  );
}

export function AuthPanel() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">
        {mode === "login" ? "Sign in to GradeBox" : "Create your account"}
      </h1>
      <p className="mt-1 mb-5 text-sm text-slate-500">
        {mode === "login"
          ? "See what you should grade next."
          : "Start tracking your grading workload."}
      </p>

      {/* key makes React start a fresh form (and clear old messages) on switch */}
      <AuthForm key={mode} mode={mode} />

      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="mt-4 w-full text-center text-sm text-teal-700 hover:underline"
      >
        {mode === "login"
          ? "New here? Create an account"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}