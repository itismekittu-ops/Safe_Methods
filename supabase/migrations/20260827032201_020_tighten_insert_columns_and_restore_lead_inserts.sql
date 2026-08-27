-- F14 follow-up: signed-in visitors use the same contact and exit-intent forms,
-- so the insert rule must cover them too, under the identical constraints.
DROP POLICY IF EXISTS "anon_insert_leads" ON public.leads;

REVOKE INSERT ON public.leads FROM authenticated;
GRANT INSERT (name, email, phone, source) ON public.leads TO anon, authenticated;

CREATE POLICY "insert_leads_from_forms" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    source IN ('contact_form', 'exit_intent')
    AND length(name) > 0 AND length(name) <= 120
    AND length(email) > 0 AND length(email) <= 254
    AND (phone IS NULL OR length(phone) <= 40)
  );

-- F15 follow-up: a deletion request carries its own workflow status. Letting the
-- requester write that column would let them mark their own request completed.
REVOKE INSERT ON public.data_deletion_requests FROM anon, authenticated;
GRANT INSERT (user_id, user_email_hash) ON public.data_deletion_requests TO authenticated;
