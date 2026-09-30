import {
  Card,
  CardContent,
} from "@/components/ui/card.tsx";
import PageLayout from "@/components/page-layout.tsx";
import ScheduleReportDrawer from "./_component/schedule-report-drawer.tsx";
import ReportTable from "./_component/report-table.tsx";


export default function Reports() {
 
  return (
    <PageLayout
      title="Report History"
      subtitle="View and manage your financial reports"
      addMarginTop
      rightAction={
        <ScheduleReportDrawer />
      }
    >
        <Card className="border shadow-none">
          <CardContent>
           <ReportTable />
          </CardContent>
        </Card>
    </PageLayout>
  );
}
