ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 2;

ALTER TABLE public.products
  ADD CONSTRAINT products_stock_quantity_nonneg CHECK (stock_quantity >= 0),
  ADD CONSTRAINT products_low_stock_threshold_nonneg CHECK (low_stock_threshold >= 0);