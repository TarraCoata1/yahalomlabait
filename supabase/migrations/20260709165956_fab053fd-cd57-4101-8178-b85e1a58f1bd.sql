
DROP POLICY IF EXISTS "products read" ON storage.objects;

CREATE POLICY "products read visible"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'products'
  AND (
    app_private.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.is_hidden = false
        AND (p.image_key = storage.objects.name OR p.image_key = '/' || storage.objects.name)
    )
  )
);
