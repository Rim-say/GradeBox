import type { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export type Plan = "free" | "pro";

// These must match the limits inside the database triggers
// (enforce_class_limit and enforce_assessment_limit). The database
// enforces them; these numbers are only used for messages and display.
export const FREE_LIMITS = {
  classes: 2,
  activeAssessments: 5,
} as const;

// Returns the user's plan. If the lookup fails or no profile row exists,
// it returns "free", which is the safe direction to fail in.
export async function getPlan(
  supabase: ServerClient,
  userId: string,
): Promise<Plan> {
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.plan === "pro" ? "pro" : "free";
}

export type LimitKind = "class_limit" | "assessment_limit";

// Works out whether a database error was a free-plan limit refusal.
// The triggers attach a hint to the error; the message text is a fallback.
export function getLimitKind(
  error: { message?: string; hint?: string | null } | null | undefined,
): LimitKind | null {
  if (!error) return null;

  if (error.hint === "class_limit" || error.hint === "assessment_limit") {
    return error.hint;
  }

  const message = error.message ?? "";
  if (message.includes("Free plan limit reached")) {
    return message.includes("classes") ? "class_limit" : "assessment_limit";
  }

  return null;
}

export const LIMIT_MESSAGES = {
  class_limit: `You've reached the free plan limit of ${FREE_LIMITS.classes} classes. Upgrade to Pro to add more.`,
  assessment_limit: `You've reached the free plan limit of ${FREE_LIMITS.activeAssessments} active assessments. Finish one, or upgrade to Pro to add more.`,
  assessment_reopen: `This change would make a finished assessment active again, which goes over the free limit of ${FREE_LIMITS.activeAssessments} active assessments. Finish another one first, or upgrade to Pro.`,
} as const;