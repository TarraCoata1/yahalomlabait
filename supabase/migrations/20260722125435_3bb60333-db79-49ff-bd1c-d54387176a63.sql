
-- RLS policies for custom-uploads bucket
-- Anyone (anon + authenticated) can upload files (for guest custom orders)
-- Only admins can read/list/delete
CREATE POLICY "custom uploads: anyone insert"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'custom-uploads');

CREATE POLICY "custom uploads: admin read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'custom-uploads' AND app_private.has_role(auth.uid(), 'admin'));

CREATE POLICY "custom uploads: admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'custom-uploads' AND app_private.has_role(auth.uid(), 'admin'));
