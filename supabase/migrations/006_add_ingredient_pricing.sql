-- Add average price column to ingredients table
ALTER TABLE public.ingredients
ADD COLUMN IF NOT EXISTS avg_price_per_unit DECIMAL(10,2) DEFAULT 0.00;

-- Add comment explaining the pricing
COMMENT ON COLUMN public.ingredients.avg_price_per_unit IS 'Average price per standard unit (e.g., $3.99 per lb, $2.50 per cup)';

-- Update some common ingredients with estimated prices (USD)
-- These are rough estimates and should be updated based on local prices

-- Proteins
UPDATE public.ingredients SET avg_price_per_unit = 4.99 WHERE name ILIKE '%chicken breast%';
UPDATE public.ingredients SET avg_price_per_unit = 6.99 WHERE name ILIKE '%ground beef%' AND name ILIKE '%90%';
UPDATE public.ingredients SET avg_price_per_unit = 5.49 WHERE name ILIKE '%ground beef%' AND name ILIKE '%80%';
UPDATE public.ingredients SET avg_price_per_unit = 8.99 WHERE name ILIKE '%salmon%';
UPDATE public.ingredients SET avg_price_per_unit = 7.99 WHERE name ILIKE '%turkey%';

-- Dairy
UPDATE public.ingredients SET avg_price_per_unit = 3.49 WHERE name ILIKE '%milk%';
UPDATE public.ingredients SET avg_price_per_unit = 2.99 WHERE name ILIKE '%butter%';
UPDATE public.ingredients SET avg_price_per_unit = 4.99 WHERE name ILIKE '%cheese%' AND name ILIKE '%parmesan%';
UPDATE public.ingredients SET avg_price_per_unit = 3.99 WHERE name ILIKE '%cheese%' AND name ILIKE '%cheddar%';
UPDATE public.ingredients SET avg_price_per_unit = 2.49 WHERE name ILIKE '%heavy cream%';

-- Vegetables
UPDATE public.ingredients SET avg_price_per_unit = 1.99 WHERE name ILIKE '%tomato paste%';
UPDATE public.ingredients SET avg_price_per_unit = 2.49 WHERE name ILIKE '%onion%';
UPDATE public.ingredients SET avg_price_per_unit = 1.49 WHERE name ILIKE '%garlic%';
UPDATE public.ingredients SET avg_price_per_unit = 2.99 WHERE name ILIKE '%bell pepper%';

-- Grains
UPDATE public.ingredients SET avg_price_per_unit = 3.99 WHERE name ILIKE '%rice%' AND name ILIKE '%white%';
UPDATE public.ingredients SET avg_price_per_unit = 4.49 WHERE name ILIKE '%rice%' AND name ILIKE '%brown%';
UPDATE public.ingredients SET avg_price_per_unit = 3.49 WHERE name ILIKE '%pasta%';

-- Pantry
UPDATE public.ingredients SET avg_price_per_unit = 0.99 WHERE name ILIKE '%salt%';
UPDATE public.ingredients SET avg_price_per_unit = 1.49 WHERE name ILIKE '%pepper%';
UPDATE public.ingredients SET avg_price_per_unit = 4.99 WHERE name ILIKE '%olive oil%';
UPDATE public.ingredients SET avg_price_per_unit = 2.99 WHERE name ILIKE '%soy sauce%';

-- Broth/Stock
UPDATE public.ingredients SET avg_price_per_unit = 3.49 WHERE name ILIKE '%broth%' OR name ILIKE '%stock%';

-- Set default price for items without specific pricing
UPDATE public.ingredients SET avg_price_per_unit = 2.99 WHERE avg_price_per_unit = 0.00;
