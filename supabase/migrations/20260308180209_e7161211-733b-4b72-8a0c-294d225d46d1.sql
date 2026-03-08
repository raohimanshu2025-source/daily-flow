
-- Timestamp update function (reusable)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ===================== PROFILES =====================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  age INTEGER,
  occupation TEXT,
  city TEXT,
  income_type TEXT CHECK (income_type IN ('daily', 'weekly')) DEFAULT 'daily',
  credit_score INTEGER DEFAULT 300,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================== INCOME LOGS =====================
CREATE TABLE public.income_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  payment_type TEXT CHECK (payment_type IN ('cash', 'upi')) DEFAULT 'cash',
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.income_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own income" ON public.income_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own income" ON public.income_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own income" ON public.income_logs FOR DELETE USING (auth.uid() = user_id);

-- ===================== SAVINGS GOALS =====================
CREATE TABLE public.savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount INTEGER NOT NULL,
  current_amount INTEGER NOT NULL DEFAULT 0,
  auto_save_amount INTEGER NOT NULL DEFAULT 50,
  category TEXT CHECK (category IN ('emergency', 'festival', 'school', 'medical', 'other')) DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own savings" ON public.savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own savings" ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own savings" ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own savings" ON public.savings_goals FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_savings_updated_at BEFORE UPDATE ON public.savings_goals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== LOANS =====================
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  duration INTEGER NOT NULL CHECK (duration IN (7, 14, 30)),
  interest_rate NUMERIC NOT NULL DEFAULT 2,
  status TEXT CHECK (status IN ('pending', 'approved', 'active', 'repaid', 'overdue')) DEFAULT 'pending',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  repaid_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own loans" ON public.loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own loans" ON public.loans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loans" ON public.loans FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== TRANSACTIONS =====================
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('income', 'savings', 'loan', 'transfer', 'expense')) NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT CHECK (status IN ('completed', 'pending', 'failed')) DEFAULT 'completed',
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===================== EXPENSES =====================
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  category TEXT CHECK (category IN ('food', 'transport', 'rent', 'medical', 'education', 'shopping', 'utilities', 'other')) NOT NULL,
  note TEXT DEFAULT '',
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- ===================== GOLD INVESTMENTS =====================
CREATE TABLE public.gold_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_inr INTEGER NOT NULL,
  gold_grams NUMERIC NOT NULL,
  price_per_gram NUMERIC NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gold_investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own gold" ON public.gold_investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gold" ON public.gold_investments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===================== INSURANCE POLICIES =====================
CREATE TABLE public.insurance_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('accident', 'health', 'tool', 'life')) NOT NULL,
  daily_premium INTEGER NOT NULL,
  coverage_amount INTEGER NOT NULL,
  status TEXT CHECK (status IN ('active', 'expired', 'claimed')) DEFAULT 'active',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own insurance" ON public.insurance_policies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insurance" ON public.insurance_policies FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===================== BNPL ORDERS =====================
CREATE TABLE public.bnpl_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('grocery', 'medicine', 'school', 'essentials')) NOT NULL,
  amount INTEGER NOT NULL,
  daily_repayment INTEGER NOT NULL,
  total_repaid INTEGER NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'overdue')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bnpl_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bnpl" ON public.bnpl_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bnpl" ON public.bnpl_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bnpl" ON public.bnpl_orders FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_bnpl_updated_at BEFORE UPDATE ON public.bnpl_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== REWARDS =====================
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coins INTEGER NOT NULL,
  reason TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own rewards" ON public.rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rewards" ON public.rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===================== BILL PAYMENTS =====================
CREATE TABLE public.bill_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('mobile', 'electricity', 'dth', 'gas', 'water')) NOT NULL,
  provider TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT CHECK (status IN ('completed', 'pending', 'failed')) DEFAULT 'completed',
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bills" ON public.bill_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bills" ON public.bill_payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===================== GROUP SAVINGS =====================
CREATE TABLE public.group_savings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  members INTEGER NOT NULL DEFAULT 2,
  monthly_contribution INTEGER NOT NULL,
  total_pool INTEGER NOT NULL DEFAULT 0,
  current_round INTEGER NOT NULL DEFAULT 1,
  total_rounds INTEGER NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.group_savings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own groups" ON public.group_savings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own groups" ON public.group_savings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own groups" ON public.group_savings FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.group_savings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== NOTIFICATIONS =====================
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('milestone', 'reminder', 'reward', 'tip')) NOT NULL,
  icon TEXT DEFAULT '🔔',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ===================== INDEXES =====================
CREATE INDEX idx_income_user_date ON public.income_logs(user_id, date DESC);
CREATE INDEX idx_savings_user ON public.savings_goals(user_id);
CREATE INDEX idx_loans_user_status ON public.loans(user_id, status);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, date DESC);
CREATE INDEX idx_gold_user ON public.gold_investments(user_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);
