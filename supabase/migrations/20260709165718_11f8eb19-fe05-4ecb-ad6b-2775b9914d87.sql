
-- 1) Remove hardcoded admin bootstrap; preserve access via allowlist
DROP TRIGGER IF EXISTS on_auth_user_created_bootstrap_admin ON auth.users;
DROP FUNCTION IF EXISTS app_private.bootstrap_admin_on_signup();

INSERT INTO public.admin_email_allowlist (email)
VALUES ('lielwa2004@gmail.com')
ON CONFLICT DO NOTHING;

-- 2) Server-authoritative pricing helpers
CREATE OR REPLACE FUNCTION app_private.size_price(_size_id text)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _size_id
    WHEN '15x20' THEN 250 WHEN '20x30' THEN 350 WHEN '30x40' THEN 400
    WHEN '30x45' THEN 400 WHEN '40x60' THEN 450 WHEN '40x80' THEN 500
    WHEN '50x70' THEN 500 WHEN '50x100' THEN 600 WHEN '60x90' THEN 600
    WHEN '60x120' THEN 750 WHEN '70x100' THEN 750 WHEN '80x120' THEN 850
    WHEN '70x140' THEN 950 WHEN '100x150' THEN 1300 WHEN '80x160' THEN 1500
    WHEN '100x200' THEN 2000
    WHEN '30x30' THEN 350 WHEN '40x40' THEN 350 WHEN '50x50' THEN 400
    WHEN '60x60' THEN 500 WHEN '70x70' THEN 600 WHEN '80x80' THEN 700
    WHEN '90x90' THEN 800 WHEN '100x100' THEN 900
    ELSE NULL
  END
$$;

CREATE OR REPLACE FUNCTION app_private.installation_fee_for(_size_id text)
RETURNS integer LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE parts text[]; a int; b int; mn int; mx int;
BEGIN
  parts := string_to_array(_size_id, 'x');
  IF parts IS NULL OR array_length(parts, 1) <> 2 THEN RETURN NULL; END IF;
  BEGIN a := parts[1]::int; b := parts[2]::int; EXCEPTION WHEN others THEN RETURN NULL; END;
  mn := LEAST(a, b); mx := GREATEST(a, b);
  IF mn <= 70 AND mx <= 100 THEN RETURN 250; END IF;
  RETURN 350;
END $$;

