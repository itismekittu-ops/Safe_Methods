/*
# Seed Data: Banks, Consultants, and Rates

## Summary
Inserts seed data for the Top Matches sidebar functionality:
- 5 banks (Meridian, Apex, Evergreen, Northbank, Summit) with specialties
- 5 consultants (one per bank) with avatars and titles
- 20 rates across product types (mortgage, personal_loan, gic, investment) with varying terms

## Notes
1. Uses ON CONFLICT DO NOTHING to be idempotent — safe to re-run.
2. Rates are realistic Canadian financial product rates as of 2024.
3. The edge function will query these rates to rank banks for the Top Matches sidebar.
*/

-- ============================================================
-- BANKS
-- ============================================================
INSERT INTO banks (name, specialties) VALUES
  ('Meridian', ARRAY['Mortgages','Personal Loans','Investments']),
  ('Apex', ARRAY['Mortgages','Personal Loans','Credit Cards']),
  ('Evergreen', ARRAY['Mortgages','GIC','Investments','Retirement Planning']),
  ('Northbank', ARRAY['Personal Loans','Credit Cards','Investments']),
  ('Summit', ARRAY['Mortgages','GIC','Retirement Planning'])
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- CONSULTANTS (one per bank)
-- ============================================================
INSERT INTO consultants (bank_id, name, title, avatar_url, specialties)
SELECT b.id, 'Sarah Mitchell', 'Senior Financial Advisor',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=160&h=160&q=80',
  ARRAY['Mortgages','Debt Management']
FROM banks b WHERE b.name = 'Evergreen'
ON CONFLICT DO NOTHING;

INSERT INTO consultants (bank_id, name, title, avatar_url, specialties)
SELECT b.id, 'James Carter', 'Mortgage Specialist',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&h=160&q=80',
  ARRAY['Mortgages','Home Equity']
FROM banks b WHERE b.name = 'Meridian'
ON CONFLICT DO NOTHING;

INSERT INTO consultants (bank_id, name, title, avatar_url, specialties)
SELECT b.id, 'Priya Sharma', 'Investment Advisor',
  'https://images.unsplash.com/photo-1580489944761-4a8a9d6a9e8e?auto=format&fit=crop&w=160&h=160&q=80',
  ARRAY['Mutual Funds','Retirement Planning']
FROM banks b WHERE b.name = 'Apex'
ON CONFLICT DO NOTHING;

INSERT INTO consultants (bank_id, name, title, avatar_url, specialties)
SELECT b.id, 'David Chen', 'Personal Finance Consultant',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80',
  ARRAY['Personal Loans','Credit Building']
FROM banks b WHERE b.name = 'Northbank'
ON CONFLICT DO NOTHING;

INSERT INTO consultants (bank_id, name, title, avatar_url, specialties)
SELECT b.id, 'Emily Watson', 'Wealth Management Advisor',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&h=160&q=80',
  ARRAY['GIC','Retirement Planning','Estate Planning']
FROM banks b WHERE b.name = 'Summit'
ON CONFLICT DO NOTHING;

-- ============================================================
-- RATES (20 entries across product types)
-- ============================================================

-- Mortgage rates (lower is better)
INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'mortgage', '5-year fixed', 5.19 FROM banks b WHERE b.name = 'Meridian'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'mortgage', '5-year fixed', 5.49 FROM banks b WHERE b.name = 'Apex'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'mortgage', '5-year fixed', 4.89 FROM banks b WHERE b.name = 'Evergreen'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'mortgage', '5-year fixed', 5.79 FROM banks b WHERE b.name = 'Northbank'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'mortgage', '5-year fixed', 5.09 FROM banks b WHERE b.name = 'Summit'
ON CONFLICT DO NOTHING;

-- Personal loan rates (lower is better)
INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'personal_loan', '5-year', 8.99 FROM banks b WHERE b.name = 'Meridian'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'personal_loan', '5-year', 9.49 FROM banks b WHERE b.name = 'Apex'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'personal_loan', '5-year', 8.49 FROM banks b WHERE b.name = 'Evergreen'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'personal_loan', '5-year', 7.99 FROM banks b WHERE b.name = 'Northbank'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'personal_loan', '5-year', 9.29 FROM banks b WHERE b.name = 'Summit'
ON CONFLICT DO NOTHING;

-- GIC rates (higher is better)
INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'gic', '1-year', 4.25 FROM banks b WHERE b.name = 'Meridian'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'gic', '1-year', 4.50 FROM banks b WHERE b.name = 'Apex'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'gic', '1-year', 4.75 FROM banks b WHERE b.name = 'Evergreen'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'gic', '1-year', 4.10 FROM banks b WHERE b.name = 'Northbank'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'gic', '1-year', 4.65 FROM banks b WHERE b.name = 'Summit'
ON CONFLICT DO NOTHING;

-- Investment/Mutual fund returns (higher is better)
INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'investment', '3-year avg', 6.5 FROM banks b WHERE b.name = 'Meridian'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'investment', '3-year avg', 7.2 FROM banks b WHERE b.name = 'Apex'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'investment', '3-year avg', 6.8 FROM banks b WHERE b.name = 'Evergreen'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'investment', '3-year avg', 7.5 FROM banks b WHERE b.name = 'Northbank'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'investment', '3-year avg', 6.9 FROM banks b WHERE b.name = 'Summit'
ON CONFLICT DO NOTHING;
