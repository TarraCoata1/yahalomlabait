
-- Repoint remaining policies to app_private.has_role and drop public.has_role
DROP POLICY IF EXISTS "Admins can insert page SEO" ON public.page_seo;
DROP POLICY IF EXISTS "Admins can update page SEO" ON public.page_seo;
DROP POLICY IF EXISTS "Admins can delete page SEO" ON public.page_seo;
CREATE POLICY "Admins can insert page SEO" ON public.page_seo FOR INSERT TO authenticated WITH CHECK (app_private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update page SEO" ON public.page_seo FOR UPDATE TO authenticated USING (app_private.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (app_private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete page SEO" ON public.page_seo FOR DELETE TO authenticated USING (app_private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admins can manage admin_email_allowlist" ON public.admin_email_allowlist;
CREATE POLICY "admins can manage admin_email_allowlist" ON public.admin_email_allowlist FOR ALL TO authenticated USING (app_private.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (app_private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admins manage orders" ON public.orders;
CREATE POLICY "admins manage orders" ON public.orders FOR ALL TO authenticated USING (app_private.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (app_private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admins manage order_items" ON public.order_items;
CREATE POLICY "admins manage order_items" ON public.order_items FOR ALL TO authenticated USING (app_private.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (app_private.has_role(auth.uid(), 'admin'::app_role));

-- Now safe to remove the public-schema SECURITY DEFINER function
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Storage policies for site-assets bucket (admin-only writes; admin reads for listing/signed URLs)
DROP POLICY IF EXISTS "site-assets admin select" ON storage.objects;
DROP POLICY IF EXISTS "site-assets admin insert" ON storage.objects;
DROP POLICY IF EXISTS "site-assets admin update" ON storage.objects;
DROP POLICY IF EXISTS "site-assets admin delete" ON storage.objects;

CREATE POLICY "site-assets admin select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'site-assets' AND app_private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "site-assets admin insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-assets' AND app_private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "site-assets admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-assets' AND app_private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'site-assets' AND app_private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "site-assets admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-assets' AND app_private.has_role(auth.uid(), 'admin'::app_role));
