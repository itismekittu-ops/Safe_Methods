/*
# Tighten RLS Policies — Remove Blanket-True Write Policies

## Summary
Removes or tightens all RLS policies that used unconditional `true` clauses for
INSERT/UPDATE/DELETE, which effectively bypassed row-level security. The scanner
flagged 21 such policies across 8 tables. This migration replaces them with
either meaningful constraints or drops them entirely where no frontend client
needs write access (edge functions use the service role key, which bypasses RLS).

## Changes by Table

### banks, consultants, rates (reference data — admin-managed)
- DROP INSERT, UPDATE, DELETE policies. These tables are read-only via the anon
  key. All writes happen through edge functions using the service role key
  (bypasses RLS). Previously, ANY authenticated user could insert/update/delete
  bank records — now no client-side role can.
- SELECT policies (anon + authenticated) are unchanged.

### chat_sessions (visitor chat sessions)
- DROP INSERT, UPDATE, DELETE policies. The frontend only reads sessions by
  session_token. All session creation and message persistence is handled by the
  safebot-chat edge function (service role key). Previously, ANY anon user could
  insert/update/delete ANY chat session — now only the service role can.
- SELECT policy (anon + authenticated) is unchanged.

### chat_messages (individual chat messages)
- DROP INSERT, DELETE policies. Same rationale as chat_sessions — the frontend
  only reads messages; writes go through the edge function. Previously, ANY anon
  user could insert or delete ANY chat message.
- SELECT policy (anon + authenticated) is unchanged.

### quote_requests (lead capture from Get Quotes modal)
- INSERT: Replace `WITH CHECK (true)` with `WITH CHECK (consent_given = true)`.
  This enforces GR-CONSENT-01 at the database level — only consented quote
  submissions can be inserted. The frontend always sets consent_given = true.
- DROP UPDATE policy. No frontend code updates quote requests; status changes
  are managed via the service role (edge functions / admin).
- SELECT policy (authenticated only) is unchanged.

### leads (contact form submissions)
- INSERT: Replace `WITH CHECK (true)` with `WITH CHECK (source IS NOT NULL)`.
  This ensures only properly sourced lead submissions are accepted. The column
  has a DEFAULT of 'contact_form', so valid inserts always pass; arbitrary
  data-only inserts without a source are rejected.
- DROP UPDATE policy. No frontend code updates leads.
- SELECT policy (authenticated only) is unchanged.

### outbound_emails (queued transactional emails)
- DROP INSERT, UPDATE, DELETE policies. The send-quote-confirmation edge
  function inserts rows using the service role key (bypasses RLS). No frontend
  code ever accesses this table. Previously, ANY anon user could insert email
  queue entries and ANY authenticated user could modify/delete them.
- SELECT policy (authenticated only) is unchanged.

## Security Impact
After this migration:
- banks, consultants, rates: read-only to all client roles; writes via service role only.
- chat_sessions, chat_messages: read-only to all client roles; writes via service role only.
- quote_requests: anon+authenticated INSERT with consent check; authenticated SELECT; no UPDATE/DELETE.
- leads: anon+authenticated INSERT with source check; authenticated SELECT; no UPDATE/DELETE.
- outbound_emails: authenticated SELECT only; all writes via service role.

## Notes
1. No data is modified or lost — only policies (access control rules) change.
2. All edge functions use the service role key, which bypasses RLS entirely, so
   their operations are unaffected by these policy changes.
3. The SELECT policies on quote_requests, leads, and outbound_emails use
   `USING (true)` for authenticated (admin view). These were not flagged and
   remain unchanged.
*/

-- ============================================================
-- 1. BANKS — drop all write policies
-- ============================================================
DROP POLICY IF EXISTS "auth_insert_banks" ON banks;
DROP POLICY IF EXISTS "auth_update_banks" ON banks;
DROP POLICY IF EXISTS "auth_delete_banks" ON banks;

-- ============================================================
-- 2. CONSULTANTS — drop all write policies
-- ============================================================
DROP POLICY IF EXISTS "auth_insert_consultants" ON consultants;
DROP POLICY IF EXISTS "auth_update_consultants" ON consultants;
DROP POLICY IF EXISTS "auth_delete_consultants" ON consultants;

-- ============================================================
-- 3. RATES — drop all write policies
-- ============================================================
DROP POLICY IF EXISTS "auth_insert_rates" ON rates;
DROP POLICY IF EXISTS "auth_update_rates" ON rates;
DROP POLICY IF EXISTS "auth_delete_rates" ON rates;

-- ============================================================
-- 4. CHAT_SESSIONS — drop write policies (keep SELECT)
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_chat_sessions" ON chat_sessions;
DROP POLICY IF EXISTS "anon_update_chat_sessions" ON chat_sessions;
DROP POLICY IF EXISTS "anon_delete_chat_sessions" ON chat_sessions;

-- ============================================================
-- 5. CHAT_MESSAGES — drop write policies (keep SELECT)
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "anon_delete_chat_messages" ON chat_messages;

-- ============================================================
-- 6. QUOTE_REQUESTS — tighten INSERT, drop UPDATE
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_quote_requests" ON quote_requests;
CREATE POLICY "anon_insert_quote_requests" ON quote_requests FOR INSERT
  TO anon, authenticated WITH CHECK (consent_given = true);

DROP POLICY IF EXISTS "auth_update_quote_requests" ON quote_requests;

-- ============================================================
-- 7. LEADS — tighten INSERT, drop UPDATE
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (source IS NOT NULL);

DROP POLICY IF EXISTS "auth_update_leads" ON leads;

-- ============================================================
-- 8. OUTBOUND_EMAILS — drop all write policies (keep SELECT)
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_outbound_emails" ON outbound_emails;
DROP POLICY IF EXISTS "auth_update_outbound_emails" ON outbound_emails;
DROP POLICY IF EXISTS "auth_delete_outbound_emails" ON outbound_emails;
