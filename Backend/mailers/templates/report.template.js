import { formatCurrency } from "../../utils/format-currency.js";

export const getReportEmailTemplate = (
  {
    username,
    period,
    totalIncome,
    totalExpenses,
    availableBalance,
    savingsRate,
    topSpendingCategories = [],
    insights = [],
  },
  frequency = "MONTHLY"
) => {
  // ----------------------------------------------------------
  // Normalize values
  // ----------------------------------------------------------

  const income = Number(totalIncome || 0);
  const expenses = Number(totalExpenses || 0);
  const balance = Number(availableBalance || 0);
  const savings = Number(savingsRate || 0);

  const categories = Array.isArray(topSpendingCategories)
    ? topSpendingCategories
    : [];

  const insightList = Array.isArray(insights)
    ? insights
    : [];

  // ----------------------------------------------------------
  // Format frequency for display
  // ----------------------------------------------------------

  const displayFrequency =
    frequency.charAt(0).toUpperCase() +
    frequency.slice(1).toLowerCase();

  // ----------------------------------------------------------
  // Top spending categories
  // ----------------------------------------------------------

  let categoriesHTML = "";

  if (categories.length > 0) {
    categoriesHTML = categories
      .map((category) => {
        const name = category?.name || "Other";
        const amount = Number(category?.amount || 0);
        const percentage = Number(category?.percent || 0);

        return `
          <tr>
            <td style="
              padding: 12px 8px;
              border-bottom: 1px solid #333;
              color: #e5e7eb;
              font-size: 15px;
            ">
              ${escapeHtml(name)}
            </td>

            <td style="
              padding: 12px 8px;
              border-bottom: 1px solid #333;
              color: #ffffff;
              font-size: 15px;
              text-align: right;
              font-weight: 600;
            ">
              ${formatCurrency(amount)}
            </td>

            <td style="
              padding: 12px 8px;
              border-bottom: 1px solid #333;
              color: #9ca3af;
              font-size: 14px;
              text-align: right;
            ">
              ${percentage}%
            </td>
          </tr>
        `;
      })
      .join("");
  } else {
    categoriesHTML = `
      <tr>
        <td colspan="3" style="
          padding: 18px 8px;
          color: #9ca3af;
          text-align: center;
          font-size: 14px;
        ">
          No expenses were recorded during this period.
        </td>
      </tr>
    `;
  }

  // ----------------------------------------------------------
  // Insights
  // ----------------------------------------------------------

  let insightsHTML = "";

  if (insightList.length > 0) {
    insightsHTML = insightList
      .map((insight) => {
        const text = String(insight)
          .replace(/\$/g, "₹")
          .replace(/\bUSD\b/gi, "INR")
          .replace(/\bdollars?\b/gi, "rupees");

        return `
          <li style="
            margin-bottom: 12px;
            color: #d1d5db;
            font-size: 15px;
            line-height: 1.6;
          ">
            ${escapeHtml(text)}
          </li>
        `;
      })
      .join("");
  } else {
    insightsHTML = `
      <li style="
        color: #9ca3af;
        font-size: 14px;
        line-height: 1.6;
      ">
        No additional insights were generated for this period.
      </li>
    `;
  }

  // ----------------------------------------------------------
  // Savings message
  // ----------------------------------------------------------

  let savingsMessage = "";

  if (savings >= 50) {
    savingsMessage = `
      Excellent work! You're saving more than half of your
      income during this period. Keep maintaining this habit.
    `;
  } else if (savings > 0) {
    savingsMessage = `
      You're saving a portion of your income. Keep tracking
      your expenses and look for opportunities to increase
      your savings.
    `;
  } else if (savings === 0) {
    savingsMessage = `
      Your income and expenses were equal during this period.
      Consider reviewing your spending to create more room
      for savings.
    `;
  } else {
    savingsMessage = `
      Your expenses exceeded your income during this period.
      Review your spending categories to identify areas where
      you can reduce expenses.
    `;
  }

  // ----------------------------------------------------------
  // HTML EMAIL
  // ----------------------------------------------------------

  return `
<!DOCTYPE html>

<html lang="en">

<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${displayFrequency} Financial Report</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #111111;
  font-family: Arial, Helvetica, sans-serif;
  color: #ffffff;
">

  <div style="
    width: 100%;
    background-color: #111111;
    padding: 30px 0;
  ">

    <div style="
      max-width: 600px;
      margin: 0 auto;
      background-color: #181818;
      border-radius: 12px;
      overflow: hidden;
    ">

      <!-- ================================================== -->
      <!-- HEADER -->
      <!-- ================================================== -->

      <div style="
        background-color: #00c878;
        padding: 28px 20px;
        text-align: center;
      ">

        <h1 style="
          margin: 0;
          color: #ffffff;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 28px;
          font-weight: 600;
        ">
          ${displayFrequency} Report
        </h1>

      </div>


      <!-- ================================================== -->
      <!-- CONTENT -->
      <!-- ================================================== -->

      <div style="
        padding: 35px 40px;
      ">

        <!-- Greeting -->

        <p style="
          margin: 0 0 20px 0;
          color: #ffffff;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 17px;
        ">
          Hi ${escapeHtml(username || "there")},
        </p>


        <p style="
          margin: 0 0 30px 0;
          color: #d1d5db;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 16px;
          line-height: 1.6;
        ">
          Here's your financial summary for
          <strong style="color: #ffffff;">
            ${escapeHtml(period)}
          </strong>.
        </p>


        <!-- ================================================== -->
        <!-- FINANCIAL SUMMARY -->
        <!-- ================================================== -->

        <div style="
          margin-bottom: 35px;
        ">

          <!-- Income -->

          <div style="
            display: flex;
            justify-content: space-between;
            padding: 14px 0;
            border-bottom: 1px solid #333333;
          ">

            <span style="
              color: #d1d5db;
              font-size: 15px;
            ">
              Total Income
            </span>

            <strong style="
              color: #ffffff;
              font-size: 16px;
            ">
              ${formatCurrency(income)}
            </strong>

          </div>


          <!-- Expenses -->

          <div style="
            display: flex;
            justify-content: space-between;
            padding: 14px 0;
            border-bottom: 1px solid #333333;
          ">

            <span style="
              color: #d1d5db;
              font-size: 15px;
            ">
              Total Expenses
            </span>

            <strong style="
              color: #ffffff;
              font-size: 16px;
            ">
              ${formatCurrency(expenses)}
            </strong>

          </div>


          <!-- Balance -->

          <div style="
            display: flex;
            justify-content: space-between;
            padding: 14px 0;
            border-bottom: 1px solid #333333;
          ">

            <span style="
              color: #d1d5db;
              font-size: 15px;
            ">
              Available Balance
            </span>

            <strong style="
              color: #00c878;
              font-size: 16px;
            ">
              ${formatCurrency(balance)}
            </strong>

          </div>


          <!-- Savings -->

          <div style="
            display: flex;
            justify-content: space-between;
            padding: 14px 0;
            border-bottom: 1px solid #333333;
          ">

            <span style="
              color: #d1d5db;
              font-size: 15px;
            ">
              Savings Rate
            </span>

            <strong style="
              color: #ffffff;
              font-size: 16px;
            ">
              ${savings.toFixed(2)}%
            </strong>

          </div>

        </div>


        <!-- ================================================== -->
        <!-- TOP SPENDING CATEGORIES -->
        <!-- ================================================== -->

        <div style="
          margin-top: 35px;
          margin-bottom: 35px;
        ">

          <h2 style="
            margin: 0 0 15px 0;
            padding-bottom: 12px;
            border-bottom: 1px solid #333333;
            color: #ffffff;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 19px;
            font-weight: 500;
          ">
            Top Spending Categories
          </h2>


          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              border-collapse: collapse;
              margin-top: 10px;
            "
          >

            <thead>

              <tr>

                <th style="
                  padding: 10px 8px;
                  color: #9ca3af;
                  font-size: 12px;
                  text-align: left;
                  font-weight: normal;
                ">
                  CATEGORY
                </th>

                <th style="
                  padding: 10px 8px;
                  color: #9ca3af;
                  font-size: 12px;
                  text-align: right;
                  font-weight: normal;
                ">
                  AMOUNT
                </th>

                <th style="
                  padding: 10px 8px;
                  color: #9ca3af;
                  font-size: 12px;
                  text-align: right;
                  font-weight: normal;
                ">
                  SHARE
                </th>

              </tr>

            </thead>

            <tbody>
              ${categoriesHTML}
            </tbody>

          </table>

        </div>


        <!-- ================================================== -->
        <!-- INSIGHTS -->
        <!-- ================================================== -->

        <div style="
          margin-top: 35px;
          margin-bottom: 35px;
        ">

          <h2 style="
            margin: 0 0 18px 0;
            padding-bottom: 12px;
            border-bottom: 1px solid #333333;
            color: #ffffff;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 19px;
            font-weight: 500;
          ">
            Insights
          </h2>


          <ul style="
            margin: 0;
            padding-left: 20px;
          ">
            ${insightsHTML}
          </ul>

        </div>


        <!-- ================================================== -->
        <!-- SAVINGS MESSAGE -->
        <!-- ================================================== -->

        <div style="
          background-color: #202020;
          border-left: 3px solid #00c878;
          padding: 18px 20px;
          margin-top: 30px;
          margin-bottom: 30px;
        ">

          <p style="
            margin: 0;
            color: #d1d5db;
            font-size: 14px;
            line-height: 1.7;
          ">
            ${savingsMessage}
          </p>

        </div>


        <!-- ================================================== -->
        <!-- EXTRA MESSAGE -->
        <!-- ================================================== -->

        <div style="
          margin-top: 30px;
          padding-top: 25px;
          border-top: 1px solid #333333;
        ">

          <p style="
            margin: 0 0 12px 0;
            color: #ffffff;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 16px;
          ">
            Keep building better financial habits.
          </p>

          <p style="
            margin: 0;
            color: #9ca3af;
            font-size: 14px;
            line-height: 1.7;
          ">
            Regularly reviewing your income, expenses, savings,
            and spending patterns can help you make better
            financial decisions.
          </p>

        </div>


        <!-- ================================================== -->
        <!-- FOOTER -->
        <!-- ================================================== -->

        <div style="
          margin-top: 35px;
          padding-top: 20px;
          border-top: 1px solid #333333;
          text-align: center;
        ">

          <p style="
            margin: 0 0 8px 0;
            color: #00c878;
            font-size: 14px;
            font-weight: bold;
          ">
            FinDrive
          </p>

          <p style="
            margin: 0;
            color: #777777;
            font-size: 12px;
            line-height: 1.5;
          ">
            Your personal financial management assistant.
          </p>

        </div>

      </div>

    </div>

  </div>

</body>

</html>
  `;
};


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}