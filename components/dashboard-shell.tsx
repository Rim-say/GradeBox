"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { teacherName } from "@/lib/sample-data";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/classes", label: "Classes" },
  { href: "/assessments", label: "Assessments" },
  { href: "/settings", label: "Settings" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white">
        G
      </span>
      <span className="text-lg font-semibold tracking-tight text-slate-900">
        GradeBox
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-teal-50 text-teal-800"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-full bg-slate-50">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Logo />
        <div className="mt-8 flex-1">
          <NavLinks onNavigate={() => setMobileOpen(false)} />
        </div>
        <p className="px-3 text-xs text-slate-400">
          Grading workload, made clearer.
        </p>
      </aside>

      <div className="flex min-h-full flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
              aria-expanded={mobileOpen}
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <span className="sr-only">Open menu</span>
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-4 bg-slate-700" />
                <span className="block h-0.5 w-4 bg-slate-700" />
                <span className="block h-0.5 w-4 bg-slate-700" />
              </span>
            </button>
            <div className="min-w-0">
              <p className="text-base font-semibold text-slate-900">
                Welcome back, {teacherName}
              </p>
              <p className="hidden text-sm text-slate-500 sm:block">
                Here is your grading workload.
              </p>
            </div>
          </div>
          <Link
            href="/assessments?new=1"
            className="inline-flex shrink-0 items-center rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add assessment</span>
          </Link>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
