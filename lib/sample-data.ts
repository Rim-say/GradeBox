import type { Assessment } from "./types";

export const teacherName = "Reem";

// Used to label overdue / due soon / upcoming in the sample dashboard.
export const sampleToday = "2026-10-20";

export const sampleAssessments: Assessment[] = [
  {
    id: "1",
    title: "Essay: The Industrial Revolution",
    className: "History 10A",
    promisedReturnDate: "2026-10-18",
    expectedSubmissions: 28,
    gradedSubmissions: 12,
    minutesPerSubmission: 8,
  },
  {
    id: "2",
    title: "Lab report: Photosynthesis",
    className: "Biology 11B",
    promisedReturnDate: "2026-10-21",
    expectedSubmissions: 24,
    gradedSubmissions: 18,
    minutesPerSubmission: 6,
  },
  {
    id: "3",
    title: "Quiz: Quadratic equations",
    className: "Algebra 9C",
    promisedReturnDate: "2026-10-22",
    expectedSubmissions: 30,
    gradedSubmissions: 20,
    minutesPerSubmission: 3,
  },
  {
    id: "4",
    title: "Project: Community podcast",
    className: "English 12",
    promisedReturnDate: "2026-10-27",
    expectedSubmissions: 22,
    gradedSubmissions: 5,
    minutesPerSubmission: 12,
  },
  {
    id: "5",
    title: "Short answers: Civil rights",
    className: "History 10A",
    promisedReturnDate: "2026-11-03",
    expectedSubmissions: 26,
    gradedSubmissions: 0,
    minutesPerSubmission: 5,
  },
  // --- Edge cases ---
  {
    // 1 left: must show 98%, never a rounded-up 100%.
    id: "6",
    title: "Quiz: Cell structure",
    className: "Biology 11B",
    promisedReturnDate: "2026-10-23",
    expectedSubmissions: 50,
    gradedSubmissions: 49,
    minutesPerSubmission: 4,
  },
  {
    // Complete, return date already passed: must NOT appear as overdue.
    id: "7",
    title: "Homework: Fractions",
    className: "Algebra 9C",
    promisedReturnDate: "2026-10-15",
    expectedSubmissions: 20,
    gradedSubmissions: 20,
    minutesPerSubmission: 5,
  },
  {
    // Graded more than expected: remaining is 0, not negative.
    id: "8",
    title: "Reading response: Chapter 4",
    className: "English 12",
    promisedReturnDate: "2026-10-24",
    expectedSubmissions: 10,
    gradedSubmissions: 12,
    minutesPerSubmission: 6,
  },
  {
    // Nothing expected yet: no divide-by-zero, no work counted.
    id: "9",
    title: "Presentation: Ecosystems",
    className: "Biology 11B",
    promisedReturnDate: "2026-11-10",
    expectedSubmissions: 0,
    gradedSubmissions: 0,
    minutesPerSubmission: 10,
  },
];
