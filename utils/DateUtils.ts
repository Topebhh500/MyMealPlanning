/**
 * Format a date object to a standard string format YYYY-MM-DD
 */
export const getFormattedDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Generate an array of date strings for a specified number of days starting from startDate
 */
export const generateDateRange = (
  startDate: Date,
  numberOfDays: number
): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < numberOfDays; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    dates.push(getFormattedDate(currentDate));
  }

  return dates;
};

/**
 * Check if a date is today
 */
export const isToday = (date: string): boolean => {
  const today = getFormattedDate(new Date());
  return date === today;
};

/**
 * Format a date string (YYYY-MM-DD) to a human-readable format
 */
export const formatReadableDate = (
  dateString: string,
  includeWeekday: boolean = true
): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  if (includeWeekday) {
    options.weekday = "long";
  }

  return date.toLocaleDateString(undefined, options);
};
