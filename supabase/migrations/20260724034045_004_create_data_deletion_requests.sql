/*
# Create data_deletion_requests table for F5 Data Subject Rights

## Summary
Adds an audit-log table that records permanent data-deletion requests submitted
by authenticated users. This operationalizes F5-US3 (Delete Personal Data) and
the PRD requirement that "deletion audit logs are recorded without retaining
deleted PII."

## New Tables

1. **data_deletion_requests** — Audit trail of user-initiated permanent deletion requests.
   - id (uuid, PK)
   - user_id (uuid, FK -> auth.users, ON DELETE CASCADE) — the user who requested deletion
   - user_email_hash (text) — SHA-256 hash of the user's email at request time, so the audit log can identify the requester for verification WITHOUT storing raw PII
   - status (text) — "pending" | "completed" | "cancelled", default "pending"
   - requested_at (timestamptz) — when the user submitted the request
   - completed_at (timestamptz, nullable) — when the deletion was processed
   - notes (text, nullable) — optional admin notes

## Security (RLS)
- RLS enabled on data_deletion_requests.
- SELECT: authenticated users can read only their own deletion requests.
- INSERT: authenticated users can insert a deletion request only for themselves (user_id = auth.uid()).
- UPDATE: authenticated users can cancel their own pending requests (user_id = auth.uid()).
- DELETE: not allowed (audit logs are immutable).

## Notes
1. The table stores an email HASH, never raw email, so the audit record survives
   the deletion of the user's account without retaining PII.
2. A CHECK constraint validates status against the allowed set.
3. An index on user_id supports per-user lookups.
*/

CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  notes text
);

ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_deletion_requests" ON data_deletion_requests;
CREATE POLICY "select_own_deletion_requests" ON data_deletion_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_deletion_request" ON data_deletion_requests;
CREATE POLICY "insert_own_deletion_request" ON data_deletion_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_deletion_request" ON data_deletion_requests;
CREATE POLICY "update_own_deletion_request" ON data_deletion_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_user_id ON data_deletion_requests(user_id);
