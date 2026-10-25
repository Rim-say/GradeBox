import type { Assessment } from "./types";
import { remainingMinutes, remainingSubmissions } from "./grading";

export const FORECAST_DAYS = 7;

export type ForecastItem = {
  id: string;
  title: string;
  className: string;
  promisedReturnDate: string;
  remainingSubmissions: number;
  remainingMinutes: number;
};

export type ForecastDay = {
  date: string;
  minutes: number;
  items: ForecastItem[];
};

export type WeeklyForecast = {
  today: string;
  windowEnd: string;
  overdueMinutes: number;
  overdueItems: ForecastItem[];
  days: ForecastDay[];
  weekMinutes: number;
  laterMinutes: number;
  laterCount: number;
  topContributors: ForecastItem[];
};

// Adds days to a YYYY-MM-DD date using UTC, so time zones can't shift it.
export function addDays(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

export function formatDayLabel(isoDate: string, today: string) {
  if (isoDate === today) return "Today";
  if (isoDate === addDays(today, 1)) return "Tomorrow";
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function totalMinutes(items: ForecastItem[]) {
  return items.reduce((sum, item) => sum + item.remainingMinutes, 0);
}

export function buildWeeklyForecast(
  assessments: Assessment[],
  today: string,
): WeeklyForecast {
  const windowEnd = addDays(today, FORECAST_DAYS - 1);

  // Only unfinished work counts: completed and zero-expected assessments
  // have nothing remaining, so they drop out here.
  const items: ForecastItem[] = assessments
    .filter((assessment) => remainingSubmissions(assessment) > 0)
    .map((assessment) => ({
      id: assessment.id,
      title: assessment.title,
      className: assessment.className,
      promisedReturnDate: assessment.promisedReturnDate,
      remainingSubmissions: remainingSubmissions(assessment),
      remainingMinutes: remainingMinutes(assessment),
    }));

  // ISO dates (YYYY-MM-DD) compare correctly as plain text.
  const overdueItems = items
    .filter((item) => item.promisedReturnDate < today)
    .sort(
      (a, b) =>
        a.promisedReturnDate.localeCompare(b.promisedReturnDate) ||
        b.remainingMinutes - a.remainingMinutes,
    );

  const days: ForecastDay[] = Array.from({ length: FORECAST_DAYS }, (_, offset) => {
    const date = addDays(today, offset);
    const dayItems = items
      .filter((item) => item.promisedReturnDate === date)
      .sort((a, b) => b.remainingMinutes - a.remainingMinutes);
    return { date, items: dayItems, minutes: totalMinutes(dayItems) };
  });

  const laterItems = items.filter((item) => item.promisedReturnDate > windowEnd);

  const overdueMinutes = totalMinutes(overdueItems);
  const daysMinutes = days.reduce((sum, day) => sum + day.minutes, 0);

  const topContributors = [...overdueItems, ...days.flatMap((day) => day.items)]
    .sort((a, b) => b.remainingMinutes - a.remainingMinutes)
    .slice(0, 3);

  return {
    today,
    windowEnd,
    overdueMinutes,
    overdueItems,
    days,
    weekMinutes: overdueMinutes + daysMinutes,
    laterMinutes: totalMinutes(laterItems),
    laterCount: laterItems.length,
    topContributors,
  };
}