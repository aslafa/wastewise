-- ====================================================================
-- WasteWise Administrative Operational Data Audit RPC
-- Version: 20261106000000
-- Target: Supabase PostgreSQL 15+
-- Description: Fungsi aman untuk mengaudit keterkaitan data operasional
--              pengguna pada 13 tabel secara atomik (SECURITY DEFINER).
--
-- 13 TABEL YANG DIAUDIT:
-- 1. profiles              (id)
-- 2. pickup_requests       (user_id)
-- 3. pickup_assignments    (officer_id, assigned_by)
-- 4. pickup_verifications  (verified_by_officer_id)
-- 5. waste_records         (verification_id)
-- 6. waste_classifications (user_id)
-- 7. waste_photos          (uploaded_by)
-- 8. reward_transactions   (user_id)
-- 9. reward_redemptions    (user_id)
-- 10. user_addresses       (user_id)
-- 11. staff_assignments    (officer_id)
-- 12. notifications        (recipient_id)
-- 13. audit_logs           (actor_id)
--
-- KEAMANAN:
-- - SET search_path = public, pg_temp (mencegah search_path hijacking)
-- - Hanya mengembalikan hitungan agregat (COUNT) dan status keamanan
-- - Tidak mengekspos isi konten data pribadi pengguna
-- - Akses dicabut dari PUBLIC, anon, dan authenticated
-- - Hanya dapat dieksekusi oleh service_role dan postgres (CLI / Auth Admin)
-- - Termasuk NOTIFY pgrst, 'reload schema' untuk memuat schema cache seketika
-- ====================================================================

