"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PlanState = {
  error: string | null;
  message: string | null;
};

// DEMO ONLY: no payment happens. A real payment provider's webhook
// would set the plan instead of this self-service function.
export async function setDemoPlan(plan: "free" | "pro"): Promise<PlanState> {
  // Server actions can be called with any input, so check it here too.
  if (plan !== "free" && plan !== "pro") {
    return { error: "Invalid plan.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("demo_set_plan", { new_plan: plan });

  if (error) {
    return { error: "Couldn't change your plan. Please try again.", message: null };
  }

  // Plan affects several pages, so refresh them all.
  revalidatePath("/", "layout");

  return {
    error: null,
    message:
      plan === "pro"
        ? "Demo Pro plan activated."
        : "Switched back to the Free plan.",
  };
}