-- 3) Authoritative order placement RPC
CREATE OR REPLACE FUNCTION public.place_order(
  _items jsonb,
  _customer jsonb,
  _payment_method text,
  _payment_meta jsonb,
  _fulfillment text,
  _shipping_address jsonb,
  _notes text
)
RETURNS TABLE(order_id uuid, order_number bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_item jsonb;
  v_prod_id uuid; v_prod_name text; v_prod_image text; v_prod_sku text;
  v_unit int; v_inst int; v_qty int;
  v_subtotal int := 0; v_install_total int := 0; v_shipping int := 0; v_total int := 0;
  v_order_id uuid; v_order_number bigint;
  v_screw text; v_with_inst boolean; v_size_id text;
BEGIN
  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'invalid_items';
  END IF;
  IF jsonb_array_length(_items) > 50 THEN RAISE EXCEPTION 'too_many_items'; END IF;
  IF _payment_method NOT IN ('bank_transfer','bit','cash') THEN RAISE EXCEPTION 'invalid_payment_method'; END IF;
  IF _fulfillment NOT IN ('shipping','pickup') THEN RAISE EXCEPTION 'invalid_fulfillment'; END IF;

  -- Recompute totals server-side
  FOR v_item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    v_size_id := v_item->>'size_id';
    v_screw   := v_item->>'screw_color';
    v_with_inst := COALESCE((v_item->>'with_installation')::boolean, false);
    v_qty := COALESCE((v_item->>'quantity')::int, 0);
    IF v_qty <= 0 OR v_qty > 100 THEN RAISE EXCEPTION 'invalid_quantity'; END IF;
    IF v_screw IS NULL OR v_screw NOT IN ('silver','gold','black') THEN RAISE EXCEPTION 'invalid_screw_color'; END IF;

    SELECT id, name, image_key, sku
      INTO v_prod_id, v_prod_name, v_prod_image, v_prod_sku
    FROM public.products
    WHERE id = (v_item->>'product_id')::uuid AND NOT is_hidden;
    IF NOT FOUND THEN RAISE EXCEPTION 'invalid_product'; END IF;

    v_unit := app_private.size_price(v_size_id);
    IF v_unit IS NULL THEN RAISE EXCEPTION 'invalid_size'; END IF;
    v_inst := CASE WHEN v_with_inst THEN app_private.installation_fee_for(v_size_id) ELSE 0 END;
    IF v_with_inst AND v_inst IS NULL THEN RAISE EXCEPTION 'invalid_size'; END IF;

    v_subtotal := v_subtotal + v_unit * v_qty;
    v_install_total := v_install_total + COALESCE(v_inst,0) * v_qty;
  END LOOP;

  IF _fulfillment = 'shipping' THEN
    v_shipping := CASE WHEN v_subtotal > 1500 THEN 0 ELSE 49 END;
  END IF;
  v_total := v_subtotal + v_install_total + v_shipping;

  INSERT INTO public.orders (
    user_id, status, payment_method, payment_status, payment_meta, currency,
    subtotal, shipping_fee, installation_fee, discount, total,
    customer_name, customer_email, customer_phone,
    shipping_address, fulfillment_type, notes
  ) VALUES (
    v_uid, 'pending_payment', _payment_method::payment_method, 'pending',
    COALESCE(_payment_meta, '{}'::jsonb),
    'ILS', v_subtotal, v_shipping, v_install_total, 0, v_total,
    COALESCE(_customer->>'name',''),
    COALESCE(_customer->>'email',''),
    COALESCE(_customer->>'phone',''),
    COALESCE(_shipping_address, '{}'::jsonb),
    _fulfillment,
    NULLIF(_notes,'')
  )
  RETURNING orders.id, orders.order_number INTO v_order_id, v_order_number;

  -- Insert items with recomputed prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    v_size_id := v_item->>'size_id';
    v_screw := v_item->>'screw_color';
    v_with_inst := COALESCE((v_item->>'with_installation')::boolean, false);
    v_qty := COALESCE((v_item->>'quantity')::int, 0);

    SELECT id, name, image_key, sku
      INTO v_prod_id, v_prod_name, v_prod_image, v_prod_sku
    FROM public.products WHERE id = (v_item->>'product_id')::uuid;

    v_unit := app_private.size_price(v_size_id);
    v_inst := CASE WHEN v_with_inst THEN app_private.installation_fee_for(v_size_id) ELSE 0 END;

    INSERT INTO public.order_items(
      order_id, product_id, product_name, product_image, sku,
      size_label, size_id, screw_color, with_installation,
      installation_fee, quantity, unit_price, line_total, customization
    ) VALUES (
      v_order_id, v_prod_id::text, v_prod_name, v_prod_image, v_prod_sku,
      COALESCE(v_item->>'size_label', v_size_id), v_size_id, v_screw, v_with_inst,
      COALESCE(v_inst,0), v_qty, v_unit, v_unit * v_qty,
      COALESCE(v_item->'customization','{}'::jsonb)
    );
  END LOOP;

  order_id := v_order_id;
  order_number := v_order_number;
  RETURN NEXT;
END $$;

REVOKE ALL ON FUNCTION public.place_order(jsonb,jsonb,text,jsonb,text,jsonb,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb,jsonb,text,jsonb,text,jsonb,text) TO anon, authenticated;

-- 4) Close direct-insert tamper path — only admins may INSERT directly; guests/users go through place_order
DROP POLICY IF EXISTS "orders insert (auth)" ON public.orders;
DROP POLICY IF EXISTS "orders insert (guest)" ON public.orders;
DROP POLICY IF EXISTS "order_items insert (auth)" ON public.order_items;
DROP POLICY IF EXISTS "order_items insert (guest)" ON public.order_items;
