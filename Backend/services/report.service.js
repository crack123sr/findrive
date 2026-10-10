import mongoose from "mongoose";
import ReportSettingModel from "../models/report-setting.model.js";
import ReportModel from "../models/report-model.js";
import TransactionModel from "../models/transaction.model.js";
import { NotFoundException } from "../utils/app-error.js";
import { calulateNextReportDate } from "../utils/helper.js";
import {
  convertToDollarUnit,
  formatCurrency,
} from "../utils/format-currency.js";
import { format } from "date-fns";
import { genAI, genAIModel } from "../config/google-ai.config.js";
import { createUserContent } from "@google/genai";
import { reportInsightPrompt } from "../utils/prompt.js";


// ============================================================
// GET ALL REPORTS
// ============================================================

export const getAllReportsService = async (userId, pagination) => {
  const query = { userId };

  const { pageSize, pageNumber } = pagination;

  const skip = (pageNumber - 1) * pageSize;

  const [reports, totalCount] = await Promise.all([
    ReportModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }),

    ReportModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    reports,

    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};


// ============================================================
// UPDATE REPORT SETTINGS
// ============================================================

export const updateReportSettingService = async (
  userId,
  body
) => {
  const { isEnabled, frequency } = body;

  let nextReportDate = null;

  const existingReportSetting =
    await ReportSettingModel.findOne({
      userId,
    });

  if (!existingReportSetting) {
    throw new NotFoundException(
      "Report setting not found"
    );
  }

  const selectedFrequency =
    frequency ||
    existingReportSetting.frequency ||
    "MONTHLY";

  if (isEnabled !== false) {
    const currentNextReportDate =
      existingReportSetting.nextReportDate;

    const now = new Date();

    if (
      !currentNextReportDate ||
      currentNextReportDate <= now
    ) {
      nextReportDate = calulateNextReportDate(
        existingReportSetting.lastSentDate || now,
        selectedFrequency
      );
    } else {
      nextReportDate = currentNextReportDate;
    }
  }

  existingReportSetting.set({
    ...body,
    frequency: selectedFrequency,
    nextReportDate,
  });

  await existingReportSetting.save();

  return existingReportSetting;
};


// ============================================================
// GENERATE REPORT
// ============================================================

export const generateReportService = async (
  userId,
  fromDate,
  toDate
) => {
  console.log(
    "========== REPORT DATE DEBUG =========="
  );

  console.log("User ID:", userId);
  console.log("From:", fromDate);
  console.log("To:", toDate);

  // ----------------------------------------------------------
  // Debug: latest transactions
  // ----------------------------------------------------------

  const testTransactions =
    await TransactionModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ date: -1 })
      .limit(10);

  console.log(
    "Latest transactions:",
    testTransactions.map((tx) => ({
      id: tx._id,
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
      date: tx.date,
      isRecurring: tx.isRecurring,
    }))
  );

  // ----------------------------------------------------------
  // Get transactions for report period
  // ----------------------------------------------------------

  const results = await TransactionModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),

        date: {
          $gte: fromDate,
          $lte: toDate,
        },
      },
    },

    {
      $facet: {
        // ----------------------------------------------------
        // Income / Expense summary
        // ----------------------------------------------------

        summary: [
          {
            $group: {
              _id: null,

              totalIncome: {
                $sum: {
                  $cond: [
                    { $eq: ["$type", "INCOME"] },
                    { $abs: "$amount" },
                    0,
                  ],
                },
              },

              totalExpenses: {
                $sum: {
                  $cond: [
                    { $eq: ["$type", "EXPENSE"] },
                    { $abs: "$amount" },
                    0,
                  ],
                },
              },
            },
          },
        ],

        // ----------------------------------------------------
        // Top expense categories
        // ----------------------------------------------------

        categories: [
          {
            $match: {
              type: "EXPENSE",
            },
          },

          {
            $group: {
              _id: "$category",

              total: {
                $sum: {
                  $abs: "$amount",
                },
              },
            },
          },

          {
            $sort: {
              total: -1,
            },
          },

          {
            $limit: 5,
          },
        ],
      },
    },

    {
      $project: {
        summary: 1,
        categories: 1,
      },
    },
  ]);

  // ----------------------------------------------------------
  // No data
  // ----------------------------------------------------------

  if (!results?.length) {
    return null;
  }

  const summary =
    results[0]?.summary?.[0] || {};

  const totalIncome =
    Number(summary.totalIncome || 0);

  const totalExpenses =
    Number(summary.totalExpenses || 0);

  const categories =
    results[0]?.categories || [];

  // ----------------------------------------------------------
  // No activity
  // ----------------------------------------------------------

  if (
    totalIncome === 0 &&
    totalExpenses === 0
  ) {
    return null;
  }

  console.log(
    results[0],
    "results"
  );

  // ----------------------------------------------------------
  // Category calculations
  // ----------------------------------------------------------

  const byCategory = categories.reduce(
    (acc, { _id, total }) => {
      acc[_id] = {
        amount: convertToDollarUnit(total),

        percentage:
          totalExpenses > 0
            ? Math.round(
                (total / totalExpenses) * 100
              )
            : 0,
      };

      return acc;
    },
    {}
  );

  // ----------------------------------------------------------
  // Balance
  // ----------------------------------------------------------

  const availableBalance =
    totalIncome - totalExpenses;

  // ----------------------------------------------------------
  // Savings rate
  // ----------------------------------------------------------

  const savingsRate =
    calculateSavingRate(
      totalIncome,
      totalExpenses
    );

  // ----------------------------------------------------------
  // Report period
  // ----------------------------------------------------------

  const periodLabel =
    `${format(fromDate, "MMMM d")} - ${format(
      toDate,
      "d, yyyy"
    )}`;

  // ----------------------------------------------------------
  // Generate AI insights
  // ----------------------------------------------------------

  const insights =
    await generateInsightsAI({
      totalIncome,
      totalExpenses,
      availableBalance,
      savingsRate,
      categories: byCategory,
      periodLabel,
    });

  // ----------------------------------------------------------
  // Return report
  // ----------------------------------------------------------

  return {
    period: periodLabel,

    currency: "INR",

    summary: {
      income:
        convertToDollarUnit(totalIncome),

      expenses:
        convertToDollarUnit(totalExpenses),

      balance:
        convertToDollarUnit(
          availableBalance
        ),

      savingsRate:
        Number(
          savingsRate.toFixed(1)
        ),

      topCategories:
        Object.entries(byCategory).map(
          ([name, cat]) => ({
            name,
            amount: cat.amount,
            percent: cat.percentage,
          })
        ),
    },

    insights,
  };
};


