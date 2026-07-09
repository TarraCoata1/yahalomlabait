
-- 1) Products: SKU
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique_ci
  ON public.products (lower(sku)) WHERE sku IS NOT NULL AND sku <> '';
CREATE INDEX IF NOT EXISTS products_sku_search ON public.products (sku);

-- 2) Site settings: pickup + shipping + install + warranty flag + payment methods JSON
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS pickup_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pickup_address text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pickup_instructions text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_lead_time_text text NOT NULL DEFAULT 'עד 14 ימי עסקים',
  ADD COLUMN IF NOT EXISTS large_size_install_note text NOT NULL DEFAULT 'למידות מעל 70×100 ס״מ, ההתקנה מתחילה מ־₪350 ועולה בהתאם למידה שנבחרה.',
  ADD COLUMN IF NOT EXISTS show_warranty boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_methods jsonb NOT NULL DEFAULT '[
    {"id":"bank_transfer","label":"העברה בנקאית","enabled":true,"instructions":"פרטי חשבון יישלחו במייל לאחר ההזמנה."},
    {"id":"bit","label":"ביט (Bit)","enabled":true,"instructions":"מספר לתשלום ב־Bit יישלח לאחר ההזמנה."},
    {"id":"cash","label":"מזומן במעמד האיסוף/ההתקנה","enabled":true,"instructions":"תשלום במזומן במעמד האיסוף העצמי או ההתקנה בבית."}
  ]'::jsonb;

-- 3) Roles: add moderator; grant admin via allowlist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
  ELSE
    BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderator'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'user'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.admin_email_allowlist (
  email text PRIMARY KEY,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_email_allowlist TO authenticated;
GRANT ALL ON public.admin_email_allowlist TO service_role;
ALTER TABLE public.admin_email_allowlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins can manage admin_email_allowlist" ON public.admin_email_allowlist;
CREATE POLICY "admins can manage admin_email_allowlist"
  ON public.admin_email_allowlist FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.admin_email_allowlist (email, note)
VALUES ('moshemalkaa@gmail.com', 'Owner — auto-granted admin on signup / login')
ON CONFLICT (email) DO NOTHING;

-- Recreate has_role: also treats allowlisted emails as admin (avoids needing a trigger on auth.users)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
    OR (
      _role = 'admin'
      AND EXISTS (
        SELECT 1
        FROM auth.users u
        JOIN public.admin_email_allowlist a ON lower(a.email) = lower(u.email)
        WHERE u.id = _user_id
      )
    )
$function$;

-- Keep prior lockdown (revoke public execute); allow authenticated so RLS on user-facing tables can call it
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- 4) Orders + order_items
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'pending_payment','under_review','customer_contact','in_production','completed','cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('bank_transfer','bit','cash','online');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending','paid','refunded','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number bigserial UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.order_status NOT NULL DEFAULT 'pending_payment',
  payment_method public.payment_method NOT NULL,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  payment_reference text,
  payment_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  currency text NOT NULL DEFAULT 'ILS',
  subtotal integer NOT NULL DEFAULT 0,
  shipping_fee integer NOT NULL DEFAULT 0,
  installation_fee integer NOT NULL DEFAULT 0,
  discount integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  fulfillment_type text NOT NULL DEFAULT 'shipping', -- 'shipping' | 'pickup'
  notes text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text,
  product_name text NOT NULL,
  product_image text,
  sku text,
  size_label text,
  size_id text,
  screw_color text,
  with_installation boolean NOT NULL DEFAULT false,
  installation_fee integer NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  unit_price integer NOT NULL DEFAULT 0,
  line_total integer NOT NULL DEFAULT 0,
  customization jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items (order_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT INSERT ON public.orders TO anon; -- guests can place orders
GRANT USAGE, SELECT ON SEQUENCE public.orders_order_number_seq TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
GRANT INSERT ON public.order_items TO anon;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert orders (anyone)" ON public.orders;
CREATE POLICY "insert orders (anyone)" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "own orders readable" ON public.orders;
CREATE POLICY "own orders readable" ON public.orders FOR SELECT TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "admins manage orders" ON public.orders;
CREATE POLICY "admins manage orders" ON public.orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "insert order_items (anyone)" ON public.order_items;
CREATE POLICY "insert order_items (anyone)" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "own order_items readable" ON public.order_items;
CREATE POLICY "own order_items readable" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()));

DROP POLICY IF EXISTS "admins manage order_items" ON public.order_items;
CREATE POLICY "admins manage order_items" ON public.order_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- updated_at trigger for orders
CREATE OR REPLACE FUNCTION public.orders_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.orders_touch_updated_at();
