/*
# Create outbound_emails table

## Summary
Stores queued transactional emails (quote confirmations, etc.) for processing.
The send-quote-confirmation edge function inserts rows here; a downstream
email worker (or admin) picks up pending rows and dispatches them.

## New Tables
1. **outbound_emails** — queued transactional emails
   - id (uuid, PK)
   - to_email (text) — recipient email address
   - subject (text) — email subject line
   - html_body (text) — HTML email content
   - text_body (text) — plain-text fallback
   - status (text) — 'pending' | 'sent' | 'failed' (default 'pending')
   - sent_at (timestamptz, nullable) — when the email was dispatched
   - created_at (timestamptz)

## Security (RLS)
- Insert by anon + authenticated (edge function uses service role, bypasses RLS).
- Read/update/delete only by authenticated (admin).
*/

CREATE TABLE IF NOT EXISTS outbound_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  subject text NOT NULL,
  html_body text NOT NULL,
  text_body text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE outbound_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_outbound_emails" ON outbound_emails;
CREATE POLICY "anon_insert_outbound_emails" ON outbound_emails FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_outbound_emails" ON outbound_emails;
CREATE POLICY "auth_select_outbound_emails" ON outbound_emails FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_outbound_emails" ON outbound_emails;
CREATE POLICY "auth_update_outbound_emails" ON outbound_emails FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_outbound_emails" ON outbound_emails;
CREATE POLICY "auth_delete_outbound_emails" ON outbound_emails FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_outbound_emails_status ON outbound_emails(status);