-- 1. FUNGSI UTAMA: Menerima Parameter p_user_id UUID
CREATE OR REPLACE FUNCTION public.audit_user_operational_data(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
    v_profiles_count INTEGER := 0;
    v_pickup_requests_count INTEGER := 0;
    v_pickup_assignments_count INTEGER := 0;
    v_pickup_verifications_count INTEGER := 0;
    v_waste_records_count INTEGER := 0;
    v_waste_classifications_count INTEGER := 0;
    v_waste_photos_count INTEGER := 0;
    v_reward_transactions_count INTEGER := 0;
    v_reward_redemptions_count INTEGER := 0;
    v_user_addresses_count INTEGER := 0;
    v_staff_assignments_count INTEGER := 0;
    v_notifications_count INTEGER := 0;
    v_audit_logs_count INTEGER := 0;
    v_has_critical_data BOOLEAN := false;
    v_is_safe_to_delete BOOLEAN := false;
    v_status_message TEXT := '';
BEGIN
    -- Validasi Input
    IF p_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Parameter p_user_id tidak boleh NULL.'
        );
    END IF;

    -- 1. Profil Pengguna (profiles via id)
    SELECT COUNT(*) INTO v_profiles_count 
    FROM public.profiles 
    WHERE id = p_user_id;

    -- 2. Permintaan Penjemputan (pickup_requests via user_id)
    SELECT COUNT(*) INTO v_pickup_requests_count 
    FROM public.pickup_requests 
    WHERE user_id = p_user_id;

    -- 3. Penugasan Petugas Lapangan (pickup_assignments via officer_id / assigned_by)
    SELECT COUNT(*) INTO v_pickup_assignments_count 
    FROM public.pickup_assignments 
    WHERE officer_id = p_user_id OR assigned_by = p_user_id;

    -- 4. Verifikasi Petugas Lapangan (pickup_verifications via verified_by_officer_id)
    SELECT COUNT(*) INTO v_pickup_verifications_count 
    FROM public.pickup_verifications 
    WHERE verified_by_officer_id = p_user_id;

    -- 5. Rekaman Bobot Sampah (waste_records via verification_id)
    SELECT COUNT(*) INTO v_waste_records_count 
    FROM public.waste_records 
    WHERE verification_id IN (
        SELECT id FROM public.pickup_verifications WHERE verified_by_officer_id = p_user_id
        UNION
        SELECT pv.id FROM public.pickup_verifications pv 
        JOIN public.pickup_requests pr ON pr.id = pv.pickup_id 
        WHERE pr.user_id = p_user_id
    );

    -- 6. Klasifikasi AI (waste_classifications via user_id)
    SELECT COUNT(*) INTO v_waste_classifications_count 
    FROM public.waste_classifications 
    WHERE user_id = p_user_id;

    -- 7. Bukti Foto Sampah (waste_photos via uploaded_by)
    SELECT COUNT(*) INTO v_waste_photos_count 
    FROM public.waste_photos 
    WHERE uploaded_by = p_user_id;

    -- 8. Buku Kas Transaksi Poin (reward_transactions via user_id)
    SELECT COUNT(*) INTO v_reward_transactions_count 
    FROM public.reward_transactions 
    WHERE user_id = p_user_id;

    -- 9. Penukaran Hadiah (reward_redemptions via user_id)
    SELECT COUNT(*) INTO v_reward_redemptions_count 
    FROM public.reward_redemptions 
    WHERE user_id = p_user_id;

    -- 10. Alamat Pengguna (user_addresses via user_id)
    SELECT COUNT(*) INTO v_user_addresses_count 
    FROM public.user_addresses 
    WHERE user_id = p_user_id;

    -- 11. Penugasan Wilayah & Armada Staf (staff_assignments via officer_id)
    SELECT COUNT(*) INTO v_staff_assignments_count 
    FROM public.staff_assignments 
    WHERE officer_id = p_user_id;

    -- 12. Notifikasi Pengguna (notifications via recipient_id)
    SELECT COUNT(*) INTO v_notifications_count 
    FROM public.notifications 
    WHERE recipient_id = p_user_id;

    -- 13. Rekam Jejak Audit Log (audit_logs via actor_id)
    SELECT COUNT(*) INTO v_audit_logs_count 
    FROM public.audit_logs 
    WHERE actor_id = p_user_id;

    -- 14. Evaluasi Keterkaitan Operasional Kritis
    -- Data kritis adalah transaksi penjemputan, penugasan, verifikasi, rekaman timbangan, atau mutasi poin
    IF v_pickup_requests_count > 0 OR 
       v_pickup_assignments_count > 0 OR 
       v_pickup_verifications_count > 0 OR 
       v_waste_records_count > 0 OR 
       v_reward_transactions_count > 0 OR 
       v_reward_redemptions_count > 0 THEN
        v_has_critical_data := true;
        v_is_safe_to_delete := false;
        v_status_message := 'MEMILIKI DATA PENTING: Pengguna memiliki riwayat transaksi penjemputan atau poin aktif.';
    ELSE
        v_has_critical_data := false;
        v_is_safe_to_delete := true;
        v_status_message := 'AMAN DIHAPUS: Pengguna bebas dari riwayat transaksi operasional penting.';
    END IF;

    -- Mengembalikan ringkasan data agregat aman
    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'profiles_count', v_profiles_count,
        'pickup_requests_count', v_pickup_requests_count,
        'pickup_assignments_count', v_pickup_assignments_count,
        'pickup_verifications_count', v_pickup_verifications_count,
        'waste_records_count', v_waste_records_count,
        'waste_classifications_count', v_waste_classifications_count,
        'waste_photos_count', v_waste_photos_count,
        'reward_transactions_count', v_reward_transactions_count,
        'reward_redemptions_count', v_reward_redemptions_count,
        'user_addresses_count', v_user_addresses_count,
        'staff_assignments_count', v_staff_assignments_count,
        'notifications_count', v_notifications_count,
        'audit_logs_count', v_audit_logs_count,
        'has_critical_data', v_has_critical_data,
        'is_safe_to_delete', v_is_safe_to_delete,
        'status_message', v_status_message
    );
END;
$$;

-- 2. OVERLOAD: Menerima Parameter p_user_id TEXT (Menghindari Type-Mismatch di PostgREST Schema Cache)
CREATE OR REPLACE FUNCTION public.audit_user_operational_data(p_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
    RETURN public.audit_user_operational_data(p_user_id::UUID);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Format UUID tidak valid: ' || SQLERRM
    );
END;
$$;

-- ====================================================================
-- 3. BATASI HAK AKSES EKSEKUSI SECARA KETAT
-- ====================================================================
REVOKE ALL ON FUNCTION public.audit_user_operational_data(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.audit_user_operational_data(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.audit_user_operational_data(UUID) FROM authenticated;

REVOKE ALL ON FUNCTION public.audit_user_operational_data(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.audit_user_operational_data(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.audit_user_operational_data(TEXT) FROM authenticated;

-- Berikan izin HANYA kepada service_role dan postgres (CLI / Auth Admin)
GRANT EXECUTE ON FUNCTION public.audit_user_operational_data(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.audit_user_operational_data(UUID) TO postgres;

GRANT EXECUTE ON FUNCTION public.audit_user_operational_data(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.audit_user_operational_data(TEXT) TO postgres;

-- ====================================================================
-- 4. SEGARKAN SCHEMA CACHE POSTGREST
-- ====================================================================
NOTIFY pgrst, 'reload schema';
