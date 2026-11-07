-- ====================================================================
-- WasteWise AI Smart Sorting, Hierarchical Subcategories & Officer Corrections
-- Version: 20261106000002
-- Target: Supabase PostgreSQL 15+
-- Author: Tim Pengembang WasteWise - UNS Innovation Hackathon 2026
-- Description:
--   1. Menambahkan tabel subkategori bertingkat untuk circular raw materials
--   2. Memperluas tabel waste_classifications dengan kolom verifikasi & koreksi fisik petugas
--   3. Menyelaraskan kebijakan RLS agar warga hanya mengakses data miliknya,
--      sementara petugas dan admin dapat memantau dan memverifikasi
--   4. Menyediakan RPC atomik correct_ai_classification berstandar SECURITY DEFINER
-- ====================================================================

-- 1. TABEL MASTER SUBKATEGORI SAMPAH BERTINGKAT (CIRCULAR RAW MATERIALS)
CREATE TABLE IF NOT EXISTS public.waste_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.waste_categories(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    potential_processing_method TEXT NOT NULL,
    typical_economic_value_per_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waste_subcategories_cat ON public.waste_subcategories(category_id);

-- Hak akses tabel dasar (Least Privilege DML)
GRANT SELECT ON public.waste_subcategories TO anon, authenticated;
GRANT ALL ON public.waste_subcategories TO authenticated, service_role;

-- Aktifkan RLS
ALTER TABLE public.waste_subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can view active subcategories" ON public.waste_subcategories;
CREATE POLICY "Anyone authenticated can view active subcategories"
ON public.waste_subcategories FOR SELECT
TO authenticated
USING (is_active = true OR public.is_admin_or_super());

DROP POLICY IF EXISTS "Public anon view active subcategories" ON public.waste_subcategories;
CREATE POLICY "Public anon view active subcategories"
ON public.waste_subcategories FOR SELECT
TO anon
USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage subcategories" ON public.waste_subcategories;
CREATE POLICY "Admins manage subcategories"
ON public.waste_subcategories FOR ALL
TO authenticated
USING (public.is_admin_or_super())
WITH CHECK (public.is_admin_or_super());

-- 2. SEED SUBKATEGORI BERTINGKAT SESUAI SUBTEMA B HACKATHON UNS 2026
-- 2.1 Subkategori Organik (Parent: ORG)
INSERT INTO public.waste_subcategories (category_id, code, name, description, potential_processing_method, typical_economic_value_per_kg)
SELECT id, 'ORG-FOOD', 'Sisa Makanan & Sayuran', 'Sisa konsumsi organik basah dari rumah tangga, katering, dan pasar', 'Biokonversi Larva Maggot BSF & Pupuk Organik Cair', 500.00
FROM public.waste_categories WHERE code = 'ORG'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.waste_subcategories (category_id, code, name, description, potential_processing_method, typical_economic_value_per_kg)
SELECT id, 'ORG-LEAF', 'Dedaunan & Pangkasan Ranting', 'Sampah organik kering dari pekarangan, taman, dan pemangkasan pohon', 'Pengomposan Aerobik & Briket Biomassa Terkarbonisasi', 300.00
FROM public.waste_categories WHERE code = 'ORG'
ON CONFLICT (code) DO NOTHING;

-- 2.2 Subkategori Anorganik (Parent: ANORG)
INSERT INTO public.waste_subcategories (category_id, code, name, description, potential_processing_method, typical_economic_value_per_kg)
SELECT id, 'ANORG-PET', 'Botol Plastik PET Bening/Warna', 'Botol plastik air mineral dan minuman berbahan Polyethylene Terephthalate', 'Pencacahan Flakes Bersih & Daur Ulang Serat Tekstil Poliester', 3500.00
FROM public.waste_categories WHERE code = 'ANORG'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.waste_subcategories (category_id, code, name, description, potential_processing_method, typical_economic_value_per_kg)
SELECT id, 'ANORG-HDPE', 'Plastik Keras HDPE', 'Botol sampo, jeriken sabun, botol susu, dan tutup galon (High Density Polyethylene)', 'Pencacahan & Pembuatan Pelet/Biji Plastik Injeksi', 4000.00
FROM public.waste_categories WHERE code = 'ANORG'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.waste_subcategories (category_id, code, name, description, potential_processing_method, typical_economic_value_per_kg)
SELECT id, 'ANORG-PLAS', 'Plastik Fleksibel & Lainnya', 'Kantong kresek, plastik sachet multilayer, kemasan snack campur', 'Bahan Baku Refuse Derived Fuel (RDF) & Bahan Campuran Paving Block', 800.00
FROM public.waste_categories WHERE code = 'ANORG'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.waste_subcategories (category_id, code, name, description, potential_processing_method, typical_economic_value_per_kg)
SELECT id, 'ANORG-KRD', 'Kardus & Karton Cokelat', 'Kardus kemasan box, karton gelombang bersih dan kering', 'Daur Ulang Pulp Kertas Kemasan Industri (Paper Mill)', 2200.00
FROM public.waste_categories WHERE code = 'ANORG'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.waste_subcategories (category_id, code, name, description, potential_processing_method, typical_economic_value_per_kg)
SELECT id, 'ANORG-KRT', 'Kertas Putih & Arsip HVS', 'Kertas arsip kantor, buku tulis bekas, dan koran tidak berminyak', 'Daur Ulang Kertas Cetak Tisu & Kertas Koran Baru', 2800.00
FROM public.waste_categories WHERE code = 'ANORG'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.waste_subcategories (category_id, code, name, description, potential_processing_method, typical_economic_value_per_kg)
SELECT id, 'ANORG-MET', 'Logam & Kaleng Aluminium', 'Kaleng minuman aluminium, seng, besi, dan panci bekas', 'Peleburan Ulang Logam Batangan (Smelting & Foundry)', 12000.00
FROM public.waste_categories WHERE code = 'ANORG'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.waste_subcategories (category_id, code, name, description, potential_processing_method, typical_economic_value_per_kg)
SELECT id, 'ANORG-GLS', 'Kaca & Botol Beling', 'Botol sirup, toples kaca, dan pecahan beling transparan/gelap', 'Peleburan Ulang Cullet Kaca & Agregat Konstruksi Ramah Lingkungan', 600.00
FROM public.waste_categories WHERE code = 'ANORG'
ON CONFLICT (code) DO NOTHING;

-- 2.3 Subkategori B3 (Parent: B3)
INSERT INTO public.waste_subcategories (category_id, code, name, description, potential_processing_method, typical_economic_value_per_kg)
SELECT id, 'B3-BAT', 'Baterai Bekas & Akumulator', 'Baterai kering primer/sekunder AA/AAA, baterai litium handphone, aki kecil', 'Karantina Khusus & Ekstraksi Logam Berat Pengolah Berizin KLHK', 0.00
FROM public.waste_categories WHERE code = 'B3'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.waste_subcategories (category_id, code, name, description, potential_processing_method, typical_economic_value_per_kg)
SELECT id, 'B3-LMP', 'Lampu TL & Bohlam Neon', 'Lampu neon panjang TL, lampu hemat energi CFL berpotensi uap merkuri', 'Karantina Limbah Beracun & Dekontaminasi Fosfor Merkuri', 0.00
FROM public.waste_categories WHERE code = 'B3'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.waste_subcategories (category_id, code, name, description, potential_processing_method, typical_economic_value_per_kg)
SELECT id, 'B3-OTH', 'Limbah B3 Rumah Tangga Lainnya', 'Botol racun serangga aerosol, kaleng cat, botol pemutih kimia korosif', 'Penyimpanan Sementara Berbahaya & Insinerasi Termal Suhu Tinggi', 0.00
FROM public.waste_categories WHERE code = 'B3'
ON CONFLICT (code) DO NOTHING;

-- 3. PERLUAS KOLOM VERIFIKASI & KOREKSI PETUGAS PADA WASTE_CLASSIFICATIONS
ALTER TABLE public.waste_classifications
ADD COLUMN IF NOT EXISTS is_verified_by_officer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_corrected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS corrected_category_id UUID REFERENCES public.waste_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS selected_subcategory_id UUID REFERENCES public.waste_subcategories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS officer_correction_notes TEXT,
ADD COLUMN IF NOT EXISTS ground_truth_label TEXT;

-- Index untuk filter performa analitik perbandingan AI vs Manusia
CREATE INDEX IF NOT EXISTS idx_classifications_verified ON public.waste_classifications(is_verified_by_officer);
CREATE INDEX IF NOT EXISTS idx_classifications_corrected ON public.waste_classifications(is_corrected);
CREATE INDEX IF NOT EXISTS idx_classifications_subcat ON public.waste_classifications(selected_subcategory_id);

-- DML grants untuk waste_classifications
GRANT SELECT, INSERT, UPDATE ON public.waste_classifications TO authenticated;
GRANT SELECT ON public.waste_classifications TO anon;

-- 4. KEBIJAKAN RLS UNTUK MEMASTIKAN ISOLASI DATA SESUAI PERAN (LEAST PRIVILEGE)
-- 4.1 Warga hanya membaca klasifikasinya sendiri; Petugas & Admin dapat membaca untuk verifikasi operasional
DROP POLICY IF EXISTS "Users view own classifications" ON public.waste_classifications;
DROP POLICY IF EXISTS "Users and officers view classifications" ON public.waste_classifications;
CREATE POLICY "Users and officers view classifications"
ON public.waste_classifications FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    OR public.is_officer()
    OR public.is_admin_or_super()
);

