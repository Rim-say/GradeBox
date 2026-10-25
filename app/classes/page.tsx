import { Suspense } from "react";
import { connection } from "next/server";
import { AddClassForm } from "@/components/add-class-form";
import { ClassRow } from "@/components/class-row";
import { createClient } from "@/lib/supabase/server";

async function ClassList() {
  await connection();
  const supabase = await createClient();

  // RLS means this only returns the logged-in teacher's classes.
  // assessments(count) also counts each class's assessments.
  const { data: classes, error } = await supabase
    .from("classes")
    .select("id, name, assessments(count)")
    .order("name");

  if (error) {
    return (
      <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
        Couldn&apos;t load your classes. Please refresh the page.
      </p>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
        <h3 className="text-lg font-semibold text-slate-900">No classes yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          Add your first class above to start organizing your assessments.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {classes.map((schoolClass) => (
        <ClassRow
          key={schoolClass.id}
          id={schoolClass.id}
          name={schoolClass.name}
          assessmentCount={schoolClass.assessments?.[0]?.count ?? 0}
        />
      ))}
    </ul>
  );
}

function ClassListSkeleton() {
  return (
    <div className="space-y-2" aria-hidden="true">
      <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
      <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}

export default function ClassesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Classes
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Create the classes you teach, then add assessments to them.
        </p>
      </div>

      <section
        aria-labelledby="add-class-heading"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2
          id="add-class-heading"
          className="mb-3 text-base font-semibold text-slate-900"
        >
          Add a class
        </h2>
        <AddClassForm />
      </section>

      <section aria-labelledby="class-list-heading">
        <h2
          id="class-list-heading"
          className="mb-3 text-base font-semibold text-slate-900"
        >
          Your classes
        </h2>
        <Suspense fallback={<ClassListSkeleton />}>
          <ClassList />
        </Suspense>
      </section>
    </div>
  );
}