DROP POLICY IF EXISTS "custom uploads: anyone insert" ON storage.objects;

CREATE POLICY "custom uploads: user insert own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'custom-uploads'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "custom uploads: user read own"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'custom-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);