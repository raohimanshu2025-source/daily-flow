
-- ============ AUDIT LOG ============
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_user_idx ON public.audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_action_idx ON public.audit_log(action, created_at DESC);

GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- No insert/update/delete policies for clients -> only security definer functions can write.

-- ============ OTP RATE LIMIT ============
CREATE TABLE IF NOT EXISTS public.otp_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS otp_attempts_phone_idx ON public.otp_attempts(phone, attempted_at DESC);

GRANT ALL ON public.otp_attempts TO service_role;

ALTER TABLE public.otp_attempts ENABLE ROW LEVEL SECURITY;
-- No policies -> table is invisible to anon/authenticated; only definer functions touch it.

-- ============ HELPER FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action text,
  _entity_type text DEFAULT NULL,
  _entity_id text DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), _action, _entity_type, _entity_id, COALESCE(_metadata, '{}'::jsonb))
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.check_otp_rate_limit(_phone text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempts int;
BEGIN
  SELECT COUNT(*) INTO attempts
  FROM public.otp_attempts
  WHERE phone = _phone
    AND attempted_at > now() - interval '15 minutes';
  RETURN attempts < 5;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_otp_rate_limit(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.record_otp_attempt(_phone text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.otp_attempts (phone) VALUES (_phone);
  -- prune rows older than 24h to keep table small
  DELETE FROM public.otp_attempts WHERE attempted_at < now() - interval '24 hours';
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_otp_attempt(text) TO anon, authenticated;
