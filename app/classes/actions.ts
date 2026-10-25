"use server";

import { revalidatePath } from "next/cache";
import { LIMIT_MESSAGES, getLimitKind } from "@/lib/plan";
import { createClient } from "@/lib/supabase/server";

export type ClassFormState = {
  error: string | null;
  message: string | null;
  limitReached?: boolean;
};

function validateName(rawName: string): string | null {
  const name = rawName.trim();
  if (name.length === 0) return "Enter a class name.";
  if (name.length > 100) return "Class name must be 100 characters or fewer.";
  return null;
}

export async function createClass(
  _prevState: ClassFormState,
  formData: FormData,
): Promise<ClassFormState> {
  const name = String(formData.get("name") ?? "").trim();

  const problem = validateName(name);
  if (problem) {
    return { error: problem, message: null };
  }

  const supabase = await createClient();

  // user_id fills in automatically from the logged-in user (see the table).
  const { error } = await supabase.from("classes").insert({ name });

  if (error) {
    if (getLimitKind(error) === "class_limit") {
      return {
        error: LIMIT_MESSAGES.class_limit,
        message: null,
        limitReached: true,
      };
    }
    return { error: "Couldn't add the class. Please try again.", message: null };
  }

  revalidatePath("/classes");
  return { error: null, message: `Added "${name}".` };
}

export async function renameClass(formData: FormData): Promise<ClassFormState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  const problem = validateName(name);
  if (problem) {
    return { error: problem, message: null };
  }

  const supabase = await createClient();

  // .select() returns the changed rows, so we can tell if nothing matched.
  // RLS only lets you change your own classes.
  const { data, error } = await supabase
    .from("classes")
    .update({ name })
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { error: "Couldn't rename the class. Please try again.", message: null };
  }

  revalidatePath("/classes");
  return { error: null, message: "Renamed." };
}

export async function deleteClass(id: string): Promise<ClassFormState> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .delete()
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { error: "Couldn't delete the class. Please try again.", message: null };
  }

  revalidatePath("/classes");
  return { error: null, message: "Deleted." };
}