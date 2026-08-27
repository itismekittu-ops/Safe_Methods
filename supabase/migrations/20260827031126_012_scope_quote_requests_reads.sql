/*
  # Scope quote_requests reads to the owner

  ## Problem
  `anon_select_own_quote_requests` used `USING (consent_given = true)`, but the
  INSERT policy already forces `consent_given = true` on every row, so the
  predicate was vacuous and exposed all applicant PII to anonymous callers.
  `auth_select_quote_requests` used `USING (true)`, exposing all rows to any
  self-registered user.

  ## Changes
  - Drop the anonymous SELECT policy. The client never reads this table back
    (GetQuotesModal inserts without .select()), so nothing legitimate breaks.
  - Replace the authenticated SELECT policy with one scoped to the caller's own
    email, matching what Account.tsx actually queries.
*/

DROP POLICY IF EXISTS "anon_select_own_quote_requests" ON quote_requests;
DROP POLICY IF EXISTS "auth_select_quote_requests" ON quote_requests;

CREATE POLICY "select_own_quote_requests" ON quote_requests FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'));
