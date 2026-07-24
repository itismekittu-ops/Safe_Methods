/*
# Fix quote_requests INSERT policy

The consent_given = true WITH CHECK clause was causing inserts to fail even with
consent_given = true in the payload. This recreates the policy cleanly.
*/

DROP POLICY IF EXISTS "anon_insert_quote_requests" ON quote_requests;
CREATE POLICY "anon_insert_quote_requests" ON quote_requests FOR INSERT
  TO anon, authenticated WITH CHECK (consent_given = true);
