/*
  # Remove client read access to outbound_emails

  ## Problem
  `auth_select_outbound_emails` used `USING (true)`, letting any self-registered
  user read every queued email body. Those bodies embed applicant names, loan
  amounts and monthly income.

  ## Changes
  - Drop the policy. This table is written and read only by the
    send-quote-confirmation edge function, which uses the service-role key and
    bypasses RLS, so no legitimate client path is affected.
*/

DROP POLICY IF EXISTS "auth_select_outbound_emails" ON outbound_emails;