-- 4.2 Petugas dan Admin berhak memperbarui verifikasi fisik
DROP POLICY IF EXISTS "Officers can update verification on classifications" ON public.waste_classifications;
CREATE POLICY "Officers can update verification on classifications"
ON public.waste_classifications FOR UPDATE
TO authenticated
USING (public.is_officer() OR public.is_admin_or_super())
WITH CHECK (public.is_officer() OR public.is_admin_or_super());

-- 5. RPC ATOMIK KOREKSI HASIL AI OLEH PETUGAS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.correct_ai_classification(
    p_classification_id UUID,
    p_officer_id UUID,
    p_confirmed_category_id UUID,
    p_selected_subcategory_id UUID,
    p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
    v_class RECORD;
    v_is_corrected BOOLEAN := false;
    v_officer_role user_role;
BEGIN
    -- Validasi pemanggil RPC
    IF auth.uid() IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sesi autentikasi tidak valid.');
    END IF;

    SELECT role INTO v_officer_role FROM public.profiles WHERE id = auth.uid();
    IF v_officer_role NOT IN ('petugas', 'admin', 'super_admin') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Akses ditolak: Hanya petugas atau administrator yang berhak mengoreksi klasifikasi sampah.');
    END IF;

    -- Ambil data klasifikasi awal
    SELECT * INTO v_class
    FROM public.waste_classifications
    WHERE id = p_classification_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Data klasifikasi AI tidak ditemukan.');
    END IF;

    -- Tentukan apakah petugas mengoreksi hasil prediksi awal model AI
    IF p_confirmed_category_id IS NOT NULL AND p_confirmed_category_id != v_class.predicted_category_id THEN
        v_is_corrected := true;
    ELSE
        v_is_corrected := false;
    END IF;

    -- Update catatan klasifikasi
    UPDATE public.waste_classifications
    SET is_verified_by_officer = true,
        verified_by_officer_id = p_officer_id,
        verified_at = now(),
        is_corrected = v_is_corrected,
        corrected_category_id = CASE WHEN v_is_corrected THEN p_confirmed_category_id ELSE NULL END,
        selected_subcategory_id = p_selected_subcategory_id,
        officer_correction_notes = p_notes
    WHERE id = p_classification_id;

    -- Catat ke audit logs
    INSERT INTO public.audit_logs (
        actor_id,
        actor_role,
        action,
        target_table,
        target_id,
        new_values
    ) VALUES (
        p_officer_id,
        v_officer_role::text,
        'AI_CORRECTION_VERIFIED',
        'waste_classifications',
        p_classification_id::text,
        jsonb_build_object(
            'initial_predicted_category_id', v_class.predicted_category_id,
            'confirmed_category_id', p_confirmed_category_id,
            'is_corrected', v_is_corrected,
            'selected_subcategory_id', p_selected_subcategory_id,
            'notes', p_notes
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'classification_id', p_classification_id,
        'is_corrected', v_is_corrected,
        'message', 'Pemeriksaan fisik petugas berhasil direkam.'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gagal memproses verifikasi: ' || SQLERRM);
END;
$$;

-- 6. PERIZINAN EKSEKUSI RPC
REVOKE ALL ON FUNCTION public.correct_ai_classification(UUID, UUID, UUID, UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.correct_ai_classification(UUID, UUID, UUID, UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.correct_ai_classification(UUID, UUID, UUID, UUID, TEXT) TO authenticated, service_role, postgres;

-- 7. REFRESH SCHEMA CACHE POSTGREST
NOTIFY pgrst, 'reload schema';
