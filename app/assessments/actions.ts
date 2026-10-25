"use server";

import { revalidatePath } from "next/cache";
import { validateAssessmentForm } from "@/lib/assessment-validation";
import { LIMIT_MESSAGES, getLimitKind } from "@/lib/plan";
import { createClient } from "@/lib/supabase/server";

export type AssessmentFormState = {
  error: string | null;
  message: string | null;
  limitReached?: boolean;
};

export async function createAssessment(
  _prevState: AssessmentFormState,
  formData: FormData,
): Promise<AssessmentFormState> {
  const result = validateAssessmentForm(formData);
  if (!result.ok) {
    return { error: result.error, message: null };
  }
  const values = result.values;

  const supabase = await createClient();

  // user_id fills in automatically; graded_submissions defaults to 0.
  // RLS also checks that the class belongs to you.
  const { error } = await supabase.from("assessments").insert({
    title: values.title,
    class_id: values.classId,
    due_date: values.dueDate,
    promised_return_date: values.promisedReturnDate,
    expected_submissions: values.expectedSubmissions,
    minutes_per_submission: values.minutesPerSubmission,
  });

  if (error) {
    if (getLimitKind(error) === "assessment_limit") {
      return {
        error: LIMIT_MESSAGES.assessment_limit,
        message: null,
        limitReached: true,
      };
    }
    return { error: "Couldn't add the assessment. Please try again.", message: null };
  }

  revalidatePath("/assessments");
  revalidatePath("/");
  return { error: null, message: `Added "${values.title}".` };
}