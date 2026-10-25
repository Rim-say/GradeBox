import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function WelcomeHeading() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <p className="text-base font-semibold text-slate-900">Welcome back</p>
      <p className="hidden truncate text-sm text-slate-500 sm:block">
        {user?.email ?? "Here is your grading workload."}
      </p>
    </>
  );
}