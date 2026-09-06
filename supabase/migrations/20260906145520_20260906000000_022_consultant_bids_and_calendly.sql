/*
# 022 — Consultant Bids, Consultations, and Consultant Emails

## Summary
Implements the Consultant Bid Portal and Calendly integration data model
from the Architecture Design Document (specs/02-architecture.md), covering
the consultant_bids workflow, consultations table, and supporting columns
on existing tables.

## 1. New Enum Type
- `consultant_bid_status` with values:
  'pending_consultant_submission', 'pending_admin_review', 'approved',
  'rejected', 'expired'.

## 2. New Tables

### `consultant_bids`
- `id` (uuid, PK)
- `quote_request_id` (uuid FK → quote_requests.id)
- `consultant_id` (uuid FK → consultants.id)
- `bank_id` (uuid FK → banks.id)
- `access_token` (text, unique) — one-time portal access token
- `token_expires_at` (timestamptz)
- `proposed_rate` (numeric(5,2))
- `product_name` (text)
- `tenure_months` (int)
- `advisor_notes` (text)
- `status` (consultant_bid_status, default 'pending_consultant_submission')
- `submitted_at` (timestamptz)
- `reviewed_at` (timestamptz)
- `admin_notes` (text)
- `created_at` (timestamptz, default now())

### `consultations`
- `id` (uuid, PK)
- `name` (text, not null)
- `email` (text, not null)
- `phone` (text)
- `calendly_event_id` (text, unique)
- `event_start_time` (timestamptz)
- `status` (text, default 'scheduled')
- `created_at` (timestamptz, default now())

## 3. Modified Tables

### `consultants` — add `email` column
- `email` (text, unique) for dispatch notifications

### `quote_requests` — add SLA / aggregation columns
- `reference_id` (text, unique) — human-readable internal reference
- `sla_deadline` (timestamptz) — 5-business-day SLA target
- `aggregated_quotes_sent` (boolean, default false)
- `aggregated_quotes_sent_at` (timestamptz)

## 4. Security
- RLS enabled on `consultant_bids` and `consultations`.
- `consultant_bids`: service-role only (no anon/authenticated direct access);
  consultants access via edge function with access_token.
- `consultations`: service-role only (created by calendly-webhook edge function).
- No public read/write policies — all access goes through edge functions.

## 5. Seed Updates
- Victor Gaur (RBC): safemethods.rbc@proton.me
- Sarah Mitchell (TD): safemethods.td@proton.me
- David Chen (BMO): safemethods.bmo@proton.me

## 6. Indexes
- `consultant_bids.access_token` (unique index via constraint)
- `consultant_bids.quote_request_id` (lookup by quote)
- `consultant_bids.consultant_id` (lookup by consultant)
- `consultant_bids.status` (filter by workflow stage)
- `consultations.calendly_event_id` (unique index via constraint)
- `consultations.email` (lookup by customer)
- `quote_requests.reference_id` (unique index via constraint)
- `quote_requests.sla_deadline` (for pg_cron SLA worker)
*/

-- ============================================================
-- 1. Enum type
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consultant_bid_status') THEN
    CREATE TYPE consultant_bid_status AS ENUM (
      'pending_consultant_submission',
      'pending_admin_review',
      'approved',
      'rejected',
      'expired'
    );
  END IF;
END $$;

-- ============================================================
-- 2. consultant_bids table
-- ============================================================
CREATE TABLE IF NOT EXISTS consultant_bids (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id  uuid NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  consultant_id     uuid NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
  bank_id           uuid NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  access_token      text NOT NULL UNIQUE,
  token_expires_at  timestamptz NOT NULL,
  proposed_rate     numeric(5,2),
  product_name      text,
  tenure_months     int,
  advisor_notes     text,
  status            consultant_bid_status NOT NULL DEFAULT 'pending_consultant_submission',
  submitted_at      timestamptz,
  reviewed_at       timestamptz,
  admin_notes       text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE consultant_bids ENABLE ROW LEVEL SECURITY;

-- No public policies — all access is via edge functions using service role.
-- Explicit deny-all for anon and authenticated (RLS enabled = locked by default).

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_consultant_bids_quote_request_id ON consultant_bids(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_consultant_bids_consultant_id ON consultant_bids(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultant_bids_status ON consultant_bids(status);

-- ============================================================
-- 3. consultations table
-- ============================================================
CREATE TABLE IF NOT EXISTS consultations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  email             text NOT NULL,
  phone             text,
  calendly_event_id text UNIQUE,
  event_start_time  timestamptz,
  status            text NOT NULL DEFAULT 'scheduled',
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- No public policies — rows created by calendly-webhook edge function via service role.

CREATE INDEX IF NOT EXISTS idx_consultations_email ON consultations(email);

-- ============================================================
-- 4. Add email column to consultants
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'consultants' AND column_name = 'email'
  ) THEN
    ALTER TABLE consultants ADD COLUMN email text UNIQUE;
  END IF;
END $$;

-- ============================================================
-- 5. Add SLA / aggregation columns to quote_requests
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'quote_requests' AND column_name = 'reference_id'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN reference_id text UNIQUE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'quote_requests' AND column_name = 'sla_deadline'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN sla_deadline timestamptz;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'quote_requests' AND column_name = 'aggregated_quotes_sent'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN aggregated_quotes_sent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'quote_requests' AND column_name = 'aggregated_quotes_sent_at'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN aggregated_quotes_sent_at timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_quote_requests_sla_deadline ON quote_requests(sla_deadline)
  WHERE aggregated_quotes_sent = false;

-- ============================================================
-- 6. Seed consultant emails
-- ============================================================
UPDATE consultants SET email = 'safemethods.rbc@proton.me'
  WHERE id = '5dab0fbf-6093-4dbd-9e63-9491167005b8';

UPDATE consultants SET email = 'safemethods.td@proton.me'
  WHERE id = '41881c28-d751-4511-8e9e-8edf07879586';

UPDATE consultants SET email = 'safemethods.bmo@proton.me'
  WHERE id = '2ed87be2-6539-4368-a650-288dba78ea94';
