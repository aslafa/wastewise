-- ====================================================================
-- WasteWise Supabase Storage Buckets & Policies
-- Version: 20261105000002
-- Target: Supabase Storage
-- Description: Provisioning 3 private storage buckets with strict RLS
-- ====================================================================

-- 1. PROVISION BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    (
        'waste-classifications', 
        'waste-classifications', 
        false, 
        5242880, -- 5MB limit
        ARRAY['image/jpeg', 'image/png', 'image/webp']
    ),
    (
        'pickup-evidence', 
        'pickup-evidence', 
        false, 
        10485760, -- 10MB limit
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    ),
    (
        'processing-evidence', 
        'processing-evidence', 
        false, 
        10485760, -- 10MB limit
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    )
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. STORAGE RLS POLICIES FOR storage.objects

-- 2.1 BUCKET: waste-classifications
-- Path format: {user_id}/{filename}
CREATE POLICY "Users can upload their own classification photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'waste-classifications' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users and admins can view their classification photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'waste-classifications' AND (
        (auth.uid())::text = (storage.foldername(name))[1] OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    )
);

-- 2.2 BUCKET: pickup-evidence
-- Path format: {pickup_id}/{filename}
CREATE POLICY "Officers and users can upload pickup evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'pickup-evidence' AND (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('petugas', 'admin', 'super_admin')
        ) OR
        EXISTS (
            SELECT 1 FROM public.pickup_requests 
            WHERE id::text = (storage.foldername(name))[1] AND user_id = auth.uid()
        )
    )
);

CREATE POLICY "Authorized parties can view pickup evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'pickup-evidence' AND (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'petugas')) OR
        EXISTS (
            SELECT 1 FROM public.pickup_requests 
            WHERE id::text = (storage.foldername(name))[1] AND user_id = auth.uid()
        )
    )
);

-- 2.3 BUCKET: processing-evidence
-- Path format: {batch_or_receipt_id}/{filename}
CREATE POLICY "Partners and admins upload processing evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'processing-evidence' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('mitra', 'admin', 'super_admin')
    )
);

CREATE POLICY "Partners and admins view processing evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'processing-evidence' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('mitra', 'admin', 'super_admin')
    )
);

