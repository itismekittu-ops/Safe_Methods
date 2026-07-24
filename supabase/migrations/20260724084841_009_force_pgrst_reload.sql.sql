/*
# Force PostgREST schema reload via ALTER TABLE

PostgREST caches policy definitions and only reloads when it receives a
NOTIFY pgrst 'reload schema' from the pgrst_ddl_watch event trigger.
That trigger only fires on specific DDL command tags (CREATE TABLE, ALTER
TABLE, etc.) — NOT on CREATE/DROP POLICY. So policy changes made via
execute_sql or apply_migration don't trigger a PostgREST reload.

This migration makes a no-op ALTER TABLE on leads and quote_requests to
force the pgrst_ddl_watch trigger to fire and notify PostgREST to reload
its schema cache, picking up the policy changes made in migrations 006-008.
*/

ALTER TABLE leads SET (autovacuum_enabled = true);
ALTER TABLE quote_requests SET (autovacuum_enabled = true);
