-- F15: no screen in the application updates or deletes a row through the Data
-- API; every mutation either happens server-side with the service role or is an
-- insert. Standing UPDATE/DELETE privileges therefore only widened the blast
-- radius of any future policy mistake. Reference data (banks, rates,
-- consultants) is operator-maintained and must not be writable by visitors.

REVOKE UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

REVOKE INSERT ON public.banks, public.rates, public.consultants FROM anon, authenticated;
REVOKE INSERT ON public.outbound_emails FROM anon, authenticated;
REVOKE INSERT ON public.chat_sessions, public.chat_messages FROM anon, authenticated;

DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname='public' AND cmd IN ('UPDATE','DELETE')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;
