/*
# Add mortgage fields to quote_requests

1. Purpose
   Support mortgage quote requests alongside loan and investment requests.
   The Get Quotes modal now has a 3-way toggle (Loan / Investment / Mortgage)
   and mortgage requests need property value, down payment, and combined
   monthly debt fields.

2. Changes to `quote_requests`
   - Add `property_value` (numeric, nullable) — estimated property value.
   - Add `down_payment` (numeric, nullable) — down payment amount.
   - Add `combined_monthly_debt` (numeric, nullable) — combined joint monthly
     salary + monthly debt/bill payments used for stress-test ratios.
   - Drop and recreate `request_type` check constraint to allow 'mortgage'
     in addition to 'loan' and 'investment'.

3. Security
   No RLS or policy changes — existing policies remain intact.
*/

ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS property_value numeric,
  ADD COLUMN IF NOT EXISTS down_payment numeric,
  ADD COLUMN IF NOT EXISTS combined_monthly_debt numeric;

ALTER TABLE public.quote_requests DROP CONSTRAINT IF EXISTS quote_requests_request_type_check;
ALTER TABLE public.quote_requests ADD CONSTRAINT quote_requests_request_type_check
  CHECK (request_type IN ('loan', 'investment', 'mortgage'));
