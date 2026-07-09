
DROP POLICY IF EXISTS "insert orders (anyone)" ON public.orders;
CREATE POLICY "orders insert (guest)" ON public.orders FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);
CREATE POLICY "orders insert (auth)" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "insert order_items (anyone)" ON public.order_items;
CREATE POLICY "order_items insert (guest)" ON public.order_items FOR INSERT TO anon
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id IS NULL)
  );
CREATE POLICY "order_items insert (auth)" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id
            AND (o.user_id IS NULL OR o.user_id = auth.uid()))
  );
