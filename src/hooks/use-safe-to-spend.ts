import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { useExpenses, useIncomeLogs, useLoans, useSavingsGoals } from "./use-cloud-data";
import { safeToSpend } from "@/lib/forecast";

const OPEN = ["disbursed", "active", "overdue"];

/** Latest ledger balance (₹ still owed) for each open loan. */
function useOpenLoanBalances(loanIds: string[]) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["loan_balances", user?.id, loanIds.join(",")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan_ledger")
        .select("loan_id, balance_after_paise, seq" as any)
        .in("loan_id", loanIds)
        .order("seq" as any, { ascending: false });
      if (error) throw error;
      const owed: Record<string, number> = {};
      for (const row of (data ?? []) as any[]) {
        if (!(row.loan_id in owed)) owed[row.loan_id] = Math.max(0, Number(row.balance_after_paise) / 100);
      }
      return owed;
    },
    enabled: !!user && loanIds.length > 0,
  });
}

export function useSafeToSpend() {
  const incomes = useIncomeLogs();
  const expenses = useExpenses();
  const loans = useLoans();
  const savings = useSavingsGoals();

  const open = (loans.data ?? []).filter((l) => OPEN.includes(l.status ?? ""));
  const balances = useOpenLoanBalances(open.map((l) => l.id));

  const isLoading = incomes.isLoading || expenses.isLoading || loans.isLoading || savings.isLoading || (open.length > 0 && balances.isLoading);

  const result = useMemo(() => {
    if (isLoading) return null;
    return safeToSpend({
      incomes: (incomes.data ?? []).map((i) => ({ amount: i.amount, date: i.date })),
      expenses: (expenses.data ?? []).map((e) => ({ amount: e.amount, date: e.date, category: e.category })),
      loans: open.map((l) => ({
        id: l.id,
        // No ledger yet -> fall back to principal minus what was repaid.
        owed: balances.data?.[l.id] ?? Math.max(0, l.amount - (l.repaid_amount ?? 0)),
        dueDate: l.due_date,
        overdue: l.status === "overdue",
      })),
      savings: (savings.data ?? []).map((g) => ({
        autoSavePerDay: g.auto_save_amount ?? 0,
        remaining: Math.max(0, g.target_amount - g.current_amount),
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, incomes.data, expenses.data, loans.data, savings.data, balances.data]);

  return { data: result, isLoading };
}
