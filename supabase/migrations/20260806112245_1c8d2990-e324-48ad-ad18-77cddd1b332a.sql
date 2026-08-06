-- 1. Align display_mode with orientation and enforce it permanently
UPDATE public.products SET display_mode = 'square' WHERE orientation = 'square' AND display_mode <> 'square';
UPDATE public.products SET display_mode = 'portrait' WHERE orientation = 'rectangle' AND display_mode NOT IN ('portrait','landscape');

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_display_mode_matches_orientation;
ALTER TABLE public.products ADD CONSTRAINT products_display_mode_matches_orientation CHECK (
  (orientation = 'square'::artwork_orientation AND display_mode = 'square')
  OR (orientation = 'rectangle'::artwork_orientation AND display_mode IN ('portrait','landscape'))
);

-- 2. Canonical size -> orientation resolver
CREATE OR REPLACE FUNCTION app_private.size_orientation(_size_id text)
RETURNS artwork_orientation
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE parts text[];
BEGIN
  IF _size_id IS NULL THEN RETURN NULL; END IF;
  parts := string_to_array(_size_id, 'x');
  IF array_length(parts, 1) <> 2 THEN RETURN NULL; END IF;
  IF parts[1] = parts[2] THEN RETURN 'square'::artwork_orientation; END IF;
  RETURN 'rectangle'::artwork_orientation;
END $$;

-- 3. order_items records the artwork orientation
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS orientation artwork_orientation;
UPDATE public.order_items
   SET orientation = app_private.size_orientation(size_id)
 WHERE orientation IS NULL AND size_id IS NOT NULL;

-- 4. place_order validates orientation and persists it
CREATE OR REPLACE FUNCTION public.place_order(_items jsonb, _customer jsonb, _payment_method text, _payment_meta jsonb, _fulfillment text, _shipping_address jsonb, _notes text)
 RETURNS TABLE(order_id uuid, order_number bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_item jsonb;
  v_prod_id uuid; v_prod_name text; v_prod_image text; v_prod_sku text;
  v_prod_orient artwork_orientation; v_size_orient artwork_orientation;
  v_unit int; v_inst int; v_qty int;
  v_subtotal int := 0; v_install_total int := 0; v_shipping int := 0; v_total int := 0;
  v_order_id uuid; v_order_number bigint;
  v_screw text; v_with_inst boolean; v_size_id text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'invalid_items';
  END IF;
  IF jsonb_array_length(_items) > 50 THEN RAISE EXCEPTION 'too_many_items'; END IF;
  IF _payment_method NOT IN ('bank_transfer','bit','cash') THEN RAISE EXCEPTION 'invalid_payment_method'; END IF;
  IF _fulfillment NOT IN ('shipping','pickup') THEN RAISE EXCEPTION 'invalid_fulfillment'; END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    v_size_id := v_item->>'size_id';
    v_screw   := v_item->>'screw_color';
    v_with_inst := COALESCE((v_item->>'with_installation')::boolean, false);
    v_qty := COALESCE((v_item->>'quantity')::int, 0);
    IF v_qty <= 0 OR v_qty > 100 THEN RAISE EXCEPTION 'invalid_quantity'; END IF;
    IF v_screw IS NULL OR v_screw NOT IN ('silver','gold','black') THEN RAISE EXCEPTION 'invalid_screw_color'; END IF;

    SELECT id, name, image_key, sku, orientation
      INTO v_prod_id, v_prod_name, v_prod_image, v_prod_sku, v_prod_orient
    FROM public.products
    WHERE id = (v_item->>'product_id')::uuid AND NOT is_hidden;
    IF NOT FOUND THEN RAISE EXCEPTION 'invalid_product'; END IF;

    v_size_orient := app_private.size_orientation(v_size_id);
    IF v_size_orient IS NULL THEN RAISE EXCEPTION 'invalid_size'; END IF;
    IF v_size_orient <> v_prod_orient THEN RAISE EXCEPTION 'orientation_mismatch'; END IF;

    v_unit := app_private.size_price(v_size_id);
    IF v_unit IS NULL THEN RAISE EXCEPTION 'invalid_size'; END IF;
    v_inst := CASE WHEN v_with_inst THEN app_private.installation_fee_for(v_size_id) ELSE 0 END;
    IF v_with_inst AND v_inst IS NULL THEN RAISE EXCEPTION 'invalid_size'; END IF;

    v_subtotal := v_subtotal + v_unit * v_qty;
    v_install_total := v_install_total + COALESCE(v_inst,0) * v_qty;
  END LOOP;

  IF _fulfillment = 'shipping' THEN
    v_shipping := CASE WHEN v_subtotal > 1800 THEN 0 ELSE 59 END;
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

  FOR v_item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    v_size_id := v_item->>'size_id';
    v_screw := v_item->>'screw_color';
    v_with_inst := COALESCE((v_item->>'with_installation')::boolean, false);
    v_qty := COALESCE((v_item->>'quantity')::int, 0);

    SELECT id, name, image_key, sku, orientation
      INTO v_prod_id, v_prod_name, v_prod_image, v_prod_sku, v_prod_orient
    FROM public.products WHERE id = (v_item->>'product_id')::uuid;

    v_unit := app_private.size_price(v_size_id);
    v_inst := CASE WHEN v_with_inst THEN app_private.installation_fee_for(v_size_id) ELSE 0 END;

    INSERT INTO public.order_items(
      order_id, product_id, product_name, product_image, sku,
      size_label, size_id, screw_color, with_installation,
      installation_fee, quantity, unit_price, line_total, customization, orientation
    ) VALUES (
      v_order_id, v_prod_id::text, v_prod_name, v_prod_image, v_prod_sku,
      COALESCE(v_item->>'size_label', v_size_id), v_size_id, v_screw, v_with_inst,
      COALESCE(v_inst,0), v_qty, v_unit, v_unit * v_qty,
      COALESCE(v_item->'customization','{}'::jsonb), v_prod_orient
    );
  END LOOP;

  order_id := v_order_id;
  order_number := v_order_number;
  RETURN NEXT;
END $function$;

REVOKE ALL ON FUNCTION public.place_order(jsonb, jsonb, text, jsonb, text, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb, text, jsonb, text, jsonb, text) TO authenticated;