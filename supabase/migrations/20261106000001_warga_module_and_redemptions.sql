-- ====================================================================
-- WasteWise Warga Module, Customer QR Token, & Atomic Reward Redemption
-- Version: 20261106000001
-- Target: Supabase PostgreSQL 15+
-- Description: Menambahkan token QR nasabah publik (non-UUID),
--              katalog reward resmi, perizinan tabel untuk penegakan RLS,
--              dan PostgreSQL RPC atomik penukaran reward (redeem_reward_atomic).
-- ====================================================================

-- 1. TAMBAH KOLOM CUSTOMER QR TOKEN PADA PROFILES (NON-UUID PRIVASI)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS customer_qr_token TEXT UNIQUE;

-- Backfill token untuk profil yang belum memiliki customer_qr_token
UPDATE public.profiles
SET customer_qr_token = 'WW-NSB-' || upper(substr(md5(random()::text || id::text), 1, 10))
WHERE customer_qr_token IS NULL;

-- Perbarui handle_new_user() agar otomatis mengenerate customer_qr_token unik
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, status, points_balance, customer_qr_token)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'User'), '@', 1)),
        'warga',
        'active',
        0,
        'WW-NSB-' || upper(substr(md5(random()::text || NEW.id::text), 1, 10))
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        customer_qr_token = COALESCE(public.profiles.customer_qr_token, 'WW-NSB-' || upper(substr(md5(random()::text || NEW.id::text), 1, 10)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. SEED MASTER KATALOG REWARD RESMI (JIKA MASIH KOSONG)
INSERT INTO public.rewards (title, description, reward_type, points_required, stock_quantity, is_active)
SELECT 'Voucher Belanja Sembako Rp 25.000', 'Voucher belanja sembako dapat ditukarkan di jaringan toko kelontong & warung mitra Bank Sampah binaan.', 'voucher_belanja', 500, 50, true
WHERE NOT EXISTS (SELECT 1 FROM public.rewards WHERE title = 'Voucher Belanja Sembako Rp 25.000');

INSERT INTO public.rewards (title, description, reward_type, points_required, stock_quantity, is_active)
SELECT 'Token Listrik PLN Prabayar Rp 20.000', 'Kode voucher 20 digit listrik pintar PLN prabayar yang dikirimkan langsung ke kontak terdaftar.', 'voucher_belanja', 450, 40, true
WHERE NOT EXISTS (SELECT 1 FROM public.rewards WHERE title = 'Token Listrik PLN Prabayar Rp 20.000');

INSERT INTO public.rewards (title, description, reward_type, points_required, stock_quantity, is_active)
SELECT 'Donasi Penanaman 1 Bibit Pohon', 'Penyaluran donasi aksi penghijauan dan konservasi daerah aliran sungai (DAS) melalui program Bank Sampah Hijau.', 'donasi_pohon', 250, 100, true
WHERE NOT EXISTS (SELECT 1 FROM public.rewards WHERE title = 'Donasi Penanaman 1 Bibit Pohon');

INSERT INTO public.rewards (title, description, reward_type, points_required, stock_quantity, is_active)
SELECT 'Potongan Iuran Kebersihan RT / RW', 'Keringanan retribusi iuran pembuangan sampah residu bulanan untuk lingkungan permukiman Anda.', 'diskon_jasa', 200, 75, true
WHERE NOT EXISTS (SELECT 1 FROM public.rewards WHERE title = 'Potongan Iuran Kebersihan RT / RW');

-- 3. PERIZINAN TABEL POSTGRESQL UNTUK EVALUASI RLS SUPABASE
-- Catatan: RLS hanya dapat dievaluasi jika authenticated role memiliki izin DML tabel dasar.
-- Hak akses pembatasan baris tetap dikendalikan 100% oleh RLS policies yang sudah aktif.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- Hak baca anonim terbatas hanya untuk katalog publik (waste_categories, system_settings, rewards)
GRANT SELECT ON public.waste_categories TO anon;
GRANT SELECT ON public.system_settings TO anon;
GRANT SELECT ON public.rewards TO anon;

-- 4. RPC ATOMIK PENUKARAN REWARD (TRANSACTIONAL, SAFE, ANTI-DUPLICATE)
CREATE OR REPLACE FUNCTION public.redeem_reward_atomic(
    p_reward_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
    v_reward RECORD;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_redemption_id UUID;
    v_redemption_code TEXT;
    v_caller_role user_role;
BEGIN
    -- 1. Validasi Autentikasi Pengguna
    IF auth.uid() IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Pengguna belum terautentikasi (Sesi tidak valid).'
        );
    END IF;

    -- Pengguna hanya boleh menukar reward untuk dirinya sendiri, kecuali admin/super_admin
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF auth.uid() != p_user_id AND v_caller_role NOT IN ('admin', 'super_admin') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Akses ditolak: Tidak dapat menukarkan reward atas nama pengguna lain.'
        );
    END IF;

    -- 2. Kunci dan Validasi Data Reward (FOR UPDATE mencegah race condition stok)
    SELECT * INTO v_reward
    FROM public.rewards
    WHERE id = p_reward_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Reward tidak ditemukan dalam sistem.'
        );
    END IF;

    IF v_reward.is_active = false THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Reward ini sedang tidak aktif.'
        );
    END IF;

    IF v_reward.stock_quantity <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Stok reward telah habis. Silakan pilih reward lainnya.'
        );
    END IF;

    -- 3. Kunci dan Validasi Saldo Warga (FOR UPDATE mencegah race condition saldo)
    SELECT points_balance INTO v_current_balance
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Profil nasabah tidak ditemukan.'
        );
    END IF;

    IF v_current_balance < v_reward.points_required THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Saldo poin tidak mencukupi. Diperlukan ' || v_reward.points_required || ' poin (Saldo Anda: ' || v_current_balance || ' poin).'
        );
    END IF;

    -- 4. Hitung Saldo Baru
    v_new_balance := v_current_balance - v_reward.points_required;
    v_redemption_code := 'RDM-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

    -- 5. Catat ke Tabel public.reward_redemptions
    INSERT INTO public.reward_redemptions (
        redemption_code,
        user_id,
        reward_id,
        points_spent,
        status,
        claimed_at
    ) VALUES (
        v_redemption_code,
        p_user_id,
        p_reward_id,
        v_reward.points_required,
        'issued',
        now()
    )
    RETURNING id INTO v_redemption_id;

    -- 6. Catat ke Ledger public.reward_transactions (Immutable & Auditable)
    INSERT INTO public.reward_transactions (
        user_id,
        transaction_type,
        points_amount,
        balance_after,
        reference_id,
        reference_type,
        description
    ) VALUES (
        p_user_id,
        'redeem_reward',
        -v_reward.points_required,
        v_new_balance,
        v_redemption_id,
        'reward_redemptions',
        'Penukaran reward: ' || v_reward.title || ' (Kode: ' || v_redemption_code || ')'
    );

    -- 7. Mutasi Saldo di Tabel public.profiles
    UPDATE public.profiles
    SET points_balance = v_new_balance,
        updated_at = now()
    WHERE id = p_user_id;

    -- 8. Kurangi Stok Reward
    UPDATE public.rewards
    SET stock_quantity = stock_quantity - 1
    WHERE id = p_reward_id;

    -- 9. Catat ke Audit Logs
    INSERT INTO public.audit_logs (
        actor_id,
        actor_role,
        action,
        target_table,
        target_id,
        new_values
    ) VALUES (
        auth.uid(),
        v_caller_role::text,
        'REWARD_REDEEM',
        'reward_redemptions',
        v_redemption_id::text,
        jsonb_build_object(
            'redemption_code', v_redemption_code,
            'reward_id', p_reward_id,
            'reward_title', v_reward.title,
            'points_spent', v_reward.points_required,
            'remaining_balance', v_new_balance
        )
    );

    -- 10. Kembalikan Respons Sukses Lengkap
    RETURN jsonb_build_object(
        'success', true,
        'redemption_id', v_redemption_id,
        'redemption_code', v_redemption_code,
        'reward_title', v_reward.title,
        'points_spent', v_reward.points_required,
        'remaining_balance', v_new_balance,
        'message', 'Selamat! Penukaran reward berhasil diproses.'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Terjadi kesalahan sistem saat penukaran: ' || SQLERRM
    );
END;
$$;

-- 5. BATASI HAK AKSES EKSEKUSI RPC
REVOKE ALL ON FUNCTION public.redeem_reward_atomic(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_reward_atomic(UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.redeem_reward_atomic(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_reward_atomic(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.redeem_reward_atomic(UUID, UUID) TO postgres;

-- 6. REFRESH CACHE POSTGREST
NOTIFY pgrst, 'reload schema';

