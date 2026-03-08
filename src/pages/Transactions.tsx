import { store } from "@/lib/store";
import MobileLayout from "@/components/MobileLayout";
import { ArrowDownLeft, ArrowUpRight, PiggyBank, CreditCard } from "lucide-react";

const typeIcons = {
  income: ArrowDownLeft,
  savings: PiggyBank,
  loan: CreditCard,
  transfer: ArrowUpRight,
};

const typeColors = {
  income: "bg-success/10 text-success",
  savings: "bg-primary/10 text-primary",
  loan: "bg-warning/10 text-warning",
  transfer: "bg-muted text-muted-foreground",
};

export default function Transactions() {
  const transactions = store.getTransactions();

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-4">Transactions</h1>

        <div className="space-y-2">
          {transactions.map((txn) => {
            const Icon = typeIcons[txn.type];
            return (
              <div key={txn.id} className="flex items-center gap-3 bg-card rounded-xl p-3.5 shadow-card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[txn.type]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(txn.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}{txn.type}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${txn.type === "income" ? "text-success" : "text-foreground"}`}>
                  {txn.type === "income" ? "+" : "-"}₹{txn.amount.toLocaleString("en-IN")}
                </p>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <p className="text-center text-muted-foreground py-16 text-sm">No transactions yet</p>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
