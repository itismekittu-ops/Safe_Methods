/*
# Add monthly_debt_payments column to quote_requests

## Summary
Separates the combined mortgage debt/income field into two distinct columns.
Previously the mortgage flow stored a single "combined monthly debt" value
that conflated salary and debt payments. This migration adds a dedicated
`monthly_debt_payments` column alongside the existing `combined_monthly_debt`
column (kept for backward compatibility with historical rows).

## Changes
1. New column on `quote_requests`:
   - `monthly_debt_payments NUMERIC` — the applicant's monthly debt obligations
     (e.g. car loans, credit card minimums, student loans), entered separately
     from `monthly_income` in the mortgage quote form.

## Notes
- Uses `ADD COLUMN IF NOT EXISTS` so the migration is idempotent.
- No RLS or policy changes — the existing quote_requests policies already
  govern all columns on the table.
- The legacy `combined_monthly_debt` column is retained; new mortgage
  submissions will populate `monthly_income` + `monthly_debt_payments` instead.
*/

ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS monthly_debt_payments NUMERIC;
