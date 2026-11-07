-- ====================================================================
-- WasteWise Core Database Migration
-- Version: 20261105000000
-- Target: Supabase PostgreSQL 15+
-- Description: Core Schema for WasteWise AI + Smart Waste Management
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('warga', 'petugas', 'mitra', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended', 'pending_approval');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE pickup_status AS ENUM (
        'draft',
        'pending',
        'assigned',
        'on_the_way',
        'arrived',
        'verified',
        'completed',
        'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE assignment_status AS ENUM (
        'assigned',
        'accepted',
        'in_progress',
        'completed',
        'reassigned',
        'failed'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE partner_type AS ENUM (
        'bank_sampah',
        'tps3r',
        'daur_ulang_swasta',
        'dinas_lh'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE reward_type AS ENUM (
        'diskon_jasa',
        'voucher_belanja',
        'donasi_pohon',
        'uang_tunai'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE redemption_status AS ENUM (
        'issued',
        'claimed',
        'expired',
        'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE point_transaction_type AS ENUM (
        'earn_pickup',
        'earn_referral',
        'redeem_reward',
        'admin_adjustment',
        'refund_cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE batch_status AS ENUM (
        'created',
        'in_transit',
        'processing',
        'completed',
        'disposed'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Initial System Settings
INSERT INTO public.system_settings (key, value, description)
VALUES 
    ('platform_name', '"WasteWise"', 'Nama resmi platform'),
    ('b3_acceptance_policy', '{"auto_points": false, "requires_special_handler": true, "message": "Limbah B3 dikarantina dan tidak mendapat poin komersial"}', 'Kebijakan penerimaan limbah B3'),
    ('operational_hours', '{"start": "08:00", "end": "17:00", "timezone": "Asia/Jakarta"}', 'Jam operasional penjemputan armada')
ON CONFLICT (key) DO NOTHING;

-- 4. PARTNERS (Kemitraan Bank Sampah & Daur Ulang)
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    partner_type partner_type NOT NULL DEFAULT 'bank_sampah',
    code TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    contact_person TEXT,
    contact_phone TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_active BOOLEAN NOT NULL DEFAULT false, -- Mitra disiapkan tapi belum diaktifkan sesuai aturan
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. PROFILES (Terhubung 1:1 ke auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'warga',
    phone TEXT,
    avatar_url TEXT,
    points_balance INTEGER NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
    partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
    status account_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_partner_id ON public.profiles(partner_id);

-- 6. USER ADDRESSES (Multi-Address per Warga)
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Rumah',
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    full_address TEXT NOT NULL,
    kelurahan TEXT,
    kecamatan TEXT,
    city TEXT NOT NULL DEFAULT 'Kudus',
    postal_code TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);

-- 7. STAFF ASSIGNMENTS (Penugasan Petugas ke Wilayah & Armada)
CREATE TABLE IF NOT EXISTS public.staff_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_zone TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    vehicle_plate_number TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_assignments_officer ON public.staff_assignments(officer_id);

-- 8. MODEL VERSIONS (Manajemen Model TFLite)
CREATE TABLE IF NOT EXISTS public.model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_code TEXT UNIQUE NOT NULL,
    architecture TEXT NOT NULL DEFAULT 'MobileNet Quantized',
    input_shape TEXT NOT NULL DEFAULT '[1, 224, 224, 3]',
    input_type TEXT NOT NULL DEFAULT 'UINT8',
    output_classes JSONB NOT NULL DEFAULT '["Organik", "Anorganik", "B3"]'::jsonb,
    file_size_bytes BIGINT NOT NULL DEFAULT 793176,
    md5_hash TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    released_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Versi Model Aktif WasteWise
INSERT INTO public.model_versions (version_code, architecture, input_shape, input_type, output_classes, file_size_bytes)
VALUES ('v1.0-tflite-mobilenet-uint8', 'MobileNet Depthwise Conv2D Quantized', '[1, 224, 224, 3]', 'UINT8', '["Organik", "Anorganik", "B3"]'::jsonb, 793176)
ON CONFLICT (version_code) DO NOTHING;

-- 9. WASTE CATEGORIES (Master Kategori Sampah)
CREATE TABLE IF NOT EXISTS public.waste_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_hazardous BOOLEAN NOT NULL DEFAULT false,
    allows_auto_points BOOLEAN NOT NULL DEFAULT true,
    color_hex TEXT NOT NULL DEFAULT '#16A34A',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed 3 Kategori Utama Sesuai Model AI WasteWise
INSERT INTO public.waste_categories (code, name, description, is_hazardous, allows_auto_points, color_hex)
VALUES 
    ('ORG', 'Organik', 'Sisa makanan, dedaunan, bahan kompos organik', false, true, '#16A34A'),
    ('ANORG', 'Anorganik', 'Plastik, kardus, botol, kaleng daur ulang', false, true, '#0284C7'),
    ('B3', 'B3', 'Limbah bahan berbahaya & beracun (baterai, lampu TL)', true, false, '#DC2626')
ON CONFLICT (code) DO NOTHING;

-- 10. WASTE CLASSIFICATIONS (Hasil Deteksi AI - Immutable)
CREATE TABLE IF NOT EXISTS public.waste_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    model_version_id UUID REFERENCES public.model_versions(id) ON DELETE SET NULL,
    image_storage_path TEXT NOT NULL,
    predicted_category_id UUID NOT NULL REFERENCES public.waste_categories(id),
    confidence_score NUMERIC(5, 2) NOT NULL CHECK (confidence_score >= 0.00 AND confidence_score <= 100.00),
    raw_tensor_index TEXT NOT NULL,
    client_device_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classifications_user_id ON public.waste_classifications(user_id);
CREATE INDEX IF NOT EXISTS idx_classifications_category ON public.waste_classifications(predicted_category_id);

-- 11. POINT RULES (Aturan Konversi Poin per Kategori)
CREATE TABLE IF NOT EXISTS public.point_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.waste_categories(id) ON DELETE CASCADE,
    sub_category_name TEXT NOT NULL,
    points_per_kg INTEGER NOT NULL DEFAULT 0 CHECK (points_per_kg >= 0),
    minimum_weight_kg NUMERIC(6, 2) NOT NULL DEFAULT 0.50,
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_until DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_category_subcategory_rule UNIQUE (category_id, sub_category_name, effective_from)
);

-- 12. WASTE PRICES (Katalog Harga Komersial)
CREATE TABLE IF NOT EXISTS public.waste_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.waste_categories(id),
    item_name TEXT NOT NULL,
    buying_price_per_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (buying_price_per_kg >= 0),
    selling_price_per_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (selling_price_per_kg >= 0),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_partner_item_date UNIQUE (partner_id, item_name, effective_date)
);

-- 13. PICKUP REQUESTS (Header Penjemputan)
CREATE TABLE IF NOT EXISTS public.pickup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    address_id UUID NOT NULL REFERENCES public.user_addresses(id),
    scheduled_date DATE NOT NULL,
    time_slot TEXT NOT NULL DEFAULT '08:00 - 12:00',
    notes TEXT,
    status pickup_status NOT NULL DEFAULT 'pending',
    total_estimated_kg NUMERIC(8, 2) DEFAULT 0.00,
    total_verified_kg NUMERIC(8, 2) DEFAULT 0.00,
    partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pickup_requests_user ON public.pickup_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_status ON public.pickup_requests(status);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_date ON public.pickup_requests(scheduled_date);

-- 14. PICKUP ITEMS (Multi-Item per Penjemputan)
CREATE TABLE IF NOT EXISTS public.pickup_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pickup_id UUID NOT NULL REFERENCES public.pickup_requests(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.waste_categories(id),
    classification_id UUID REFERENCES public.waste_classifications(id) ON DELETE SET NULL,
    estimated_kg NUMERIC(6, 2) DEFAULT 0.00,
    item_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pickup_items_pickup_id ON public.pickup_items(pickup_id);

-- 15. PICKUP ASSIGNMENTS (Penugasan Petugas)
CREATE TABLE IF NOT EXISTS public.pickup_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pickup_id UUID NOT NULL REFERENCES public.pickup_requests(id) ON DELETE CASCADE,
    officer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status assignment_status NOT NULL DEFAULT 'assigned',
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_pickup_assignments_officer ON public.pickup_assignments(officer_id);

-- 16. PICKUP VERIFICATIONS (Verifikasi Lapangan)
CREATE TABLE IF NOT EXISTS public.pickup_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pickup_id UUID UNIQUE NOT NULL REFERENCES public.pickup_requests(id) ON DELETE CASCADE,
    verified_by_officer_id UUID NOT NULL REFERENCES public.profiles(id),
    total_scale_kg NUMERIC(8, 2) NOT NULL CHECK (total_scale_kg > 0),
    scale_photo_url TEXT NOT NULL,
    qr_code_token TEXT UNIQUE,
    qr_scanned_at TIMESTAMPTZ,
    officer_notes TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. WASTE RECORDS (Rincian Bobot Aktual Resmi)
CREATE TABLE IF NOT EXISTS public.waste_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id UUID NOT NULL REFERENCES public.pickup_verifications(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.waste_categories(id),
    actual_weight_kg NUMERIC(8, 2) NOT NULL CHECK (actual_weight_kg > 0),
    points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
    economic_value_idr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waste_records_category ON public.waste_records(category_id);

-- 18. WASTE PHOTOS (Multi-Foto Bukti)
CREATE TABLE IF NOT EXISTS public.waste_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pickup_id UUID REFERENCES public.pickup_requests(id) ON DELETE CASCADE,
    verification_id UUID REFERENCES public.pickup_verifications(id) ON DELETE CASCADE,
    photo_type TEXT NOT NULL, -- 'initial_waste', 'scale_display', 'waste_pile', 'signed_manifest'
    storage_path TEXT NOT NULL,
    caption TEXT,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. REWARDS (Katalog Hadiah / Voucher)
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    reward_type reward_type NOT NULL,
    partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
    points_required INTEGER NOT NULL CHECK (points_required > 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    valid_until DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. REWARD REDEMPTIONS (Klaim Voucher)
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    redemption_code TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
    points_spent INTEGER NOT NULL CHECK (points_spent > 0),
    status redemption_status NOT NULL DEFAULT 'issued',
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. REWARD TRANSACTIONS (LEDGER AUDITABLE - ANTI DUPLICATE)
CREATE TABLE IF NOT EXISTS public.reward_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_type point_transaction_type NOT NULL,
    points_amount INTEGER NOT NULL, -- Positif untuk earn, Negatif untuk redeem
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    reference_id UUID,
    reference_type TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Constraint krusial: mencegah poin ganda untuk transaksi yang sama
    CONSTRAINT uq_point_ledger_reference UNIQUE (reference_type, reference_id, transaction_type)
);

CREATE INDEX IF NOT EXISTS idx_reward_transactions_user ON public.reward_transactions(user_id);

-- 22. PROCESSING BATCHES (Sirkular Ekonomi - Pengelompokan Pengolahan)
CREATE TABLE IF NOT EXISTS public.processing_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number TEXT UNIQUE NOT NULL,
    category_id UUID NOT NULL REFERENCES public.waste_categories(id),
    total_input_kg NUMERIC(10, 2) NOT NULL CHECK (total_input_kg > 0),
    destination_partner_id UUID REFERENCES public.partners(id),
    processing_method TEXT NOT NULL,
    status batch_status NOT NULL DEFAULT 'created',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ
);

-- 23. PROCESSING OUTPUTS (Produk Turunan Sirkular Ekonomi)
CREATE TABLE IF NOT EXISTS public.processing_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.processing_batches(id) ON DELETE CASCADE,
    output_product_name TEXT NOT NULL,
    output_kg NUMERIC(10, 2) NOT NULL CHECK (output_kg >= 0),
    efficiency_rate_pct NUMERIC(5, 2),
    economic_value_idr NUMERIC(14, 2) DEFAULT 0.00,
    produced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 24. PARTNER RECEIPTS (Manifest Serah Terima Mitra)
CREATE TABLE IF NOT EXISTS public.partner_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT UNIQUE NOT NULL,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE RESTRICT,
    batch_id UUID REFERENCES public.processing_batches(id) ON DELETE SET NULL,
    handed_over_by UUID NOT NULL REFERENCES public.profiles(id),
    received_by_partner_name TEXT NOT NULL,
    total_kg NUMERIC(10, 2) NOT NULL CHECK (total_kg > 0),
    total_payment_idr NUMERIC(14, 2) DEFAULT 0.00,
    receipt_photo_url TEXT,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 25. NOTIFICATIONS (Notifikasi Realtime)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL,
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read);

-- 26. AUDIT LOGS (Immutable Append-Only Audit Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role TEXT,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_table, target_id);

