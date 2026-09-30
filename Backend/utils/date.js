import {
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";

export const getDateRange = (
  preset,
  customFrom,
  customTo
) => {
  if (customFrom && customTo) {
    return {
      from: customFrom,
      to: customTo,
      value: "CUSTOM",
    };
  }

  const now = new Date();
  const today = endOfDay(now);
  const last30Days = {
    from: subDays(today, 29),
    to: today,
    value: "LAST_30_DAYS",
    label: "Last 30 Days",
  };

  const normalizedPreset = String(preset || "LAST_30_DAYS").trim();

  switch (normalizedPreset) {
    case "ALL_TIME":
    case "allTime":
      return {
        from: null,
        to: null,
        value: "ALL_TIME",
        label: "All Time",
      };
    case "LAST_30_DAYS":
    case "30days":
      return last30Days;
    case "LAST_MONTH":
    case "lastMonth":
      return {
        from: startOfMonth(subMonths(now, 1)),
        to: endOfMonth(subMonths(now, 1)),
        value: "LAST_MONTH",
        label: "Last Month",
      };
    case "LAST_3_MONTHS":
    case "last3Months":
      return {
        from: startOfMonth(subMonths(now, 3)),
        to: endOfMonth(subMonths(now, 1)),
        value: "LAST_3_MONTHS",
        label: "Last 3 Months",
      };
    case "LAST_YEAR":
    case "lastYear":
      return {
        from: startOfYear(subYears(now, 1)),
        to: endOfYear(subYears(now, 1)),
        value: "LAST_YEAR",
        label: "Last Year",
      };
    case "THIS_MONTH":
    case "thisMonth":
      return {
        from: startOfMonth(now),
        to: endOfDay(now),
        value: "THIS_MONTH",
        label: "This Month",
      };
    case "THIS_YEAR":
    case "thisYear":
      return {
        from: startOfYear(now),
        to: endOfDay(now),
        value: "THIS_YEAR",
        label: "This Year",
      };
    default:
      return last30Days;
  }
};
