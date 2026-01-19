-- Change photobook-images bucket from public to private
UPDATE storage.buckets SET public = false WHERE id = 'photobook-images';