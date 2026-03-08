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
