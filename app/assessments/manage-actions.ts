"use server";

import { revalidatePath } from "next/cache";
import { validateAssessmentForm } from "@/lib/assessment-validation";
import { LIMIT_MESSAGES, getLimitKind } from "@/lib/plan";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentFormState } from "./actions";

export async function updateAssessment(
  _prevState: AssessmentFormState,
  formData: FormData,
): Promise<AssessmentFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Something went wrong. Please refresh the page.", message: null };
  }

  const result = validateAssessmentForm(formData);
  if (!result.ok) {
    return { error: result.error, message: null };
  }
  const values = result.values;

  const supabase = await createClient();

  // graded_submissions is deliberately NOT in this update, so existing
  // progress is always preserved. RLS only lets you edit your own rows,
  // and only point them at your own classes.
  const { data, error } = await supabase
    .from("assessments")
    .update({
      title: values.title,
      class_id: values.classId,
      due_date: values.dueDate,
      promised_return_date: values.promisedReturnDate,
      expected_submissions: values.expectedSubmissions,
      minutes_per_submission: values.minutesPerSubmission,
    })
    .eq("id", id)
    .select("id");

  if (error) {
    if (getLimitKind(error) === "assessment_limit") {
      return {
        error: LIMIT_MESSAGES.assessment_reopen,
        message: null,
        limitReached: true,
      };
    }
    return { error: "Couldn't save your changes. Please try again.", message: null };
  }
  if (!data || data.length === 0) {
    return { error: "Couldn't save your changes. Please try again.", message: null };
  }

  revalidatePath("/assessments");
  revalidatePath("/");
  return { error: null, message: "Saved." };
}

export async function updateGradedCount(
  id: string,
  graded: number,
): Promise<AssessmentFormState> {
  if (!id) {
    return { error: "Something went wrong. Please refresh the page.", message: null };
  }
  if (!Number.isInteger(graded) || graded < 0 || graded > 10000) {
    return {
      error: "Graded submissions must be a whole number from 0 to 10,000.",
      message: null,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assessments")
    .update({ graded_submissions: graded })
    .eq("id", id)
    .select("id");

  if (error) {
    if (getLimitKind(error) === "assessment_limit") {
      return {
        error: LIMIT_MESSAGES.assessment_reopen,
        message: null,
        limitReached: true,
      };
    }
    return { error: "Couldn't save your progress. Please try again.", message: null };
  }
  if (!data || data.length === 0) {
    return { error: "Couldn't save your progress. Please try again.", message: null };
  }

  revalidatePath("/assessments");
  revalidatePath("/");
  return { error: null, message: "Saved." };
}

export async function deleteAssessment(id: string): Promise<AssessmentFormState> {
  if (!id) {
    return { error: "Something went wrong. Please refresh the page.", message: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assessments")
    .delete()
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { error: "Couldn't delete the assessment. Please try again.", message: null };
  }

  revalidatePath("/assessments");
  revalidatePath("/");
  return { error: null, message: "Deleted." };
}