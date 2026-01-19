-- Make photobook-images bucket private to protect user photos
UPDATE storage.buckets 
SET public = false 
WHERE id = 'photobook-images';