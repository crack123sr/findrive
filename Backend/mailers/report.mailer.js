import { formatCurrency } from "../utils/format-currency.js";
import { getReportEmailTemplate } from "./templates/report.template.js";
import { sendEmail } from "./mailer.js";


// ============================================================
// SEND REPORT EMAIL
// ============================================================

export const sendReportEmail = async (params) => {
  const {
    email,
    username,
    report,
    frequency,
  } = params;

  const income =
    Number(report.totalIncome || 0);

  const expenses =
    Number(report.totalExpenses || 0);

  const balance =
    Number(report.availableBalance || 0);

  const savingsRate =
    Number(report.savingsRate || 0);

  const insights =
    Array.isArray(report.insights)
      ? report.insights
      : [];

  // ----------------------------------------------------------
  // HTML email
  // ----------------------------------------------------------

  const html =
    getReportEmailTemplate(
      {
        username,

        ...report,

        totalIncome: income,
        totalExpenses: expenses,
        availableBalance: balance,
        savingsRate,
        insights,
      },

      frequency
    );

  // ----------------------------------------------------------
  // Plain-text email
  // ----------------------------------------------------------

  const insightText =
    insights.length > 0
      ? insights
          .map(
            (insight) =>
              `• ${String(insight)
                .replace(/\$/g, "₹")
                .replace(
                  /\bUSD\b/gi,
                  "INR"
                )
                .replace(
                  /\bdollars?\b/gi,
                  "rupees"
                )}`
          )
          .join("\n")
      : "• No additional insights for this period.";

  const text = `
FinDrive
========================================

Hi ${username || "there"},

Here is your ${frequency.toLowerCase()} financial report for ${report.period}.

FINANCIAL SUMMARY
----------------------------------------

Income:        ${formatCurrency(income)}
Expenses:      ${formatCurrency(expenses)}
Balance:       ${formatCurrency(balance)}
Savings Rate:  ${savingsRate.toFixed(2)}%

KEY INSIGHTS
----------------------------------------

${insightText}

KEEP BUILDING BETTER FINANCIAL HABITS
----------------------------------------

You're doing a great job by keeping track of your finances.

Regularly reviewing your income, expenses, savings, and spending
patterns can help you make better financial decisions.

Open FinDrive to view your complete financial dashboard and
manage your transactions.

Thank you for using FinDrive.

Regards,
FinDrive Team
========================================
`;

  console.log(
    text,
    "text mail"
  );

  // ----------------------------------------------------------
  // Send email
  // ----------------------------------------------------------

  return sendEmail({
    to: email,

    subject:
      `${frequency} Financial Report - ${report.period}`,

    text,

    html,
  });
};