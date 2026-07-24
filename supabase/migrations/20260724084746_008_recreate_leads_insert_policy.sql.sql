/*
# Recreate leads INSERT policy with explicit grant

PostgREST schema cache appears stale after multiple policy recreations.
This migration drops and recreates the policy with a fresh OID and also
re-grants INSERT privilege to ensure PostgREST picks up the change.
*/

-- Revoke and re-grant to force PostgREST to refresh
REVOKE INSERT ON leads FROM anon, authenticated;
GRANT INSERT ON leads TO anon, authenticated;

-- Drop and recreate the policy
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (source IS NOT NULL);