// ============================================================
// AI INSIGHTS
// ============================================================

async function generateInsightsAI({
  totalIncome,
  totalExpenses,
  availableBalance,
  savingsRate,
  categories,
  periodLabel,
}) {
  try {
    // --------------------------------------------------------
    // Convert all values to INR-formatted strings BEFORE
    // sending them to Gemini.
    // This prevents the AI from generating "$" values.
    // --------------------------------------------------------

    const incomeFormatted =
      formatCurrency(
        convertToDollarUnit(totalIncome)
      );

    const expensesFormatted =
      formatCurrency(
        convertToDollarUnit(totalExpenses)
      );

    const balanceFormatted =
      formatCurrency(
        convertToDollarUnit(
          availableBalance
        )
      );

    const formattedCategories =
      Object.entries(categories).reduce(
        (acc, [name, category]) => {
          acc[name] = {
            amount: formatCurrency(
              category.amount
            ),

            percentage:
              category.percentage,
          };

          return acc;
        },
        {}
      );

    const prompt =
      reportInsightPrompt({
        totalIncome: incomeFormatted,

        totalExpenses:
          expensesFormatted,

        availableBalance:
          balanceFormatted,

        savingsRate:
          Number(
            savingsRate.toFixed(1)
          ),

        categories:
          formattedCategories,

        periodLabel,
      });

    const result =
      await genAI.models.generateContent({
        model: genAIModel,

        contents: [
          createUserContent([
            prompt,
          ]),
        ],

        config: {
          responseMimeType: "application/json",
        },
      });

    const response =
      result.text;

    const cleanedText =
      response
        ?.replace(
          /```(?:json)?\n?/g,
          ""
        )
        .trim();

    if (!cleanedText) {
      return [];
    }

    const data =
      JSON.parse(cleanedText);

    // --------------------------------------------------------
    // Extra safety:
    // If Gemini still returns $, convert it to ₹.
    // --------------------------------------------------------

    return normalizeInsightCurrency(
      data
    );
  } catch (error) {
    console.error(
      "Error generating AI report insights:",
      error
    );

    return [];
  }
}


// ============================================================
// NORMALIZE AI INSIGHTS
// ============================================================

function normalizeInsightCurrency(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((insight) => {
    if (typeof insight !== "string") {
      return insight;
    }

    return insight
      .replace(/\$/g, "₹")
      .replace(/\bUSD\b/gi, "INR")
      .replace(/\bdollars?\b/gi, "₹");
  });
}


// ============================================================
// SAVINGS RATE
// ============================================================

function calculateSavingRate(
  totalIncome,
  totalExpenses
) {
  if (totalIncome <= 0) {
    return 0;
  }

  const savingRate =
    (
      (totalIncome - totalExpenses) /
      totalIncome
    ) *
    100;

  return parseFloat(
    savingRate.toFixed(2)
  );
}