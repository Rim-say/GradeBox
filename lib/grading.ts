import type { Assessment, DueStatus } from "./types";

const DUE_SOON_DAYS = 3;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const STATUS_PRIORITY: Record<DueStatus, number> = {
  overdue: 0,
  "due-soon": 1,
  upcoming: 2,
};

function parseIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return { year, month, day };
}

function utcDayNumber(isoDate: string) {
  const { year, month, day } = parseIsoDate(isoDate);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

// Turns anything weird (NaN, negative, decimals) into a safe whole number >= 0.
function safeCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function remainingSubmissions(assessment: Assessment) {
  return Math.max(
    0,
    safeCount(assessment.expectedSubmissions) -
      safeCount(assessment.gradedSubmissions),
  );
}

export function remainingMinutes(assessment: Assessment) {
  return (
    remainingSubmissions(assessment) * safeCount(assessment.minutesPerSubmission)
  );
}

export function progressPercent(assessment: Assessment) {
  const expected = safeCount(assessment.expectedSubmissions);
  const graded = safeCount(assessment.gradedSubmissions);

  if (expected === 0) {
    return 0;
  }

  // floor, not round: 249/250 must show 99%, never a misleading 100%.
  return Math.min(100, Math.floor((graded / expected) * 100));
}

// Complete = something was expected and every expected submission is graded.
export function isComplete(assessment: Assessment) {
  const expected = safeCount(assessment.expectedSubmissions);
  return expected > 0 && safeCount(assessment.gradedSubmissions) >= expected;
}

// True when graded > expected, so the UI can flag it instead of hiding it.
export function hasCountMismatch(assessment: Assessment) {
  return (
    safeCount(assessment.gradedSubmissions) >
    safeCount(assessment.expectedSubmissions)
  );
}

export function getDueStatus(promisedReturnDate: string, today: string): DueStatus {
  const diffDays = Math.round(
    utcDayNumber(promisedReturnDate) - utcDayNumber(today),
  );

  if (diffDays < 0) {
    return "overdue";
  }

  if (diffDays <= DUE_SOON_DAYS) {
    return "due-soon";
  }

  return "upcoming";
}

export function prioritizeAssessments(
  assessments: Assessment[],
  today: string,
) {
  return assessments
    .filter((assessment) => remainingSubmissions(assessment) > 0)
    .slice()
    .sort((a, b) => {
      const statusDiff =
        STATUS_PRIORITY[getDueStatus(a.promisedReturnDate, today)] -
        STATUS_PRIORITY[getDueStatus(b.promisedReturnDate, today)];

      if (statusDiff !== 0) {
        return statusDiff;
      }

      const dateDiff =
        utcDayNumber(a.promisedReturnDate) - utcDayNumber(b.promisedReturnDate);

      if (dateDiff !== 0) {
        return dateDiff;
      }

      // Same status and same date: more remaining minutes goes first.
      return remainingMinutes(b) - remainingMinutes(a);
    });
}

export function summarizeAssessments(assessments: Assessment[]) {
  const activeAssessments = assessments.filter(
    (assessment) => remainingSubmissions(assessment) > 0,
  );

  const remaining = activeAssessments.reduce(
    (total, assessment) => total + remainingSubmissions(assessment),
    0,
  );

  const estimatedMinutes = activeAssessments.reduce(
    (total, assessment) => total + remainingMinutes(assessment),
    0,
  );

  return {
    activeAssessments: activeAssessments.length,
    remainingSubmissions: remaining,
    estimatedMinutes,
  };
}

export function formatMinutes(totalMinutes: number) {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatPromisedDate(isoDate: string) {
  const { year, month, day } = parseIsoDate(isoDate);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function dueStatusLabel(status: DueStatus) {
  if (status === "overdue") {
    return "Overdue";
  }

  if (status === "due-soon") {
    return "Due soon";
  }

  return "Upcoming";
}