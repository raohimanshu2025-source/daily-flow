-- Product events for the pilot (who logs, how often, which features are used).
-- Only event names and small, non-sensitive properties are stored: never
-- amounts typed by the user, document numbers, chat text or voice audio.
CREATE TABLE IF NOT EXISTS public.app_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (name ~ '^[a-z][a-z0-9_]{1,47}$'),
  props jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(props) = 'object' AND pg_column_size(props) <= 1024),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS app_events_user_time_idx ON public.app_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS app_events_name_time_idx ON public.app_events (name, created_at DESC);

ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.app_events FROM anon;
GRANT SELECT, INSERT ON public.app_events TO authenticated;
GRANT ALL ON public.app_events TO service_role;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='app_events' AND policyname='Users insert own events') THEN
    CREATE POLICY "Users insert own events" ON public.app_events FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id AND created_at > now() - interval '5 minutes');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='app_events' AND policyname='Users view own events') THEN
    CREATE POLICY "Users view own events" ON public.app_events FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='app_events' AND policyname='Admins view all events') THEN
    CREATE POLICY "Admins view all events" ON public.app_events FOR SELECT TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Daily engagement view for the pilot report (admins only via RLS on the base table).
CREATE OR REPLACE VIEW public.pilot_daily_engagement WITH (security_invoker = true) AS
SELECT (created_at AT TIME ZONE 'Asia/Kolkata')::date AS day,
       count(DISTINCT user_id) FILTER (WHERE name = 'app_open')       AS users_opened,
       count(DISTINCT user_id) FILTER (WHERE name = 'income_logged')  AS users_logged_income,
       count(*)               FILTER (WHERE name = 'income_logged')  AS income_entries,
       count(*)               FILTER (WHERE name = 'income_logged' AND props->>'via' = 'voice') AS voice_entries
FROM public.app_events
GROUP BY 1;

GRANT SELECT ON public.pilot_daily_engagement TO authenticated;
