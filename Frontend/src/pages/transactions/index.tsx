import {
  Card,
  CardContent,
} from "../../components/ui/card.tsx";
import PageLayout from "../../components/page-layout.tsx";
import AddTransactionDrawer from "../../components/transaction/add-transaction-drawer.tsx";
import TransactionTable from "../../components/transaction/transaction-table/index.tsx";
import ImportTransactionModal from "../../components/transaction/import-transaction-modal/index.tsx";

export default function Transactions() {

  return (
    <PageLayout
      title="All Transactions"
      subtitle="Showing all transactions"
      addMarginTop
      rightAction={
        <div className="flex items-center gap-2">
          <ImportTransactionModal />
          <AddTransactionDrawer />
        </div>
      }
    >
      <Card className="border-0 shadow-none">
        <CardContent className="pt-2">
          <TransactionTable pageSize={20} />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
