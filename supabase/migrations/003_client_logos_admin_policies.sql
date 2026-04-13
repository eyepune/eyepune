-- ============================================================
-- EyE PunE — Client Logos Admin Policies & Storage Bucket
-- Adds admin CRUD policies for client_logos table
-- Creates public storage bucket for logo image uploads
-- ============================================================

-- ── Admin CRUD policies for client_logos ──────────────────────
-- Allow authenticated admin users to do everything on client_logos
DROP POLICY IF EXISTS "Admin full access on client_logos" ON client_logos;
CREATE POLICY "Admin full access on client_logos" ON client_logos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Create storage bucket for client logo uploads ─────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-logos',
  'client-logos',
  true,
  5242880,  -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- ── Storage policies for client-logos bucket ──────────────────
-- Public can view logos
DROP POLICY IF EXISTS "Public read logo files" ON storage.objects;
CREATE POLICY "Public read logo files" ON storage.objects
  FOR SELECT USING (bucket_id = 'client-logos');

-- Authenticated admin users can upload logos
DROP POLICY IF EXISTS "Admin upload logo files" ON storage.objects;
CREATE POLICY "Admin upload logo files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'client-logos'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Authenticated admin users can delete logos
DROP POLICY IF EXISTS "Admin delete logo files" ON storage.objects;
CREATE POLICY "Admin delete logo files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'client-logos'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
