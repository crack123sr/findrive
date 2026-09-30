export function calulateNextReportDate(
  lastSentDate,
  frequency = "MONTHLY"
) {
  const baseDate = lastSentDate
    ? new Date(lastSentDate)
    : new Date();

  const nextDate = new Date(baseDate);

  switch (frequency) {
    case "MINUTELY":
      nextDate.setMinutes(nextDate.getMinutes() + 1);
      break;

    case "HOURLY":
      nextDate.setHours(nextDate.getHours() + 1);
      break;

    case "DAILY":
      nextDate.setDate(nextDate.getDate() + 1);
      break;

    case "WEEKLY":
      nextDate.setDate(nextDate.getDate() + 7);
      break;

    case "MONTHLY":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;

    case "YEARLY":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;

    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }

  return nextDate;
}


export function calculateNextOccurrence(
  date,
  recurringInterval
) {
  const baseDate = date ? new Date(date) : new Date();

  const nextDate = new Date(baseDate);

  switch (recurringInterval) {
    case "MINUTELY":
      nextDate.setMinutes(nextDate.getMinutes() + 1);
      break;

    case "HOURLY":
      nextDate.setHours(nextDate.getHours() + 1);
      break;

    case "DAILY":
      nextDate.setDate(nextDate.getDate() + 1);
      break;

    case "WEEKLY":
      nextDate.setDate(nextDate.getDate() + 7);
      break;

    case "MONTHLY":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;

    case "QUARTERLY":
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;

    case "YEARLY":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;

    default:
      return nextDate;
  }

  return nextDate;
}


export function capitalizeFirstLetter(string) {
  if (!string) return "";

  return (
    string.charAt(0).toUpperCase() +
    string.slice(1).toLowerCase()
  );
}