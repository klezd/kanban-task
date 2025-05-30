import {
  differenceInCalendarDays,
  format,
  // isToday,
  // isPast,
  addDays,
} from "date-fns";

export function formatDeadlineDisplay(deadlineTimestamp) {
  if (!deadlineTimestamp || !deadlineTimestamp.toDate) {
    return "No Deadline";
  }

  const deadlineDate = deadlineTimestamp.toDate();
  const today = new Date();

  // Normalize both dates to the start of their day for accurate calendar day comparison
  const normalizedToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const normalizedDeadlineDate = new Date(
    deadlineDate.getFullYear(),
    deadlineDate.getMonth(),
    deadlineDate.getDate()
  );

  const diffDays = differenceInCalendarDays(
    normalizedDeadlineDate,
    normalizedToday
  );

  if (diffDays < 0) {
    // Deadline is in the past
    const pastDays = Math.abs(diffDays);
    return `Overdue by ${pastDays} day${pastDays > 1 ? "s" : ""}`;
  }
  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Tomorrow";
  }
  if (diffDays > 1 && diffDays <= 7) {
    return `In ${diffDays} days`;
  }

  // Default to standard date format if > 7 days away or for other cases
  return format(deadlineDate, "MMM d, yyyy"); // e.g., "May 31, 2025"
}

export function isDeadlineUrgent(deadlineTimestamp, urgencyThresholdDays = 3) {
  if (!deadlineTimestamp || !deadlineTimestamp.toDate) {
    return false; // No deadline, so not urgent by this logic
  }
  const deadlineDate = deadlineTimestamp.toDate();
  const today = new Date();
  const normalizedToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const normalizedDeadlineDate = new Date(
    deadlineDate.getFullYear(),
    deadlineDate.getMonth(),
    deadlineDate.getDate()
  );

  // Calculate the date that is 'urgencyThresholdDays' from today
  const thresholdDate = addDays(normalizedToday, urgencyThresholdDays);

  // Urgent if deadline is today or in the future, but within or at the threshold
  return (
    normalizedDeadlineDate >= normalizedToday &&
    normalizedDeadlineDate < thresholdDate
  );
}
