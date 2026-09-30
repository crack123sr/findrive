import {
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
  subMinutes,
  subHours,
  subDays,
  subWeeks,
} from "date-fns";

import ReportSettingModel from "../../models/report-setting.model.js";
import mongoose from "mongoose";
import { generateReportService } from "../../services/report.service.js";
import ReportModel, {
  ReportStatusEnum,
} from "../../models/report-model.js";
import { calulateNextReportDate } from "../../utils/helper.js";
import { sendReportEmail } from "../../mailers/report.mailer.js";

export const processReportJob = async () => {
  const now = new Date();

  let processedCount = 0;
  let failedCount = 0;

  try {
    // ---------------------------------------------------------
    // DEBUG
    // ---------------------------------------------------------
    console.log("========== REPORT JOB DEBUG ==========");
    console.log("Current time:", now);

    const allSettings = await ReportSettingModel.find({});

    console.log(
      "ALL REPORT SETTINGS:",
      allSettings.map((s) => ({
        id: s._id,
        userId: s.userId,
        isEnabled: s.isEnabled,
        frequency: s.frequency,
        nextReportDate: s.nextReportDate,
        lastSentDate: s.lastSentDate,
      }))
    );

    // ---------------------------------------------------------
    // Find report settings that are due
    // Add 1 second tolerance because of millisecond differences
    // ---------------------------------------------------------
    const reportDueTime = new Date(now.getTime() + 1000);

    const reportSettingCursor = ReportSettingModel.find({
      isEnabled: true,
      nextReportDate: { $lte: reportDueTime },
    })
      .populate("userId")
      .cursor();

    console.log("Running report");

    // ---------------------------------------------------------
    // Process each report setting
    // ---------------------------------------------------------
    for await (const setting of reportSettingCursor) {
      const user = setting.userId;

      if (!user) {
        console.log(
          `User not found for report setting: ${setting._id}`
        );
        continue;
      }

      // -------------------------------------------------------
      // Determine report period
      // -------------------------------------------------------
      let from;
      let to;

      switch (setting.frequency) {
        case "MINUTELY":
          from = subMinutes(now, 1);
          to = now;
          break;

        case "HOURLY":
          from = subHours(now, 1);
          to = now;
          break;

        case "DAILY":
          from = subDays(now, 1);
          to = now;
          break;

        case "WEEKLY":
          from = subWeeks(now, 1);
          to = now;
          break;

        case "MONTHLY":
        default:
          from = startOfMonth(subMonths(now, 1));
          to = endOfMonth(subMonths(now, 1));
          break;
      }

      console.log("========== REPORT DATE DEBUG ==========");
      console.log("User ID:", user._id);
      console.log("Frequency:", setting.frequency);
      console.log("From:", from);
      console.log("To:", to);
      console.log("Next report date:", setting.nextReportDate);

      const session = await mongoose.startSession();

      try {
        // -----------------------------------------------------
        // Generate report
        // -----------------------------------------------------
        const report = await generateReportService(
          user._id,
          from,
          to
        );

        let emailSent = false;

        // -----------------------------------------------------
        // Send email only if there is actual activity
        // -----------------------------------------------------
        if (report) {
          try {
            await sendReportEmail({
              email: user.email,
              username: user.name,

              report: {
                period: report.period,

                totalIncome:
                  report.summary?.income ?? 0,

                totalExpenses:
                  report.summary?.expenses ?? 0,

                availableBalance:
                  report.summary?.balance ?? 0,

                savingsRate:
                  report.summary?.savingsRate ?? 0,

                topSpendingCategories:
                  report.summary?.topCategories ?? [],

                insights:
                  report.insights ?? [],
              },

              frequency: setting.frequency,
            });

            emailSent = true;

            console.log(
              `Report email sent successfully to ${user.email}`
            );
          } catch (error) {
            console.error(
              `Email failed for ${user.email}:`,
              error
            );
          }
        } else {
          console.log(
            `No activity for user ${user._id}. Email will not be sent.`
          );
        }

        // -----------------------------------------------------
        // Calculate next report date
        // IMPORTANT: use NOW, not old lastSentDate
        // -----------------------------------------------------
        const nextReportDate = calulateNextReportDate(
          now,
          setting.frequency || "MONTHLY"
        );

        // -----------------------------------------------------
        // Save report + update report setting
        // -----------------------------------------------------
        await session.withTransaction(
          async () => {
            const bulkReports = [];
            const bulkSettings = [];

            // ===================================================
            // SUCCESS: Report generated AND email sent
            // ===================================================
            if (report && emailSent) {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user._id,
                    sentDate: now,
                    period: report.period,
                    status: ReportStatusEnum.SENT,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: {
                    _id: setting._id,
                  },

                  update: {
                    $set: {
                      lastSentDate: now,
                      nextReportDate,
                      updatedAt: now,
                    },
                  },
                },
              });

              console.log(
                `Report SENT for user ${user._id}`
              );
            }

            // ===================================================
            // FAILED: Report exists but email failed
            // ===================================================
            else if (report && !emailSent) {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user._id,
                    sentDate: now,
                    period: report.period,
                    status: ReportStatusEnum.FAILED,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: {
                    _id: setting._id,
                  },

                  update: {
                    $set: {
                      nextReportDate,
                      updatedAt: now,
                    },
                  },
                },
              });

              console.log(
                `Report generated but email FAILED for user ${user._id}`
              );
            }

            // ===================================================
            // NO ACTIVITY
            // Don't create an email because there is no report
            // ===================================================
            else {
              console.log(
                `NO_ACTIVITY for user ${user._id}`
              );

              bulkSettings.push({
                updateOne: {
                  filter: {
                    _id: setting._id,
                  },

                  update: {
                    $set: {
                      nextReportDate,
                      updatedAt: now,
                    },
                  },
                },
              });
            }

            // -------------------------------------------------
            // Execute DB operations
            // -------------------------------------------------
            if (bulkReports.length > 0) {
              await ReportModel.bulkWrite(
                bulkReports,
                {
                  ordered: false,
                  session,
                }
              );
            }

            if (bulkSettings.length > 0) {
              await ReportSettingModel.bulkWrite(
                bulkSettings,
                {
                  ordered: false,
                  session,
                }
              );
            }
          },
          {
            maxCommitTimeMS: 10000,
          }
        );

        processedCount++;
      } catch (error) {
        console.error(
          `Failed to process report for user ${user._id}:`,
          error
        );

        failedCount++;
      } finally {
        await session.endSession();
      }
    }

    console.log(
      `✅Processed: ${processedCount} report`
    );

    console.log(
      `❌ Failed: ${failedCount} report`
    );

    console.log("Reports completed");

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (error) {
    console.error(
      "Error processing reports:",
      error
    );

    return {
      success: false,
      processedCount,
      failedCount,
      error: error?.message || "Report process failed",
    };
  }
};