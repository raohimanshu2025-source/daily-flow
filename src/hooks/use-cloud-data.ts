import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ====== PROFILE ======
export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
}

// ====== INCOME ======
export function useIncomeLogs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['income', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_logs')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddIncome() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: { amount: number; source: string; payment_type: string }) => {
      const { error } = await supabase.from('income_logs').insert({
        user_id: user!.id,
        amount: log.amount,
        source: log.source,
        payment_type: log.payment_type,
      });
      if (error) throw error;
      // Also add transaction
      await supabase.from('transactions').insert({
        user_id: user!.id,
        type: 'income',
        amount: log.amount,
        description: `Income from ${log.source}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['income'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// ====== SAVINGS ======
export function useSavingsGoals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['savings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddSavingsGoal() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (goal: { name: string; target_amount: number; auto_save_amount: number; category: string }) => {
      const { error } = await supabase.from('savings_goals').insert({ ...goal, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings'] }),
  });
}

export function useAddToSavings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ goalId, amount, goalName }: { goalId: string; amount: number; goalName: string }) => {
      // Get current amount
      const { data: goal } = await supabase.from('savings_goals').select('current_amount').eq('id', goalId).single();
      if (!goal) throw new Error('Goal not found');
      const { error } = await supabase.from('savings_goals').update({ current_amount: goal.current_amount + amount }).eq('id', goalId);
      if (error) throw error;
      await supabase.from('transactions').insert({
        user_id: user!.id, type: 'savings', amount, description: `Saved to ${goalName}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// ====== LOANS ======
export function useLoans() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['loans', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', user!.id)
        .order('applied_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddLoan() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (loan: { amount: number; duration: number; interest_rate: number }) => {
      const { error } = await supabase.from('loans').insert({ ...loan, user_id: user!.id });
      if (error) throw error;
      await supabase.from('transactions').insert({
        user_id: user!.id, type: 'loan', amount: loan.amount,
        description: `Loan applied - ₹${loan.amount} for ${loan.duration} days`, status: 'pending',
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// ====== LOAN LEDGER & REPAYMENTS ======
export function useLoanLedger(loanId: string | null) {
  return useQuery({
    queryKey: ['loan_ledger', loanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_ledger')
        .select('*')
        .eq('loan_id', loanId!)
        .order('posted_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!loanId,
  });
}

export function useRepayLoan() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ loanId, amount, referenceId }: { loanId: string; amount: number; referenceId?: string }) => {
      const { data, error } = await supabase.rpc('post_loan_entry', {
        _loan_id: loanId,
        _entry_type: 'repayment',
        _amount_paise: Math.round(amount * 100),
        _description: 'Repayment via UPI',
        _reference_id: referenceId ?? null,
      });
      if (error) throw error;
      // Update the loan repaid_amount field for UI progress bar
      const { data: loan } = await supabase.from('loans').select('repaid_amount, amount').eq('id', loanId).single();
      if (loan) {
        const newRepaid = Math.min(loan.repaid_amount + amount, loan.amount);
        const status = newRepaid >= loan.amount ? 'repaid' : undefined;
        // Note: status change may be blocked by prevent_protected_column_update trigger for non-admins; only update repaid_amount here.
        await supabase.from('loans').update({ repaid_amount: newRepaid }).eq('id', loanId);
        if (status === 'repaid') {
          // Silent attempt; ignored if not permitted
          await supabase.from('loans').update({ status: 'repaid' } as any).eq('id', loanId);
        }
      }
      await supabase.from('transactions').insert({
        user_id: user!.id, type: 'loan', amount, description: `Loan repayment ₹${amount}`, status: 'completed',
      });
      return data;
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['loans'] });
      qc.invalidateQueries({ queryKey: ['loan_ledger', vars.loanId] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// ====== UPI MANDATES ======
export function useUpiMandate(loanId: string | null) {
  return useQuery({
    queryKey: ['upi_mandate', loanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upi_mandates')
        .select('*')
        .eq('loan_id', loanId!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!loanId,
  });
}

export function useCreateMandate() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: { loanId: string; vpa: string; maxAmount: number; validUntil?: string }) => {
      const { error } = await supabase.from('upi_mandates').insert({
        user_id: user!.id,
        loan_id: m.loanId,
        vpa: m.vpa.trim().toLowerCase(),
        max_amount_paise: Math.round(m.maxAmount * 100),
        frequency: 'as_presented',
        status: 'active',
        valid_until: m.validUntil ?? null,
      });
      if (error) throw error;
      await supabase.rpc('log_audit_event', {
        _action: 'mandate.created',
        _entity_type: 'loan',
        _entity_id: m.loanId,
        _metadata: { vpa_masked: m.vpa.replace(/(.{2}).+(@.+)/, '$1***$2'), max_amount: m.maxAmount },
      });
    },
    onSuccess: (_r, v) => qc.invalidateQueries({ queryKey: ['upi_mandate', v.loanId] }),
  });
}

export function useRevokeMandate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ mandateId, loanId }: { mandateId: string; loanId: string }) => {
      const { error } = await supabase.from('upi_mandates').update({ status: 'revoked' }).eq('id', mandateId);
      if (error) throw error;
      await supabase.rpc('log_audit_event', {
        _action: 'mandate.revoked', _entity_type: 'loan', _entity_id: loanId, _metadata: {},
      });
    },
    onSuccess: (_r, v) => qc.invalidateQueries({ queryKey: ['upi_mandate', v.loanId] }),
  });
}

// ====== TRANSACTIONS ======
export function useTransactions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// ====== EXPENSES ======
export function useExpenses() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddExpense() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (exp: { amount: number; category: string; note: string }) => {
      const { error } = await supabase.from('expenses').insert({ ...exp, user_id: user!.id });
      if (error) throw error;
      await supabase.from('transactions').insert({
        user_id: user!.id, type: 'expense', amount: exp.amount,
        description: exp.note || exp.category,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// ====== GOLD ======
export function useGoldInvestments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['gold', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('gold_investments').select('*').eq('user_id', user!.id).order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddGold() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inv: { amount_inr: number; gold_grams: number; price_per_gram: number }) => {
      const { error } = await supabase.from('gold_investments').insert({ ...inv, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gold'] }),
  });
}

// ====== INSURANCE ======
export function useInsurancePolicies() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['insurance', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('insurance_policies').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddInsurance() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { type: string; daily_premium: number; coverage_amount: number; end_date: string }) => {
      const { error } = await supabase.from('insurance_policies').insert({ ...p, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['insurance'] }),
  });
}

// ====== BNPL ======
export function useBnplOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['bnpl', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('bnpl_orders').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddBnpl() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (o: { category: string; amount: number; daily_repayment: number; duration_days: number }) => {
      const { error } = await supabase.from('bnpl_orders').insert({ ...o, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bnpl'] }),
  });
}

// ====== REWARDS ======
export function useRewards() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['rewards', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('rewards').select('*').eq('user_id', user!.id).order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddReward() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: { coins: number; reason: string }) => {
      const { error } = await supabase.from('rewards').insert({ ...r, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rewards'] }),
  });
}

// ====== BILL PAYMENTS ======
export function useBillPayments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['bills', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('bill_payments').select('*').eq('user_id', user!.id).order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddBill() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: { type: string; provider: string; amount: number }) => {
      const { error } = await supabase.from('bill_payments').insert({ ...b, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bills'] }),
  });
}

// ====== GROUP SAVINGS ======
export function useGroupSavings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['groups', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('group_savings').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddGroup() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (g: { name: string; members: number; monthly_contribution: number; total_rounds: number }) => {
      const { error } = await supabase.from('group_savings').insert({ ...g, total_pool: g.monthly_contribution * g.members, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}

// ====== NOTIFICATIONS ======
export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useMarkNotificationsRead() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user!.id).eq('read', false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkOneNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
