const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Accepts "2026-10-20" but rejects "2026-02-31" or "hello".
function isRealDate(value: string) {
  if (!ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// Returns a whole number, or null if the text isn't one (including empty).
function parseWholeNumber(raw: string) {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) ? value : null;
}

export type AssessmentInput = {
  title: string;
  classId: string;
  dueDate: string;
  promisedReturnDate: string;
  expectedSubmissions: number;
  minutesPerSubmission: number;
};

export type ValidationResult =
  | { ok: true; values: AssessmentInput }
  | { ok: false; error: string };

export function validateAssessmentForm(formData: FormData): ValidationResult {
  const title = String(formData.get("title") ?? "").trim();
  const classId = String(formData.get("class_id") ?? "");
  const dueDate = String(formData.get("due_date") ?? "");
  const promisedReturnDate = String(formData.get("promised_return_date") ?? "");
  const expected = parseWholeNumber(
    String(formData.get("expected_submissions") ?? ""),
  );
  const minutes = parseWholeNumber(
    String(formData.get("minutes_per_submission") ?? ""),
  );

  if (title.length === 0) {
    return { ok: false, error: "Enter a title." };
  }
  if (title.length > 150) {
    return { ok: false, error: "Title must be 150 characters or fewer." };
  }
  if (!classId) {
    return { ok: false, error: "Choose a class." };
  }
  if (!isRealDate(dueDate)) {
    return { ok: false, error: "Enter a valid due date." };
  }
  if (!isRealDate(promisedReturnDate)) {
    return { ok: false, error: "Enter a valid promised return date." };
  }
  // ISO dates (YYYY-MM-DD) sort correctly as plain text.
  if (promisedReturnDate < dueDate) {
    return {
      ok: false,
      error: "The promised return date can't be before the due date.",
    };
  }
  if (expected === null || expected < 0 || expected > 10000) {
    return {
      ok: false,
      error: "Expected submissions must be a whole number from 0 to 10,000.",
    };
  }
  if (minutes === null || minutes < 1 || minutes > 600) {
    return {
      ok: false,
      error: "Minutes per submission must be a whole number from 1 to 600.",
    };
  }

  return {
    ok: true,
    values: {
      title,
      classId,
      dueDate,
      promisedReturnDate,
      expectedSubmissions: expected,
      minutesPerSubmission: minutes,
    },
  };
}