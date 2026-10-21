export type DueStatus = "overdue" | "due-soon" | "upcoming";

export type Assessment = {
  id: string;
  title: string;
  className: string;
  promisedReturnDate: string;
  expectedSubmissions: number;
  gradedSubmissions: number;
  minutesPerSubmission: number;
};
