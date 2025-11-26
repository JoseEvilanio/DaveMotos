-- Create a new storage bucket for products
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'produtos');

-- Policy to allow authenticated uploads
CREATE POLICY "Authenticated Insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'produtos' AND
    auth.role() = 'authenticated'
  );

-- Policy to allow authenticated updates
CREATE POLICY "Authenticated Update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'produtos' AND
    auth.role() = 'authenticated'
  );

-- Policy to allow authenticated deletes
CREATE POLICY "Authenticated Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'produtos' AND
    auth.role() = 'authenticated'
  );
