-- F14: anonymous visitors may only supply the four fields the contact and
-- exit-intent forms actually collect, and `source` is constrained to the two
-- values the app uses so the lead list cannot be poisoned with arbitrary tags.

REVOKE INSERT ON public.leads FROM anon;
GRANT INSERT (name, email, phone, source) ON public.leads TO anon;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='leads' AND policyname='anon_insert_leads') THEN
    DROP POLICY "anon_insert_leads" ON public.leads;
  END IF;
END $$;

CREATE POLICY "anon_insert_leads" ON public.leads
  FOR INSERT TO anon
  WITH CHECK (
    source IN ('contact_form', 'exit_intent')
    AND length(name) > 0 AND length(name) <= 120
    AND length(email) > 0 AND length(email) <= 254
    AND (phone IS NULL OR length(phone) <= 40)
  );
