-- Server-side switch for loan applications. While lending_enabled is not 'on',
-- ordinary users cannot create loans (the app hides the form too: FEATURES.lending).
-- Turn on only when a licensed NBFC/bank partner is live:
--   UPDATE public.app_settings SET value = 'on' WHERE key = 'lending_enabled';
INSERT INTO public.app_settings (key, value) VALUES ('lending_enabled', 'off')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.guard_loan_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF COALESCE((SELECT value FROM public.app_settings WHERE key = 'lending_enabled'), 'off') <> 'on' THEN
    RAISE EXCEPTION 'Loans are not available yet';
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
$function$;
