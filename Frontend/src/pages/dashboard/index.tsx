import DashboardDataChart from "./dashboard-data-chart.tsx";
import DashboardSummary from "./dashboard-summary.tsx";
import PageLayout from "@/components/page-layout.tsx";
//import ExpenseBreakDown from "./expense-breakdown";
import ExpensePieChart from "./expense-pie-chart.tsx";
import DashboardRecentTransactions from "./dashboard-recent-transactions.tsx";
import { useState } from "react";
import { DateRangeType } from "@/components/date-range-select/index.tsx";

const Dashboard = () => {
  const [dateRange, _setDateRange] = useState<DateRangeType>(null);

  return (
    <div className="w-full flex flex-col">
      {/* Dashboard Summary Overview */}
      <PageLayout
        className="space-y-6"
        renderPageHeader={
          <DashboardSummary
            dateRange={dateRange}
            setDateRange={_setDateRange}
          />
        }
      >
        {/* Dashboard Main Section */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-4">
            <DashboardDataChart dateRange={dateRange} />
          </div>
          <div className="lg:col-span-2">
            <ExpensePieChart dateRange={dateRange} />
          </div>
        </div>
        {/* Dashboard Recent Transactions */}
        <div className="w-full mt-0">
          <DashboardRecentTransactions />
        </div>
      </PageLayout>
    </div>
  );
};

export default Dashboard;
