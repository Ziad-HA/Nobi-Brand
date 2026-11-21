-- UNSEEN inventory fields
-- Run once in Supabase SQL Editor.
-- Existing products remain NULL until you enter their real stock counts in Admin.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_quantity integer,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_stock_quantity_nonnegative'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_stock_quantity_nonnegative
      CHECK (stock_quantity IS NULL OR stock_quantity >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_low_stock_threshold_nonnegative'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_low_stock_threshold_nonnegative
      CHECK (low_stock_threshold >= 0);
  END IF;
END $$;

-- Keep the existing RLS policies. Inventory writes use the same admin-only
-- INSERT/UPDATE permissions already configured for public.products.
