-- Add consultant_id to rates table to explicitly link each rate to a consultant
ALTER TABLE rates ADD COLUMN consultant_id uuid REFERENCES consultants(id) ON DELETE SET NULL;

-- Backfill: set consultant_id to the first consultant belonging to each rate's bank
UPDATE rates r
SET consultant_id = sub.consultant_id
FROM (
  SELECT DISTINCT ON (bank_id) bank_id, id AS consultant_id
  FROM consultants
  ORDER BY bank_id, created_at
) sub
WHERE r.consultant_id IS NULL
  AND r.bank_id = sub.bank_id;

-- Index for faster joins
CREATE INDEX IF NOT EXISTS idx_rates_consultant_id ON rates(consultant_id);
