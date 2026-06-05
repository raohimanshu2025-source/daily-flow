
-- ============ 1) loan_ledger table ============
CREATE TABLE public.loan_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL,
  user_id uuid NOT NULL,
  entry_type text NOT NULL CHECK (entry_type IN (
    'disbursal','repayment','interest_accrual','processing_fee','late_fee','write_off','adjustment'
  )),
  debit_paise bigint NOT NULL DEFAULT 0 CHECK (debit_paise >= 0),
  credit_paise bigint NOT NULL DEFAULT 0 CHECK (credit_paise >= 0),
  balance_after_paise bigint NOT NULL,
  description text NOT NULL DEFAULT '',
  reference_id text,
  posted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_loan_ledger_loan ON public.loan_ledger(loan_id, posted_at);
CREATE INDEX idx_loan_ledger_user ON public.loan_ledger(user_id, posted_at DESC);

-- ============ 2) GRANTs ============
GRANT SELECT ON public.loan_ledger TO authenticated;
GRANT ALL ON public.loan_ledger TO service_role;

-- ============ 3) RLS ============
ALTER TABLE public.loan_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ledger"
  ON public.loan_ledger FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all ledger"
  ON public.loan_ledger FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- No INSERT/UPDATE/DELETE policies — only service_role and SECURITY DEFINER functions can write.

-- ============ 4) Immutability trigger (no updates / deletes, even via service_role mistakes) ============
CREATE OR REPLACE FUNCTION public.loan_ledger_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'loan_ledger entries are immutable';
END;
$$;

CREATE TRIGGER loan_ledger_no_update
  BEFORE UPDATE ON public.loan_ledger
  FOR EACH ROW EXECUTE FUNCTION public.loan_ledger_immutable();

CREATE TRIGGER loan_ledger_no_delete
  BEFORE DELETE ON public.loan_ledger
  FOR EACH ROW EXECUTE FUNCTION public.loan_ledger_immutable();

-- ============ 5) post_loan_entry — authoritative writer ============
CREATE OR REPLACE FUNCTION public.post_loan_entry(
  _loan_id uuid,
  _entry_type text,
  _amount_paise bigint,
  _description text DEFAULT '',
  _reference_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_prev_balance bigint;
  v_debit bigint := 0;
  v_credit bigint := 0;
  v_new_balance bigint;
  v_new_id uuid;
  v_is_admin boolean;
BEGIN
  IF _amount_paise <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  SELECT user_id INTO v_user_id FROM public.loans WHERE id = _loan_id;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'loan % not found', _loan_id;
  END IF;

  -- Only loan owner or admin (or backend service_role with no auth.uid) may post.
  IF auth.uid() IS NOT NULL THEN
    SELECT public.has_role(auth.uid(), 'admin') INTO v_is_admin;
    IF auth.uid() <> v_user_id AND NOT v_is_admin THEN
      RAISE EXCEPTION 'not authorized to post on this loan';
    END IF;
    -- Users may only post repayments. Everything else is admin/backend.
    IF NOT v_is_admin AND _entry_type <> 'repayment' THEN
      RAISE EXCEPTION 'only repayments may be posted by the borrower';
    END IF;
  END IF;

  -- Debit = increases borrower's outstanding (disbursal, interest, fees).
  -- Credit = decreases outstanding (repayment, write_off).
  IF _entry_type IN ('disbursal','interest_accrual','processing_fee','late_fee') THEN
    v_debit := _amount_paise;
  ELSIF _entry_type IN ('repayment','write_off') THEN
    v_credit := _amount_paise;
  ELSIF _entry_type = 'adjustment' THEN
    -- adjustment: positive amount increases balance, callers can pass via two entries if needed
    v_debit := _amount_paise;
  END IF;

  SELECT COALESCE(balance_after_paise, 0) INTO v_prev_balance
  FROM public.loan_ledger
  WHERE loan_id = _loan_id
  ORDER BY posted_at DESC, created_at DESC
  LIMIT 1;

  v_new_balance := COALESCE(v_prev_balance, 0) + v_debit - v_credit;

  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'repayment exceeds outstanding balance';
  END IF;

  INSERT INTO public.loan_ledger (
    loan_id, user_id, entry_type, debit_paise, credit_paise,
    balance_after_paise, description, reference_id
  ) VALUES (
    _loan_id, v_user_id, _entry_type, v_debit, v_credit,
    v_new_balance, COALESCE(_description,''), _reference_id
  ) RETURNING id INTO v_new_id;

  -- Audit hook
  PERFORM public.log_audit_event(
    'loan.ledger.' || _entry_type,
    'loan',
    _loan_id::text,
    jsonb_build_object('amount_paise', _amount_paise, 'balance_after', v_new_balance, 'ref', _reference_id)
  );

  RETURN v_new_id;
END;
$$;

-- ============ 6) disburse_loan — admin helper ============
CREATE OR REPLACE FUNCTION public.disburse_loan(_loan_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_amount bigint;
  v_status text;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin only';
  END IF;

  SELECT amount, status INTO v_amount, v_status FROM public.loans WHERE id = _loan_id;
  IF v_amount IS NULL THEN RAISE EXCEPTION 'loan not found'; END IF;
  IF v_status = 'disbursed' THEN RAISE EXCEPTION 'already disbursed'; END IF;

  UPDATE public.loans
    SET status = 'disbursed', approved_at = COALESCE(approved_at, now()), updated_at = now()
    WHERE id = _loan_id;

  RETURN public.post_loan_entry(
    _loan_id, 'disbursal', (v_amount::bigint) * 100,
    'Principal disbursed', _loan_id::text
  );
END;
$$;

-- ============ 7) loan_balances view (per-loan summary) ============
CREATE OR REPLACE VIEW public.loan_balances
WITH (security_invoker = true)
AS
SELECT
  l.id AS loan_id,
  l.user_id,
  l.amount AS principal_inr,
  l.interest_rate,
  l.status,
  COALESCE(SUM(le.debit_paise) FILTER (WHERE le.entry_type = 'disbursal'), 0)        AS disbursed_paise,
  COALESCE(SUM(le.debit_paise) FILTER (WHERE le.entry_type = 'interest_accrual'), 0) AS interest_paise,
  COALESCE(SUM(le.debit_paise) FILTER (WHERE le.entry_type IN ('processing_fee','late_fee')), 0) AS fees_paise,
  COALESCE(SUM(le.credit_paise) FILTER (WHERE le.entry_type = 'repayment'), 0)       AS repaid_paise,
  COALESCE(SUM(le.credit_paise) FILTER (WHERE le.entry_type = 'write_off'), 0)       AS written_off_paise,
  COALESCE((
    SELECT balance_after_paise FROM public.loan_ledger
    WHERE loan_id = l.id ORDER BY posted_at DESC, created_at DESC LIMIT 1
  ), 0) AS outstanding_paise
FROM public.loans l
LEFT JOIN public.loan_ledger le ON le.loan_id = l.id
GROUP BY l.id;

GRANT SELECT ON public.loan_balances TO authenticated;
GRANT SELECT ON public.loan_balances TO service_role;
