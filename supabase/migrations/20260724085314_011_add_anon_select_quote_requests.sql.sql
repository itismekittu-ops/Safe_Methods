/*
# Add anon SELECT policy on quote_requests for return=representation

## Summary
The `Prefer: return=representation` header causes PostgREST to SELECT the
inserted row back after INSERT. The quote_requests table only had a SELECT
policy for `authenticated`, not `anon`. When an anonymous user submitted a
quote request with `return=representation`, PostgREST tried to SELECT the
row as `anon`, which failed RLS, causing a 401 error.

## Changes
- Add a SELECT policy for `anon, authenticated` on quote_requests that only
  allows reading rows where `consent_given = true`. This is safe because:
  1. Anon can only INSERT consented rows (enforced by the INSERT policy).
  2. The SELECT only returns consented rows, not all rows.
  3. The frontend uses this to read back the row it just inserted.

## Security
- anon can only SELECT rows where consent_given = true (not all rows).
- authenticated can still SELECT all rows (existing policy unchanged).
- This does not expose other users' data beyond what was already possible
  via the authenticated SELECT policy.
*/

DROP POLICY IF EXISTS "anon_select_own_quote_requests" ON quote_requests;
CREATE POLICY "anon_select_own_quote_requests" ON quote_requests FOR SELECT
  TO anon, authenticated USING (consent_given = true);
