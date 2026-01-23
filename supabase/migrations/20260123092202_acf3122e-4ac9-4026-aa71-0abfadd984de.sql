-- Add a policy to allow public read access for files in the 'public' folder
CREATE POLICY "Public files are accessible to everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'photobook-images' AND (storage.foldername(name))[1] = 'public');