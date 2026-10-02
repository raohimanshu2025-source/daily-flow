-- ============================================================================
-- RozanaPay security & money-correctness fixes (applied 2026-10-03, Claude)
-- Applies on top of the 13 original Lovable migrations.
--
-- What this fixes:
--  1. Users could INSERT loans with any status/amount (e.g. fake "repaid" loans
--     to inflate the credit score). Now: pending only, ₹500–10,000, standard rate.
--  2. Borrowers could post "repayment" ledger entries without paying. Ledger
--     posting is now server-only; repay_loan() is gated by app_settings
--     'simulated_repayments' (turn OFF when a payment gateway posts repayments).
--  3. Interest accrued on approved-but-undisbursed loans. Now only after disbursal.
--  4. Late fees were ₹50/day forever. Now capped (default 10% of principal).
--  5. Loan status / notification type CHECK constraints rejected values the app
--     uses ('disbursed', 'rejected', 'success', 'warning'), breaking approvals.
--  6. Ledger "latest balance" was ambiguous for entries posted in the same
--     transaction (same timestamp). Now ordered by a strict sequence.
--  7. compute_credit_score used session_replication_role (disabled ALL triggers,
--     incl. ledger immutability) and could be called for any user. Replaced with
--     a transaction-local flag and a self/admin-only check. Only disbursed loans
--     count toward the score; on-time loan bonus capped.
--  8. Nightly charges and score recompute scheduled in pg_cron (they were missing
--     from the migrations).
-- ============================================================================

-- ---------- 5. constraints ----------
ALTER TABLE public.loans DROP CONSTRAINT IF EXISTS loans_status_check;
ALTER TABLE public.loans ADD CONSTRAINT loans_status_check
  CHECK (status IN ('pending','approved','disbursed','active','repaid','closed','overdue','rejected'));
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('milestone','reminder','reward','tip','success','warning','info'));

-- ---------- misc hardening ----------
ALTER FUNCTION public.loan_ledger_immutable() SET search_path = public;

DROP POLICY IF EXISTS "Users create own mandates" ON public.upi_mandates;
CREATE POLICY "Users create own mandates" ON public.upi_mandates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.loans l WHERE l.id = loan_id AND l.user_id = auth.uid()));

-- ---------- app settings ----------
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read app settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage app settings" ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.app_settings (key, value) VALUES
  ('simulated_repayments', 'on'), ('late_fee_paise', '5000'), ('late_fee_cap_pct', '10')
ON CONFLICT (key) DO NOTHING;

-- ---------- protected columns (adds internal flag + more protected fields) ----------
CREATE OR REPLACE FUNCTION public.prevent_protected_column_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_admin boolean;
BEGIN
  IF auth.uid() IS NULL OR current_setting('rozanapay.internal', true) = 'on' THEN
    RETURN NEW;
  END IF;
  SELECT public.has_role(auth.uid(), 'admin') INTO is_admin;
  IF is_admin THEN
    RETURN NEW;
  END IF;
  IF TG_TABLE_NAME = 'loans' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.interest_rate IS DISTINCT FROM OLD.interest_rate
       OR NEW.amount IS DISTINCT FROM OLD.amount
       OR NEW.duration IS DISTINCT FROM OLD.duration
       OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
       OR NEW.due_date IS DISTINCT FROM OLD.due_date
       OR NEW.repaid_amount IS DISTINCT FROM OLD.repaid_amount
       OR NEW.last_payment_status IS DISTINCT FROM OLD.last_payment_status
       OR NEW.last_payment_at IS DISTINCT FROM OLD.last_payment_at
       OR NEW.last_payment_ref IS DISTINCT FROM OLD.last_payment_ref THEN
      RAISE EXCEPTION 'Not allowed to modify protected loan fields';
    END IF;
  ELSIF TG_TABLE_NAME = 'bnpl_orders' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.amount IS DISTINCT FROM OLD.amount
       OR NEW.category IS DISTINCT FROM OLD.category
       OR NEW.duration_days IS DISTINCT FROM OLD.duration_days
       OR NEW.daily_repayment IS DISTINCT FROM OLD.daily_repayment
       OR NEW.total_repaid IS DISTINCT FROM OLD.total_repaid THEN
      RAISE EXCEPTION 'Not allowed to modify protected BNPL fields';
    END IF;
  ELSIF TG_TABLE_NAME = 'notifications' THEN
    IF NEW.title IS DISTINCT FROM OLD.title
       OR NEW.message IS DISTINCT FROM OLD.message
       OR NEW.type IS DISTINCT FROM OLD.type
       OR NEW.icon IS DISTINCT FROM OLD.icon
       OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Only the read status may be updated on notifications';
    END IF;
  ELSIF TG_TABLE_NAME = 'profiles' THEN
    IF NEW.credit_score IS DISTINCT FROM OLD.credit_score
       OR NEW.kyc_status IS DISTINCT FROM OLD.kyc_status
       OR NEW.kyc_doc_url IS DISTINCT FROM OLD.kyc_doc_url
       OR NEW.kyc_review_notes IS DISTINCT FROM OLD.kyc_review_notes
       OR NEW.kyc_reviewed_at IS DISTINCT FROM OLD.kyc_reviewed_at
       OR NEW.kyc_reviewed_by IS DISTINCT FROM OLD.kyc_reviewed_by THEN
      RAISE EXCEPTION 'Not allowed to modify credit score or KYC status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ---------- 1. insert guards ----------
