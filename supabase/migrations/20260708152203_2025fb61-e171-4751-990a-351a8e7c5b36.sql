
-- 1. Idempotency: no two ledger entries for the same (loan, entry_type, reference_id)
CREATE UNIQUE INDEX IF NOT EXISTS loan_ledger_unique_ref
  ON public.loan_ledger(loan_id, entry_type, reference_id)
  WHERE reference_id IS NOT NULL;

-- 2. Payment lifecycle on manual repayment attempts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='loans' AND column_name='last_payment_status'
  ) THEN
    ALTER TABLE public.loans
      ADD COLUMN last_payment_status text
        CHECK (last_payment_status IN ('initiated','captured','settled','failed'));
    ALTER TABLE public.loans
      ADD COLUMN last_payment_at timestamptz;
    ALTER TABLE public.loans
      ADD COLUMN last_payment_ref text;
  END IF;
END$$;

-- 3. KYC review notes (admin-only editable via prevent_protected_column_update)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='kyc_review_notes'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN kyc_review_notes text;
    ALTER TABLE public.profiles ADD COLUMN kyc_reviewed_at timestamptz;
    ALTER TABLE public.profiles ADD COLUMN kyc_reviewed_by uuid REFERENCES auth.users(id);
  END IF;
END$$;

-- 4. Allow admins to update KYC review columns (extend the guard trigger)
CREATE OR REPLACE FUNCTION public.prevent_protected_column_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_admin boolean;
BEGIN
  IF auth.uid() IS NULL THEN
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
       OR NEW.due_date IS DISTINCT FROM OLD.due_date THEN
      RAISE EXCEPTION 'Not allowed to modify protected loan fields';
    END IF;
  ELSIF TG_TABLE_NAME = 'bnpl_orders' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.amount IS DISTINCT FROM OLD.amount
       OR NEW.category IS DISTINCT FROM OLD.category
       OR NEW.duration_days IS DISTINCT FROM OLD.duration_days
       OR NEW.daily_repayment IS DISTINCT FROM OLD.daily_repayment THEN
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
$function$;

-- 5. Admin RPC to review KYC in one atomic call
CREATE OR REPLACE FUNCTION public.admin_review_kyc(
  _user_id uuid,
  _decision text,
  _notes text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin only';
  END IF;
  IF _decision NOT IN ('verified','rejected') THEN
    RAISE EXCEPTION 'decision must be verified or rejected';
  END IF;

  UPDATE public.profiles
    SET kyc_status = _decision,
        kyc_review_notes = _notes,
        kyc_reviewed_at = now(),
        kyc_reviewed_by = auth.uid(),
        updated_at = now()
    WHERE user_id = _user_id;

  INSERT INTO public.notifications (user_id, title, message, type, icon)
  VALUES (
    _user_id,
    CASE WHEN _decision='verified' THEN 'KYC approved' ELSE 'KYC rejected' END,
    COALESCE(_notes,
      CASE WHEN _decision='verified'
           THEN 'Your KYC has been verified. You can now access all features.'
           ELSE 'Your KYC was rejected. Please re-upload valid documents.' END),
    CASE WHEN _decision='verified' THEN 'success' ELSE 'warning' END,
    CASE WHEN _decision='verified' THEN 'check-circle' ELSE 'alert-circle' END
  );

  PERFORM public.log_audit_event(
    'kyc.' || _decision,
    'profile',
    _user_id::text,
    jsonb_build_object('notes', _notes)
  );
END;
$$;
