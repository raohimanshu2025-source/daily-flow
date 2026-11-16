-- Two-person rule: an admin may not approve, disburse or edit protected fields
-- of their OWN loan, nor verify their OWN KYC. Another admin must do it.
-- Also fixes KYC upload for ordinary users: they may now set their own
-- document and move status to 'submitted' (previously blocked by the guard).

CREATE OR REPLACE FUNCTION public.disburse_loan(_loan_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_amount bigint; v_status text; v_duration int; v_entry uuid; v_owner uuid;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'admin only'; END IF;
  SELECT amount, status, duration, user_id INTO v_amount, v_status, v_duration, v_owner FROM public.loans WHERE id = _loan_id;
  IF v_amount IS NULL THEN RAISE EXCEPTION 'loan not found'; END IF;
  IF auth.uid() IS NOT NULL AND v_owner = auth.uid() THEN
    RAISE EXCEPTION 'You cannot disburse your own loan; another admin must do it';
  END IF;
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
$function$;

CREATE OR REPLACE FUNCTION public.admin_review_kyc(_user_id uuid, _decision text, _notes text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'admin only'; END IF;
  IF _user_id = auth.uid() THEN RAISE EXCEPTION 'You cannot review your own KYC; another admin must do it'; END IF;
  IF _decision NOT IN ('verified','rejected') THEN RAISE EXCEPTION 'decision must be verified or rejected'; END IF;
  UPDATE public.profiles
    SET kyc_status = _decision, kyc_review_notes = _notes, kyc_reviewed_at = now(),
        kyc_reviewed_by = auth.uid(), updated_at = now()
    WHERE user_id = _user_id;
  INSERT INTO public.notifications (user_id, title, message, type, icon)
  VALUES (_user_id,
    CASE WHEN _decision='verified' THEN 'KYC approved' ELSE 'KYC rejected' END,
    COALESCE(_notes, CASE WHEN _decision='verified'
      THEN 'Your KYC has been verified. You can now access all features.'
      ELSE 'Your KYC was rejected. Please re-upload valid documents.' END),
    CASE WHEN _decision='verified' THEN 'success' ELSE 'warning' END,
    CASE WHEN _decision='verified' THEN 'check-circle' ELSE 'alert-circle' END);
  PERFORM public.log_audit_event('kyc.' || _decision, 'profile', _user_id::text, jsonb_build_object('notes', _notes));
END;
$function$;

-- Protected columns: the admin bypass no longer applies to the admin's own rows.
CREATE OR REPLACE FUNCTION public.prevent_protected_column_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_admin boolean;
BEGIN
  IF auth.uid() IS NULL OR current_setting('rozanapay.internal', true) = 'on' THEN
    RETURN NEW;
  END IF;
  SELECT public.has_role(auth.uid(), 'admin') INTO is_admin;
  IF is_admin AND NEW.user_id IS DISTINCT FROM auth.uid() THEN
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
       OR NEW.kyc_review_notes IS DISTINCT FROM OLD.kyc_review_notes
       OR NEW.kyc_reviewed_at IS DISTINCT FROM OLD.kyc_reviewed_at
       OR NEW.kyc_reviewed_by IS DISTINCT FROM OLD.kyc_reviewed_by THEN
      RAISE EXCEPTION 'Not allowed to modify credit score or KYC status';
    END IF;
    -- A user may submit (or re-submit) their own KYC document, which sets the
    -- status to 'submitted'. Only an admin review can set verified/rejected,
    -- and a verified KYC cannot be swapped for a new document by the user.
    IF NEW.kyc_status IS DISTINCT FROM OLD.kyc_status
       AND NOT (NEW.kyc_status = 'submitted' AND OLD.kyc_status IS DISTINCT FROM 'verified') THEN
      RAISE EXCEPTION 'Not allowed to modify credit score or KYC status';
    END IF;
    IF NEW.kyc_doc_url IS DISTINCT FROM OLD.kyc_doc_url AND OLD.kyc_status = 'verified' THEN
      RAISE EXCEPTION 'KYC is already verified';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