CREATE OR REPLACE FUNCTION public.guard_loan_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.amount < 500 OR NEW.amount > 10000 THEN
    RAISE EXCEPTION 'Loan amount must be between ₹500 and ₹10,000';
  END IF;
  NEW.status := 'pending';
  NEW.interest_rate := 2;
  NEW.repaid_amount := 0;
  NEW.approved_at := NULL;
  NEW.due_date := NULL;
  NEW.applied_at := now();
  NEW.last_payment_status := NULL;
  NEW.last_payment_at := NULL;
  NEW.last_payment_ref := NULL;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS guard_loans_insert ON public.loans;
CREATE TRIGGER guard_loans_insert BEFORE INSERT ON public.loans FOR EACH ROW EXECUTE FUNCTION public.guard_loan_insert();

CREATE OR REPLACE FUNCTION public.guard_bnpl_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.status := 'active';
  NEW.total_repaid := 0;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS guard_bnpl_insert ON public.bnpl_orders;
CREATE TRIGGER guard_bnpl_insert BEFORE INSERT ON public.bnpl_orders FOR EACH ROW EXECUTE FUNCTION public.guard_bnpl_insert();

-- ---------- 6. strict ledger ordering ----------
ALTER TABLE public.loan_ledger ADD COLUMN IF NOT EXISTS seq bigserial;
CREATE UNIQUE INDEX IF NOT EXISTS loan_ledger_seq_idx ON public.loan_ledger(loan_id, seq DESC);

-- ---------- 2. ledger posting (server-only) ----------
CREATE OR REPLACE FUNCTION public.post_loan_entry(
  _loan_id uuid, _entry_type text, _amount_paise bigint, _description text DEFAULT '', _reference_id text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id uuid; v_prev_balance bigint; v_debit bigint := 0; v_credit bigint := 0;
  v_new_balance bigint; v_new_id uuid;
BEGIN
  IF auth.uid() IS NOT NULL
     AND current_setting('rozanapay.internal', true) IS DISTINCT FROM 'on'
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized to post ledger entries';
  END IF;
  IF _amount_paise <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;
  SELECT user_id INTO v_user_id FROM public.loans WHERE id = _loan_id;
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'loan % not found', _loan_id; END IF;
  IF _entry_type IN ('disbursal','interest_accrual','processing_fee','late_fee','adjustment') THEN v_debit := _amount_paise;
  ELSIF _entry_type IN ('repayment','write_off') THEN v_credit := _amount_paise;
  ELSE RAISE EXCEPTION 'unknown entry type %', _entry_type;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext(_loan_id::text));
  SELECT balance_after_paise INTO v_prev_balance FROM public.loan_ledger
   WHERE loan_id = _loan_id ORDER BY seq DESC LIMIT 1;
  v_new_balance := COALESCE(v_prev_balance, 0) + v_debit - v_credit;
  IF v_new_balance < 0 THEN RAISE EXCEPTION 'repayment exceeds outstanding balance'; END IF;
  INSERT INTO public.loan_ledger (loan_id, user_id, entry_type, debit_paise, credit_paise, balance_after_paise, description, reference_id)
  VALUES (_loan_id, v_user_id, _entry_type, v_debit, v_credit, v_new_balance, COALESCE(_description,''), _reference_id)
  RETURNING id INTO v_new_id;
  PERFORM public.log_audit_event('loan.ledger.' || _entry_type, 'loan', _loan_id::text,
    jsonb_build_object('amount_paise', _amount_paise, 'balance_after', v_new_balance, 'ref', _reference_id));
  RETURN v_new_id;
