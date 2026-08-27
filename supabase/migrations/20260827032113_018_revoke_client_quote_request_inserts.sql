-- F13: quote requests are now created exclusively by the submit-quote edge
-- function, which validates every field, re-checks consent and enforces the
-- repeat-submission window. The browser no longer needs write access, so the
-- direct Data API path that bypassed all of that is removed.

REVOKE INSERT ON public.quote_requests FROM anon, authenticated;

DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='quote_requests' AND cmd='INSERT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.quote_requests', p.policyname);
  END LOOP;
END $$;
