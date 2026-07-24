/*
# Recreate leads and quote_requests INSERT policies with ALTER TABLE

PostgREST caches policy definitions and only reloads on specific DDL events.
CREATE/DROP POLICY does not trigger the pgrst_ddl_watch event trigger.
This migration recreates the policies AND includes an ALTER TABLE to force
the event trigger to fire, ensuring PostgREST reloads its schema cache.
*/

-- Recreate leads INSERT policy
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (source IS NOT NULL);

-- Recreate quote_requests INSERT policy
DROP POLICY IF EXISTS "anon_insert_quote_requests" ON quote_requests;
CREATE POLICY "anon_insert_quote_requests" ON quote_requests FOR INSERT
  TO anon, authenticated WITH CHECK (consent_given = true);

-- Force PostgREST schema reload by altering both tables
ALTER TABLE leads SET (parallel_workers = 0);
ALTER TABLE quote_requests SET (parallel_workers = 0);
