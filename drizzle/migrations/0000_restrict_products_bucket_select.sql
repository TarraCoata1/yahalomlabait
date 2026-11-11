DROP POLICY IF EXISTS "products read visible" ON storage.objects;
CREATE POLICY "products admin select"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'products' AND app_private.has_role(auth.uid(), 'admin'::app_role));