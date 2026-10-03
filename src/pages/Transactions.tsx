import MobileLayout from "@/components/MobileLayout";
import { ArrowDownLeft, ArrowUpRight, PiggyBank, CreditCard, Receipt, Loader2 } from "lucide-react";
import { useTransactions } from "@/hooks/use-cloud-data";
import { t } from "@/lib/i18n";

type TxnType = "income" | "savings" | "loan" | "transfer" | "expense";

const typeIcons: Record<TxnType, typeof ArrowDownLeft> = {
  income: ArrowDownLeft,
  savings: PiggyBank,
  loan: CreditCard,
  transfer: ArrowUpRight,
  expense: Receipt,
};

const typeColors: Record<TxnType, string> = {
  income: "bg-success/10 text-success",
  savings: "bg-primary/10 text-primary",
  loan: "bg-warning/10 text-warning",
  transfer: "bg-muted text-muted-foreground",
  expense: "bg-destructive/10 text-destructive",
};

export default function Transactions() {
  // Real activity from the backend (was previously browser-only demo data).
  const { data: transactions = [], isLoading } = useTransactions();

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-4">{t("txn.title")}</h1>

        <div className="space-y-2">
          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {transactions.map((txn) => {
            const type = (txn.type in typeIcons ? txn.type : "transfer") as TxnType;
            const Icon = typeIcons[type];
            const pending = txn.status === "pending";
            const failed = txn.status === "failed";
            const sign = type === "income" ? "+" : pending ? "" : "-";
            return (
              <div key={txn.id} className="flex items-center gap-3 bg-card rounded-xl p-3.5 shadow-card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[type]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(txn.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}{t(`txn.type.${type}`)}
                    {pending && <> · {t("txn.pending")}</>}
                    {failed && <> · {t("txn.failed")}</>}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${type === "income" ? "text-success" : pending || failed ? "text-muted-foreground" : "text-foreground"}`}>
                  {sign}₹{txn.amount.toLocaleString("en-IN")}
                </p>
              </div>
            );
          })}
          {!isLoading && transactions.length === 0 && (
            <p className="text-center text-muted-foreground py-16 text-sm">{t("txn.empty")}</p>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
