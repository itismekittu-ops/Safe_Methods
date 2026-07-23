/*
# Create Core Tables for Safe Methods

## Summary
Creates the foundational database tables for the Safe Methods financial advice platform:
- banks: Financial institutions shown in Top Matches
- consultants: Financial advisors paired with banks
- rates: Product rates (loans, investments) used for ranking
- chat_sessions: Visitor chat sessions (anonymous or authenticated)
- chat_messages: Individual messages within chat sessions
- quote_requests: Lead capture from Get Quotes modal
- leads: General contact leads from the contact form

## New Tables

1. **banks** — Financial institutions displayed in the Top Matches sidebar
   - id (uuid, PK)
   - name (text, unique) — e.g. "Meridian"
   - logo_url (text, nullable) — URL to bank logo
   - specialties (text[]) — e.g. ["Mortgages","Personal Loans"]
   - created_at (timestamptz)

2. **consultants** — Financial advisors associated with banks
   - id (uuid, PK)
   - bank_id (uuid, FK → banks.id) — which institution they belong to
   - name (text)
   - title (text) — e.g. "Senior Financial Advisor"
   - avatar_url (text, nullable)
   - specialties (text[])
   - created_at (timestamptz)

3. **rates** — Product rates for ranking banks in Top Matches
   - id (uuid, PK)
   - bank_id (uuid, FK → banks.id)
   - product_type (text) — "mortgage" | "personal_loan" | "gic" | "investment"
   - term (text, nullable) — e.g. "5-year fixed", "1-year"
   - rate_percent (numeric(5,2)) — the interest rate or return rate
   - updated_at (timestamptz)

4. **chat_sessions** — A visitor's chat conversation
   - id (uuid, PK)
   - user_id (uuid, nullable, FK → auth.users) — null for anonymous visitors
   - session_token (uuid, unique) — client-generated token to persist across refreshes
   - created_at (timestamptz)

5. **chat_messages** — Individual messages in a chat session
   - id (uuid, PK)
   - session_id (uuid, FK → chat_sessions.id)
   - role (text) — "user" | "assistant"
   - content (text)
   - created_at (timestamptz)

6. **quote_requests** — Lead capture from the Get Quotes modal
   - id (uuid, PK)
   - session_id (uuid, nullable, FK → chat_sessions.id)
   - name (text)
   - email (text)
   - phone (text, nullable)
   - request_type (text) — "loan" | "investment"
   - loan_amount (numeric, nullable)
   - monthly_income (numeric, nullable)
   - investment_amount (numeric, nullable)
   - tenure (text, nullable)
   - selected_institutions (text[])
   - consent_given (boolean, default false)
   - consent_timestamp (timestamptz, nullable)
   - status (text, default 'pending')
   - created_at (timestamptz)

7. **leads** — General contact form submissions
   - id (uuid, PK)
   - name (text)
   - email (text)
   - phone (text, nullable)
   - source (text) — e.g. "contact_form"
   - created_at (timestamptz)

## Security (RLS)
- All tables have RLS enabled.
- banks, consultants, rates: readable by everyone (anon + authenticated), writes only by authenticated (admin).
- chat_sessions, chat_messages: readable/writable by anon + authenticated (visitor manages their own session via session_token).
- quote_requests, leads: insert by anon + authenticated; read only by authenticated (admin).

## Notes
1. No user_id ownership checks on chat tables — sessions are tracked via session_token (client-generated UUID stored in sessionStorage).
2. Seed data for banks, consultants, and rates is inserted in a follow-up migration.
*/

-- ============================================================
-- 1. BANKS
-- ============================================================
CREATE TABLE IF NOT EXISTS banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  logo_url text,
  specialties text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_banks" ON banks;
CREATE POLICY "anon_read_banks" ON banks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_banks" ON banks;
CREATE POLICY "auth_insert_banks" ON banks FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_banks" ON banks;
CREATE POLICY "auth_update_banks" ON banks FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_banks" ON banks;
CREATE POLICY "auth_delete_banks" ON banks FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 2. CONSULTANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS consultants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid REFERENCES banks(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text,
  avatar_url text,
  specialties text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_consultants" ON consultants;
CREATE POLICY "anon_read_consultants" ON consultants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_consultants" ON consultants;
CREATE POLICY "auth_insert_consultants" ON consultants FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_consultants" ON consultants;
CREATE POLICY "auth_update_consultants" ON consultants FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_consultants" ON consultants;
CREATE POLICY "auth_delete_consultants" ON consultants FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 3. RATES
-- ============================================================
CREATE TABLE IF NOT EXISTS rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid REFERENCES banks(id) ON DELETE CASCADE,
  product_type text NOT NULL,
  term text,
  rate_percent numeric(5,2) NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_rates" ON rates;
CREATE POLICY "anon_read_rates" ON rates FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_rates" ON rates;
CREATE POLICY "auth_insert_rates" ON rates FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_rates" ON rates;
CREATE POLICY "auth_update_rates" ON rates FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_rates" ON rates;
CREATE POLICY "auth_delete_rates" ON rates FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 4. CHAT_SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat_sessions" ON chat_sessions;
CREATE POLICY "anon_select_chat_sessions" ON chat_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_sessions" ON chat_sessions;
CREATE POLICY "anon_insert_chat_sessions" ON chat_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chat_sessions" ON chat_sessions;
CREATE POLICY "anon_update_chat_sessions" ON chat_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_sessions" ON chat_sessions;
CREATE POLICY "anon_delete_chat_sessions" ON chat_sessions FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 5. CHAT_MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat_messages" ON chat_messages;
CREATE POLICY "anon_select_chat_messages" ON chat_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_messages" ON chat_messages;
CREATE POLICY "anon_insert_chat_messages" ON chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_messages" ON chat_messages;
CREATE POLICY "anon_delete_chat_messages" ON chat_messages FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 6. QUOTE_REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  request_type text NOT NULL CHECK (request_type IN ('loan', 'investment')),
  loan_amount numeric,
  monthly_income numeric,
  investment_amount numeric,
  tenure text,
  selected_institutions text[] DEFAULT '{}',
  consent_given boolean NOT NULL DEFAULT false,
  consent_timestamp timestamptz,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_quote_requests" ON quote_requests;
CREATE POLICY "anon_insert_quote_requests" ON quote_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_quote_requests" ON quote_requests;
CREATE POLICY "auth_select_quote_requests" ON quote_requests FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_quote_requests" ON quote_requests;
CREATE POLICY "auth_update_quote_requests" ON quote_requests FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 7. LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  source text DEFAULT 'contact_form',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_leads" ON leads;
CREATE POLICY "auth_select_leads" ON leads FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_leads" ON leads;
CREATE POLICY "auth_update_leads" ON leads FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_consultants_bank_id ON consultants(bank_id);
CREATE INDEX IF NOT EXISTS idx_rates_bank_id ON rates(bank_id);
CREATE INDEX IF NOT EXISTS idx_rates_product_type ON rates(product_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_token ON chat_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_quote_requests_session_id ON quote_requests(session_id);
