
-- Generic trigger helper: block non-admin updates to protected columns
CREATE OR REPLACE FUNCTION public.prevent_protected_column_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- service_role / no auth context => allow (backend)
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
       OR NEW.kyc_doc_url IS DISTINCT FROM OLD.kyc_doc_url THEN
      RAISE EXCEPTION 'Not allowed to modify credit score or KYC status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_loans_update ON public.loans;
CREATE TRIGGER protect_loans_update
BEFORE UPDATE ON public.loans
FOR EACH ROW EXECUTE FUNCTION public.prevent_protected_column_update();

DROP TRIGGER IF EXISTS protect_bnpl_update ON public.bnpl_orders;
CREATE TRIGGER protect_bnpl_update
BEFORE UPDATE ON public.bnpl_orders
FOR EACH ROW EXECUTE FUNCTION public.prevent_protected_column_update();

DROP TRIGGER IF EXISTS protect_notifications_update ON public.notifications;
CREATE TRIGGER protect_notifications_update
BEFORE UPDATE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.prevent_protected_column_update();

DROP TRIGGER IF EXISTS protect_profiles_update ON public.profiles;
CREATE TRIGGER protect_profiles_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_protected_column_update();