END;
$$;

CREATE OR REPLACE VIEW public.loan_balances WITH (security_invoker = true) AS
SELECT
  l.id AS loan_id, l.user_id, l.amount AS principal_inr, l.interest_rate, l.status,
  COALESCE(SUM(le.debit_paise) FILTER (WHERE le.entry_type = 'disbursal'), 0) AS disbursed_paise,
  COALESCE(SUM(le.debit_paise) FILTER (WHERE le.entry_type = 'interest_accrual'), 0) AS interest_paise,
  COALESCE(SUM(le.debit_paise) FILTER (WHERE le.entry_type IN ('processing_fee','late_fee')), 0) AS fees_paise,
  COALESCE(SUM(le.credit_paise) FILTER (WHERE le.entry_type = 'repayment'), 0) AS repaid_paise,
  COALESCE(SUM(le.credit_paise) FILTER (WHERE le.entry_type = 'write_off'), 0) AS written_off_paise,
  COALESCE((SELECT balance_after_paise FROM public.loan_ledger WHERE loan_id = l.id ORDER BY seq DESC LIMIT 1), 0) AS outstanding_paise
FROM public.loans l
LEFT JOIN public.loan_ledger le ON le.loan_id = l.id
GROUP BY l.id;

CREATE OR REPLACE FUNCTION public.sync_loan_from_ledger(_loan_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_repaid_paise bigint; v_outstanding bigint; v_status text;
BEGIN
  SELECT COALESCE(repaid_paise,0), COALESCE(outstanding_paise,0), status
    INTO v_repaid_paise, v_outstanding, v_status
    FROM public.loan_balances WHERE loan_id = _loan_id;
  PERFORM set_config('rozanapay.internal', 'on', true);
  UPDATE public.loans
     SET repaid_amount = LEAST((v_repaid_paise / 100)::int, amount),
         status = CASE WHEN v_outstanding = 0 AND v_status IN ('disbursed','active','overdue') THEN 'repaid' ELSE status END,
         updated_at = now()
   WHERE id = _loan_id;
  PERFORM set_config('rozanapay.internal', 'off', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.repay_loan(_loan_id uuid, _amount_paise bigint, _reference_id text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_owner uuid; v_status text; v_entry uuid; v_sim text;
BEGIN
  SELECT user_id, status INTO v_owner, v_status FROM public.loans WHERE id = _loan_id;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'loan not found'; END IF;
  IF auth.uid() IS NULL OR (auth.uid() <> v_owner AND NOT public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF v_status NOT IN ('disbursed','active','overdue') THEN
    RAISE EXCEPTION 'this loan has nothing to repay';
  END IF;
  SELECT value INTO v_sim FROM public.app_settings WHERE key = 'simulated_repayments';
  IF COALESCE(v_sim, 'off') <> 'on' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'repayments are confirmed by the payment gateway, not the app';
  END IF;
  PERFORM set_config('rozanapay.internal', 'on', true);
  v_entry := public.post_loan_entry(_loan_id, 'repayment', _amount_paise,
    '[SIMULATED] Repayment recorded in demo mode', _reference_id);
  PERFORM set_config('rozanapay.internal', 'off', true);
  PERFORM public.sync_loan_from_ledger(_loan_id);
  RETURN v_entry;
END;
$$;

CREATE OR REPLACE FUNCTION public.disburse_loan(_loan_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_amount bigint; v_status text; v_duration int; v_entry uuid;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'admin only'; END IF;
  SELECT amount, status, duration INTO v_amount, v_status, v_duration FROM public.loans WHERE id = _loan_id;
  IF v_amount IS NULL THEN RAISE EXCEPTION 'loan not found'; END IF;
  IF v_status NOT IN ('pending','approved') THEN RAISE EXCEPTION 'loan cannot be disbursed from status %', v_status; END IF;
  PERFORM set_config('rozanapay.internal', 'on', true);
  UPDATE public.loans
     SET status = 'disbursed',
         approved_at = COALESCE(approved_at, now()),
         due_date = COALESCE(due_date, now() + make_interval(days => v_duration)),
         updated_at = now()
   WHERE id = _loan_id;
  v_entry := public.post_loan_entry(_loan_id, 'disbursal', v_amount * 100, 'Principal disbursed', _loan_id::text);
  PERFORM set_config('rozanapay.internal', 'off', true);
  RETURN v_entry;
END;
$$;

-- ---------- 3 & 4. nightly charges ----------
CREATE OR REPLACE FUNCTION public.run_daily_loan_charges()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  r record; v_today text := to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD');
  v_fee bigint; v_cap_pct numeric; v_fees_so_far bigint; v_cap bigint; v_charge bigint;
  v_interest bigint; n_int int := 0; n_fee int := 0;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'admin only'; END IF;
  SELECT COALESCE(value::bigint, 5000) INTO v_fee FROM public.app_settings WHERE key = 'late_fee_paise';
  SELECT COALESCE(value::numeric, 10) INTO v_cap_pct FROM public.app_settings WHERE key = 'late_fee_cap_pct';
  v_fee := COALESCE(v_fee, 5000); v_cap_pct := COALESCE(v_cap_pct, 10);

  PERFORM set_config('rozanapay.internal', 'on', true);
  FOR r IN
    SELECT l.id, l.amount, l.interest_rate, l.due_date, b.outstanding_paise, b.disbursed_paise
      FROM public.loans l JOIN public.loan_balances b ON b.loan_id = l.id
     WHERE l.status IN ('disbursed','active','overdue') AND b.disbursed_paise > 0 AND b.outstanding_paise > 0
  LOOP
    v_interest := round(r.outstanding_paise * r.interest_rate / 100.0 / 30.0);
    IF v_interest > 0 THEN
      BEGIN
        PERFORM public.post_loan_entry(r.id, 'interest_accrual', v_interest,
          'Daily interest ' || v_today, 'INT-' || v_today || '-' || r.id);
        n_int := n_int + 1;
      EXCEPTION WHEN unique_violation THEN NULL;
      END;
    END IF;

    IF r.due_date IS NOT NULL AND r.due_date < now() THEN
      SELECT COALESCE(SUM(debit_paise),0) INTO v_fees_so_far FROM public.loan_ledger
       WHERE loan_id = r.id AND entry_type = 'late_fee';
      v_cap := GREATEST(round(r.disbursed_paise * v_cap_pct / 100.0)::bigint, v_fee);
      v_charge := LEAST(v_fee, v_cap - v_fees_so_far);
      IF v_charge > 0 THEN
        BEGIN
          PERFORM public.post_loan_entry(r.id, 'late_fee', v_charge,
            'Late fee ' || v_today || ' (capped at ' || v_cap_pct || '% of principal)', 'LATE-' || v_today || '-' || r.id);
          n_fee := n_fee + 1;
        EXCEPTION WHEN unique_violation THEN NULL;
        END;
      END IF;
      UPDATE public.loans SET status = 'overdue', updated_at = now() WHERE id = r.id AND status <> 'overdue';
    END IF;
  END LOOP;
  PERFORM set_config('rozanapay.internal', 'off', true);
  RETURN jsonb_build_object('interest_posted', n_int, 'late_fees_posted', n_fee, 'day', v_today);
END;
$$;

-- ---------- 7. credit score ----------
CREATE OR REPLACE FUNCTION public.compute_credit_score(_user_id uuid)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  f_income_days_30 int := 0; f_income_total_30 bigint := 0; f_savings_balance bigint := 0;
  f_loans_total int := 0; f_loans_on_time int := 0; f_loans_overdue int := 0;
  f_outstanding bigint := 0; f_bnpl_active int := 0; f_kyc_verified bool := false; f_account_age_days int := 0;
  v_score int := 300; v_band text; v_factors jsonb;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> _user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  SELECT COUNT(DISTINCT date_trunc('day', date)), COALESCE(SUM(amount),0)
    INTO f_income_days_30, f_income_total_30
    FROM public.income_logs WHERE user_id = _user_id AND date > now() - interval '30 days';
  SELECT COALESCE(SUM(current_amount),0) INTO f_savings_balance FROM public.savings_goals WHERE user_id = _user_id;
  SELECT COUNT(*) FILTER (WHERE l.status IN ('repaid','closed')),
         COUNT(*) FILTER (WHERE l.status IN ('repaid','closed') AND (l.due_date IS NULL OR l.updated_at <= l.due_date)),
         COUNT(*) FILTER (WHERE l.status IN ('disbursed','overdue') AND l.due_date IS NOT NULL AND l.due_date < now())
    INTO f_loans_total, f_loans_on_time, f_loans_overdue
    FROM public.loans l
    WHERE l.user_id = _user_id
      AND EXISTS (SELECT 1 FROM public.loan_ledger le WHERE le.loan_id = l.id AND le.entry_type = 'disbursal');
  SELECT COALESCE(SUM(CASE WHEN entry_type IN ('disbursal','interest_accrual','processing_fee','late_fee','adjustment')
                           THEN debit_paise ELSE -credit_paise END),0)
    INTO f_outstanding FROM public.loan_ledger WHERE user_id = _user_id;
  SELECT COUNT(*) INTO f_bnpl_active FROM public.bnpl_orders WHERE user_id = _user_id AND status = 'active';
  SELECT (kyc_status = 'verified'), GREATEST(0, EXTRACT(DAY FROM now() - created_at)::int)
    INTO f_kyc_verified, f_account_age_days FROM public.profiles WHERE user_id = _user_id;

  v_score := 450;
  v_score := v_score + LEAST(f_income_days_30, 30) * 4;
  v_score := v_score + LEAST((f_income_total_30 / 1000)::int, 100);
  v_score := v_score + LEAST((f_savings_balance / 500)::int, 80);
  v_score := v_score + LEAST(f_loans_on_time, 6) * 25;
  v_score := v_score - f_loans_overdue * 60;
  v_score := v_score - LEAST((f_outstanding / 100000)::int, 50);
  v_score := v_score - f_bnpl_active * 5;
  IF f_kyc_verified THEN v_score := v_score + 60; END IF;
  v_score := v_score + LEAST(COALESCE(f_account_age_days,0) / 7, 30);
  v_score := GREATEST(300, LEAST(900, v_score));

  v_band := CASE WHEN v_score >= 800 THEN 'excellent' WHEN v_score >= 700 THEN 'good'
                 WHEN v_score >= 600 THEN 'fair' WHEN v_score >= 500 THEN 'poor' ELSE 'very_poor' END;
  v_factors := jsonb_build_object(
    'income_days_30', f_income_days_30, 'income_total_30', f_income_total_30, 'savings_balance', f_savings_balance,
    'loans_total', f_loans_total, 'loans_on_time', f_loans_on_time, 'loans_overdue', f_loans_overdue,
    'outstanding_paise', f_outstanding, 'bnpl_active', f_bnpl_active, 'kyc_verified', f_kyc_verified,
    'account_age_days', f_account_age_days);

  INSERT INTO public.credit_score_history (user_id, score, band, factors, model_version)
  VALUES (_user_id, v_score, v_band, v_factors, 'rule-v1');

  PERFORM set_config('rozanapay.internal', 'on', true);
  UPDATE public.profiles SET credit_score = v_score, updated_at = now() WHERE user_id = _user_id;
  PERFORM set_config('rozanapay.internal', 'off', true);
  RETURN v_score;
END;
$$;

-- OTP attempts: old rows are ignored by the 15-minute window; no delete needed in the hot path.
CREATE OR REPLACE FUNCTION public.record_otp_attempt(_phone text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.otp_attempts (phone) VALUES (_phone);
END;
$$;

-- ---------- permissions ----------
REVOKE EXECUTE ON FUNCTION public.post_loan_entry(uuid, text, bigint, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_loan_from_ledger(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.run_daily_loan_charges() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.disburse_loan(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.recompute_all_credit_scores() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_credit_score(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_review_kyc(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.repay_loan(uuid, bigint, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.guard_loan_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_bnpl_insert() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.compute_credit_score(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.disburse_loan(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_kyc(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.repay_loan(uuid, bigint, text) TO authenticated;
REVOKE ALL ON public.loan_balances FROM anon;
GRANT SELECT ON public.loan_balances TO authenticated, service_role;

-- ---------- 8. nightly jobs (times in UTC: 00:30 and 02:00 IST) ----------
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('loan-daily-charges', '0 19 * * *', $$SELECT public.run_daily_loan_charges();$$);
SELECT cron.schedule('credit-score-recompute-nightly', '30 20 * * *', $$SELECT public.recompute_all_credit_scores();$$);
