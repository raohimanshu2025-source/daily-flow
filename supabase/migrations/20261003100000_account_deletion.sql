-- Account deletion (DPDP right to erasure) while keeping records the law requires.
-- Loan records and the ledger must survive account deletion (lending/AML record-keeping),
-- so loans no longer cascade-delete with the auth user. Like loan_ledger and audit_log,
-- loans.user_id becomes a plain reference once the account is gone.
ALTER TABLE public.loans DROP CONSTRAINT IF EXISTS loans_user_id_fkey;

-- Deleting an admin account must not fail because they reviewed someone's KYC.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_kyc_reviewed_by_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_kyc_reviewed_by_fkey
  FOREIGN KEY (kyc_reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Called by the delete-account edge function (service role only) BEFORE the auth user
-- is deleted. Refuses while money is owed; removes data that has no retention need.
CREATE OR REPLACE FUNCTION public.prepare_account_deletion(_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_owed bigint; v_removed int; v_kept int;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  SELECT COALESCE(SUM(outstanding_paise), 0) INTO v_owed
    FROM public.loan_balances
   WHERE user_id = _user_id AND status IN ('disbursed','active','overdue');
  IF v_owed > 0 THEN
    RAISE EXCEPTION 'OUTSTANDING_LOAN: ₹% still owed', round(v_owed / 100.0);
  END IF;

  DELETE FROM public.upi_mandates WHERE user_id = _user_id;

  WITH gone AS (
    DELETE FROM public.loans l
     WHERE l.user_id = _user_id
       AND NOT EXISTS (SELECT 1 FROM public.loan_ledger le WHERE le.loan_id = l.id)
    RETURNING 1)
  SELECT count(*) INTO v_removed FROM gone;
  SELECT count(*) INTO v_kept FROM public.loans WHERE user_id = _user_id;

  DELETE FROM public.credit_score_history WHERE user_id = _user_id;

  INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (_user_id, 'account.deleted', 'user', _user_id::text,
          jsonb_build_object('loans_removed', v_removed, 'loan_records_retained', v_kept));

  RETURN jsonb_build_object('loans_removed', v_removed, 'loan_records_retained', v_kept);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.prepare_account_deletion(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prepare_account_deletion(uuid) TO service_role;
