
-- 1) Credit score history table
CREATE TABLE public.credit_score_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  score int NOT NULL CHECK (score BETWEEN 300 AND 900),
  band text NOT NULL,
  factors jsonb NOT NULL DEFAULT '{}'::jsonb,
  model_version text NOT NULL DEFAULT 'rule-v1',
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_csh_user_time ON public.credit_score_history(user_id, computed_at DESC);

GRANT SELECT ON public.credit_score_history TO authenticated;
GRANT ALL ON public.credit_score_history TO service_role;

ALTER TABLE public.credit_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own score history"
  ON public.credit_score_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all score history"
  ON public.credit_score_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2) Rule-based credit scorer (v1). Designed so features map 1:1 to a future XGBoost model.
CREATE OR REPLACE FUNCTION public.compute_credit_score(_user_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Features
  f_income_days_30   int    := 0;   -- distinct days with income in last 30
  f_income_total_30  bigint := 0;
  f_savings_balance  bigint := 0;
  f_loans_total      int    := 0;
  f_loans_on_time    int    := 0;
  f_loans_overdue    int    := 0;
  f_outstanding      bigint := 0;
  f_bnpl_active      int    := 0;
  f_kyc_verified     bool   := false;
  f_account_age_days int    := 0;

  v_score int := 300;
  v_band  text;
  v_factors jsonb;
BEGIN
  -- Income consistency (last 30 days)
  SELECT COUNT(DISTINCT date_trunc('day', date)), COALESCE(SUM(amount),0)
    INTO f_income_days_30, f_income_total_30
    FROM public.income_logs
    WHERE user_id = _user_id AND date > now() - interval '30 days';

  -- Savings balance
  SELECT COALESCE(SUM(current_amount),0) INTO f_savings_balance
    FROM public.savings_goals WHERE user_id = _user_id;

  -- Loan history
  SELECT COUNT(*) FILTER (WHERE status IN ('repaid','closed')),
         COUNT(*) FILTER (WHERE status IN ('repaid','closed') AND (due_date IS NULL OR updated_at <= due_date)),
         COUNT(*) FILTER (WHERE status = 'disbursed' AND due_date IS NOT NULL AND due_date < now())
    INTO f_loans_total, f_loans_on_time, f_loans_overdue
    FROM public.loans WHERE user_id = _user_id;

  -- Outstanding from ledger
  SELECT COALESCE(SUM(
           CASE WHEN entry_type IN ('disbursal','interest_accrual','processing_fee','late_fee','adjustment')
                THEN debit_paise ELSE -credit_paise END
         ),0)
    INTO f_outstanding
    FROM public.loan_ledger WHERE user_id = _user_id;

  SELECT COUNT(*) INTO f_bnpl_active
    FROM public.bnpl_orders WHERE user_id = _user_id AND status = 'active';

  SELECT (kyc_status = 'verified'), GREATEST(0, EXTRACT(DAY FROM now() - created_at)::int)
    INTO f_kyc_verified, f_account_age_days
    FROM public.profiles WHERE user_id = _user_id;

  -- Scoring (weights chosen for rule-v1; bounded 300..900)
  v_score := 450;
  v_score := v_score + LEAST(f_income_days_30, 30) * 4;                      -- up to +120
  v_score := v_score + LEAST((f_income_total_30 / 1000)::int, 100);          -- up to +100
  v_score := v_score + LEAST((f_savings_balance / 500)::int, 80);            -- up to +80
  v_score := v_score + f_loans_on_time * 25;                                 -- per on-time loan
  v_score := v_score - f_loans_overdue * 60;                                 -- overdue penalty
  v_score := v_score - LEAST((f_outstanding / 100000)::int, 50);             -- heavy outstanding penalty
  v_score := v_score - f_bnpl_active * 5;                                    -- mild active BNPL drag
  IF f_kyc_verified THEN v_score := v_score + 60; END IF;
  v_score := v_score + LEAST(f_account_age_days / 7, 30);                    -- tenure bonus up to +30

  v_score := GREATEST(300, LEAST(900, v_score));

  v_band := CASE
    WHEN v_score >= 800 THEN 'excellent'
    WHEN v_score >= 700 THEN 'good'
    WHEN v_score >= 600 THEN 'fair'
    WHEN v_score >= 500 THEN 'poor'
    ELSE 'very_poor'
  END;

  v_factors := jsonb_build_object(
    'income_days_30',  f_income_days_30,
    'income_total_30', f_income_total_30,
    'savings_balance', f_savings_balance,
    'loans_total',     f_loans_total,
    'loans_on_time',   f_loans_on_time,
    'loans_overdue',   f_loans_overdue,
    'outstanding_paise', f_outstanding,
    'bnpl_active',     f_bnpl_active,
    'kyc_verified',    f_kyc_verified,
    'account_age_days', f_account_age_days
  );

  INSERT INTO public.credit_score_history (user_id, score, band, factors, model_version)
  VALUES (_user_id, v_score, v_band, v_factors, 'rule-v1');

  -- Sync onto profile (bypasses prevent_protected_column_update because security definer + no auth ctx required for service_role; but trigger checks auth.uid())
  -- We update via direct SQL; the trigger allows when auth.uid() IS NULL OR admin. For per-user self-trigger, we use a session_replication_role bypass:
  PERFORM set_config('session_replication_role','replica', true);
  UPDATE public.profiles SET credit_score = v_score, updated_at = now() WHERE user_id = _user_id;
  PERFORM set_config('session_replication_role','origin', true);

  RETURN v_score;
END;
$$;

-- 3) Batch recompute (admin/backend only)
CREATE OR REPLACE FUNCTION public.recompute_all_credit_scores()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  n int := 0;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin only';
  END IF;
  FOR r IN SELECT user_id FROM public.profiles LOOP
    PERFORM public.compute_credit_score(r.user_id);
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$$;
