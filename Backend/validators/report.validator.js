import { z } from "zod";

export const reportSettingSchema = z.object({
  isEnabled: z.boolean().default(true),
  frequency: z
    .enum(["MINUTELY", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
    .default("MONTHLY"),
});

export const updateReportSettingSchema = reportSettingSchema.partial();
