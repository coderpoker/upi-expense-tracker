-- ==========================================
-- Tribe App: Avatars Storage Schema
-- ==========================================

-- Insert the 'avatars' bucket into the managed storage schema (must be public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access to avatars
CREATE POLICY "Avatar images are publicly accessible."
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars (Supabase handles ownership via Auth token)
CREATE POLICY "Authenticated users can upload avatars."
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow users to fully update or delete their own avatars
CREATE POLICY "Users can update their own avatars."
ON storage.objects FOR UPDATE
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatars."
ON storage.objects FOR DELETE
USING (auth.uid() = owner);
