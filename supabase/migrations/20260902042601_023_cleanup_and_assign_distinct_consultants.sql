-- 1. Safely unlink consultant references to avoid foreign key blocks
UPDATE public.rates SET consultant_id = NULL;

-- 2. Delete all remaining demo rates, consultants, and demo banks
DELETE FROM public.rates WHERE bank_id IN (
    SELECT id FROM public.banks WHERE name IN ('Apex', 'Summit', 'Evergreen', 'Northbank', 'Meridian')
);

DELETE FROM public.consultants WHERE bank_id IN (
    SELECT id FROM public.banks WHERE name IN ('Apex', 'Summit', 'Evergreen', 'Northbank', 'Meridian')
);

DELETE FROM public.banks WHERE name IN ('Apex', 'Summit', 'Evergreen', 'Northbank', 'Meridian');

-- 3. Reset consultants for real banks to avoid duplicate profiles
DELETE FROM public.consultants WHERE bank_id IN (
    SELECT id FROM public.banks WHERE name IN ('RBC', 'TD', 'BMO')
);

-- 4. Create distinct consultants for each real bank
INSERT INTO public.consultants (bank_id, name, title, specialties)
SELECT id, 'Victor Gaur', 'Principal Financial Advisor', ARRAY['Mortgages', 'GIC', 'Investments']
FROM public.banks WHERE name = 'RBC';

INSERT INTO public.consultants (bank_id, name, title, specialties)
SELECT id, 'Sarah Mitchell', 'Senior Investment Advisor', ARRAY['Mortgages', 'GIC', 'Investments']
FROM public.banks WHERE name = 'TD';

INSERT INTO public.consultants (bank_id, name, title, specialties)
SELECT id, 'David Chen', 'Wealth Management Specialist', ARRAY['Mortgages', 'GIC', 'Investments']
FROM public.banks WHERE name = 'BMO';

-- 5. Insert missing Mortgage terms (1, 2, and 3-year fixed)
INSERT INTO public.rates (bank_id, product_type, term, rate_percent)
SELECT id, 'mortgage', '1-year fixed', 4.56 FROM public.banks WHERE name = 'RBC' UNION ALL
SELECT id, 'mortgage', '2-year fixed', 3.89 FROM public.banks WHERE name = 'RBC' UNION ALL
SELECT id, 'mortgage', '3-year fixed', 3.45 FROM public.banks WHERE name = 'RBC' UNION ALL
SELECT id, 'mortgage', '1-year fixed', 4.12 FROM public.banks WHERE name = 'TD' UNION ALL
SELECT id, 'mortgage', '2-year fixed', 3.99 FROM public.banks WHERE name = 'TD' UNION ALL
SELECT id, 'mortgage', '3-year fixed', 3.25 FROM public.banks WHERE name = 'TD' UNION ALL
SELECT id, 'mortgage', '1-year fixed', 4.89 FROM public.banks WHERE name = 'BMO' UNION ALL
SELECT id, 'mortgage', '2-year fixed', 3.12 FROM public.banks WHERE name = 'BMO' UNION ALL
SELECT id, 'mortgage', '3-year fixed', 3.82 FROM public.banks WHERE name = 'BMO';

-- 6. Insert missing GIC terms (2 and 3-year)
INSERT INTO public.rates (bank_id, product_type, term, rate_percent)
SELECT id, 'gic', '2-year', 1.69 FROM public.banks WHERE name = 'TD' UNION ALL
SELECT id, 'gic', '3-year', 2.01 FROM public.banks WHERE name = 'TD' UNION ALL
SELECT id, 'gic', '2-year', 1.58 FROM public.banks WHERE name = 'BMO' UNION ALL
SELECT id, 'gic', '3-year', 1.89 FROM public.banks WHERE name = 'BMO' UNION ALL
SELECT id, 'gic', '2-year', 1.65 FROM public.banks WHERE name = 'RBC' UNION ALL
SELECT id, 'gic', '3-year', 1.95 FROM public.banks WHERE name = 'RBC';

-- 7. Insert missing Market-Linked terms (2 and 3-year)
INSERT INTO public.rates (bank_id, product_type, term, rate_percent)
SELECT id, 'market_linked', '2-year', 1.69 FROM public.banks WHERE name = 'RBC' UNION ALL
SELECT id, 'market_linked', '3-year', 2.23 FROM public.banks WHERE name = 'RBC' UNION ALL
SELECT id, 'market_linked', '2-year', 1.89 FROM public.banks WHERE name = 'TD' UNION ALL
SELECT id, 'market_linked', '3-year', 2.01 FROM public.banks WHERE name = 'TD' UNION ALL
SELECT id, 'market_linked', '2-year', 1.58 FROM public.banks WHERE name = 'BMO' UNION ALL
SELECT id, 'market_linked', '3-year', 2.11 FROM public.banks WHERE name = 'BMO';

-- 8. Connect all rates to their respective bank's consultant
UPDATE public.rates r
SET consultant_id = c.id
FROM public.consultants c
WHERE c.bank_id = r.bank_id;