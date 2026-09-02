INSERT INTO banks (name) VALUES
  ('TD'),
  ('BMO'),
  ('RBC')
ON CONFLICT (name) DO NOTHING;

DELETE FROM rates
WHERE product_type IN ('mortgage', 'gic')
  AND bank_id IN (
    SELECT id FROM banks
    WHERE name IN ('Meridian', 'Apex', 'Evergreen', 'Northbank', 'Summit')
  );

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'mortgage', '4-year fixed', 3.01 FROM banks b WHERE b.name = 'RBC'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'mortgage', '4-year fixed', 3.14 FROM banks b WHERE b.name = 'TD'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'mortgage', '4-year fixed', 3.22 FROM banks b WHERE b.name = 'BMO'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'gic', '1-year', 1.23 FROM banks b WHERE b.name = 'TD'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'gic', '1-year', 1.38 FROM banks b WHERE b.name = 'BMO'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'gic', '1-year', 1.45 FROM banks b WHERE b.name = 'RBC'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'market_linked', '1-year', 1.45 FROM banks b WHERE b.name = 'RBC'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'market_linked', '1-year', 1.54 FROM banks b WHERE b.name = 'TD'
ON CONFLICT DO NOTHING;

INSERT INTO rates (bank_id, product_type, term, rate_percent)
SELECT b.id, 'market_linked', '1-year', 1.69 FROM banks b WHERE b.name = 'BMO'
ON CONFLICT DO NOTHING;