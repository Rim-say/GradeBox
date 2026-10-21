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
];
