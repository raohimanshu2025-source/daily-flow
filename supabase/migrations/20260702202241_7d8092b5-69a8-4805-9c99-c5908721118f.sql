CREATE TABLE public.upi_mandates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  vpa TEXT NOT NULL,
  max_amount_paise BIGINT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'as_presented',
  status TEXT NOT NULL DEFAULT 'active',
  valid_until TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT upi_mandates_status_chk CHECK (status IN ('active','revoked','expired')),
  CONSTRAINT upi_mandates_vpa_chk CHECK (vpa ~ '^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$')
);

CREATE INDEX idx_upi_mandates_loan ON public.upi_mandates(loan_id);
CREATE INDEX idx_upi_mandates_user ON public.upi_mandates(user_id);

GRANT SELECT, INSERT, UPDATE ON public.upi_mandates TO authenticated;
GRANT ALL ON public.upi_mandates TO service_role;

ALTER TABLE public.upi_mandates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own mandates" ON public.upi_mandates
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own mandates" ON public.upi_mandates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users revoke own mandates" ON public.upi_mandates
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all mandates" ON public.upi_mandates
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_upi_mandates_updated_at
  BEFORE UPDATE ON public.upi_mandates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prevent tampering with critical mandate fields by users (only status→revoked allowed)
CREATE OR REPLACE FUNCTION public.upi_mandate_guard()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE is_admin BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  SELECT public.has_role(auth.uid(), 'admin') INTO is_admin;
  IF is_admin THEN RETURN NEW; END IF;
  IF NEW.loan_id <> OLD.loan_id
     OR NEW.user_id <> OLD.user_id
     OR NEW.vpa <> OLD.vpa
     OR NEW.max_amount_paise <> OLD.max_amount_paise
     OR NEW.frequency <> OLD.frequency THEN
    RAISE EXCEPTION 'Mandate fields are immutable; revoke and create a new mandate';
  END IF;
  IF OLD.status = 'revoked' AND NEW.status <> 'revoked' THEN
    RAISE EXCEPTION 'Cannot un-revoke a mandate';
  END IF;
  IF NEW.status = 'revoked' AND NEW.revoked_at IS NULL THEN
    NEW.revoked_at := now();
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER upi_mandate_guard_trg
  BEFORE UPDATE ON public.upi_mandates
  FOR EACH ROW EXECUTE FUNCTION public.upi_mandate_guard();