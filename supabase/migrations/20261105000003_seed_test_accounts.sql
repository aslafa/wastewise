-- ====================================================================
-- WasteWise System Test Accounts Seed Migration (Production Ready)
-- Version: 20261105000003
-- Target: Supabase PostgreSQL 15+
-- Description: Akun Pengujian Resmi untuk 5 Role Sistem WasteWise
-- Password Seluruh Akun: WasteWise123
-- Ketentuan Khusus:
-- 1. Tidak memasukkan data operasional / mitra / alamat fiktif
-- 2. Saldo awal warga bernilai 0 poin
-- 3. Akun lama tidak dihapus dan kata sandinya tidak diubah
-- 4. Kolom auth.identities.id bertipe UUID
-- 5. Tabel public.audit_logs menggunakan nama kolom aktual:
--    actor_id, actor_role, action, target_table, target_id, new_values
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. PENYESUAIAN TRIGGER PROFILES AGAR MENGIZINKAN SEEDING ADMINISTRATIF
-- Trigger tetap aktif dan mencegah user biasa memodifikasi role dari client API (auth.uid() IS NOT NULL)
CREATE OR REPLACE FUNCTION public.prevent_profile_tampering()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika dipanggil melalui API klien berautentikasi (auth.uid() is not null)
    -- dan bukan role admin / super_admin, tolak modifikasi role
    IF (OLD.role IS DISTINCT FROM NEW.role) AND auth.uid() IS NOT NULL AND NOT public.is_admin_or_super() THEN
        RAISE EXCEPTION 'Akses Ditolak: Pengguna tidak diizinkan mengubah role akun.';
    END IF;

    -- Cegah modifikasi langsung saldo poin dari client
    IF (OLD.points_balance IS DISTINCT FROM NEW.points_balance) AND auth.uid() IS NOT NULL AND NOT public.is_admin_or_super() THEN
        IF pg_trigger_depth() <= 1 THEN
            RAISE EXCEPTION 'Akses Ditolak: Saldo poin hanya dapat diubah melalui sistem transaksi ledger resmi.';
        END IF;
    END IF;

    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. PEMBUATAN AKUN AUTHENTICATION & PROFIL 5 ROLE
DO $$
DECLARE
    v_encrypted_pw TEXT;
    v_warga_id UUID := 'a0000000-0000-0000-0000-000000000001';
    v_petugas_id UUID := 'a0000000-0000-0000-0000-000000000002';
    v_mitra_id UUID := 'a0000000-0000-0000-0000-000000000003';
    v_admin_id UUID := 'a0000000-0000-0000-0000-000000000004';
    v_superadmin_id UUID := 'a0000000-0000-0000-0000-000000000005';
BEGIN
    -- Hash kata sandi baku: WasteWise123
    v_encrypted_pw := crypt('WasteWise123', gen_salt('bf', 10));

    -- =================================================================
    -- ROLE 1: WARGA (warga@wastewise.id)
    -- =================================================================
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'warga@wastewise.id') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token,
            email_change_token_new, email_change
        ) VALUES (
            v_warga_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated',
            'warga@wastewise.id', v_encrypted_pw, now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Siti Rahmawati (Warga)"}'::jsonb,
            now(), now(), '', '', '', ''
        );

        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
        ) VALUES (
            v_warga_id, v_warga_id,
            jsonb_build_object('sub', v_warga_id::text, 'email', 'warga@wastewise.id'),
            'email', 'warga@wastewise.id', now(), now(), now()
        ) ON CONFLICT DO NOTHING;
    ELSE
        -- Akun lama tidak dihapus dan kata sandi tidak diubah
        SELECT id INTO v_warga_id FROM auth.users WHERE email = 'warga@wastewise.id';
        UPDATE auth.users 
        SET email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE id = v_warga_id;
    END IF;

    -- Upsert Profil Warga: Saldo 0 poin, tanpa data fiktif
    INSERT INTO public.profiles (id, email, full_name, role, phone, points_balance, partner_id, status)
    VALUES (v_warga_id, 'warga@wastewise.id', 'Siti Rahmawati (Warga)', 'warga', NULL, 0, NULL, 'active')
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        points_balance = 0,
        status = EXCLUDED.status;

    -- =================================================================
    -- ROLE 2: PETUGAS LAPANGAN (petugas@wastewise.id)
    -- =================================================================
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'petugas@wastewise.id') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token,
            email_change_token_new, email_change
        ) VALUES (
            v_petugas_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated',
            'petugas@wastewise.id', v_encrypted_pw, now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Ahmad Fauzi (Petugas Lapangan)"}'::jsonb,
            now(), now(), '', '', '', ''
        );

        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
        ) VALUES (
            v_petugas_id, v_petugas_id,
            jsonb_build_object('sub', v_petugas_id::text, 'email', 'petugas@wastewise.id'),
            'email', 'petugas@wastewise.id', now(), now(), now()
        ) ON CONFLICT DO NOTHING;
    ELSE
        SELECT id INTO v_petugas_id FROM auth.users WHERE email = 'petugas@wastewise.id';
        UPDATE auth.users 
        SET email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE id = v_petugas_id;
    END IF;

    -- Upsert Profil Petugas
    INSERT INTO public.profiles (id, email, full_name, role, phone, points_balance, partner_id, status)
    VALUES (v_petugas_id, 'petugas@wastewise.id', 'Ahmad Fauzi (Petugas Lapangan)', 'petugas', NULL, 0, NULL, 'active')
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        points_balance = 0,
        status = EXCLUDED.status;

    -- =================================================================
    -- ROLE 3: MITRA PENGOLAHAN (mitra@wastewise.id)
    -- Catatan: Mitra fiktif tidak dibuat; partner_id bernilai NULL
    -- =================================================================
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mitra@wastewise.id') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token,
            email_change_token_new, email_change
        ) VALUES (
            v_mitra_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated',
            'mitra@wastewise.id', v_encrypted_pw, now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Mitra Pengolahan (Akun Uji)"}'::jsonb,
            now(), now(), '', '', '', ''
        );

        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
        ) VALUES (
            v_mitra_id, v_mitra_id,
            jsonb_build_object('sub', v_mitra_id::text, 'email', 'mitra@wastewise.id'),
            'email', 'mitra@wastewise.id', now(), now(), now()
        ) ON CONFLICT DO NOTHING;
    ELSE
        SELECT id INTO v_mitra_id FROM auth.users WHERE email = 'mitra@wastewise.id';
        UPDATE auth.users 
        SET email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE id = v_mitra_id;
    END IF;

    -- Upsert Profil Mitra
    INSERT INTO public.profiles (id, email, full_name, role, phone, points_balance, partner_id, status)
    VALUES (v_mitra_id, 'mitra@wastewise.id', 'Mitra Pengolahan (Akun Uji)', 'mitra', NULL, 0, NULL, 'active')
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        partner_id = NULL,
        points_balance = 0,
        status = EXCLUDED.status;

    -- =================================================================
    -- ROLE 4: ADMIN OPERASIONAL (admin@wastewise.id)
    -- =================================================================
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@wastewise.id') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token,
            email_change_token_new, email_change
        ) VALUES (
            v_admin_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated',
            'admin@wastewise.id', v_encrypted_pw, now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Budi Hartono (Admin Operasional)"}'::jsonb,
            now(), now(), '', '', '', ''
        );

        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
        ) VALUES (
            v_admin_id, v_admin_id,
            jsonb_build_object('sub', v_admin_id::text, 'email', 'admin@wastewise.id'),
            'email', 'admin@wastewise.id', now(), now(), now()
        ) ON CONFLICT DO NOTHING;
    ELSE
        SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@wastewise.id';
        UPDATE auth.users 
        SET email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE id = v_admin_id;
    END IF;

    -- Upsert Profil Admin
    INSERT INTO public.profiles (id, email, full_name, role, phone, points_balance, partner_id, status)
    VALUES (v_admin_id, 'admin@wastewise.id', 'Budi Hartono (Admin Operasional)', 'admin', NULL, 0, NULL, 'active')
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        points_balance = 0,
        status = EXCLUDED.status;

    -- =================================================================
    -- ROLE 5: SUPER ADMIN EKOSISTEM (superadmin@wastewise.id)
    -- =================================================================
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'superadmin@wastewise.id') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token,
            email_change_token_new, email_change
        ) VALUES (
            v_superadmin_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated',
            'superadmin@wastewise.id', v_encrypted_pw, now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Dr. Ir. Hendrawan (Super Admin Ekosistem)"}'::jsonb,
            now(), now(), '', '', '', ''
        );

        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
        ) VALUES (
            v_superadmin_id, v_superadmin_id,
            jsonb_build_object('sub', v_superadmin_id::text, 'email', 'superadmin@wastewise.id'),
            'email', 'superadmin@wastewise.id', now(), now(), now()
        ) ON CONFLICT DO NOTHING;
    ELSE
        SELECT id INTO v_superadmin_id FROM auth.users WHERE email = 'superadmin@wastewise.id';
        UPDATE auth.users 
        SET email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE id = v_superadmin_id;
    END IF;

    -- Upsert Profil Super Admin
    INSERT INTO public.profiles (id, email, full_name, role, phone, points_balance, partner_id, status)
    VALUES (v_superadmin_id, 'superadmin@wastewise.id', 'Dr. Ir. Hendrawan (Super Admin Ekosistem)', 'super_admin', NULL, 0, NULL, 'active')
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        points_balance = 0,
        status = EXCLUDED.status;

    -- =================================================================
    -- 4. PENCATATAN AUDIT LOG (Sesuai Skema Aktual public.audit_logs)
    -- =================================================================
    INSERT INTO public.audit_logs (
        actor_id,
        actor_role,
        action,
        target_table,
        target_id,
        new_values
    ) VALUES (
        v_superadmin_id,
        'super_admin',
        'SEED_TEST_ACCOUNTS',
        'auth.users',
        v_superadmin_id::text,
        jsonb_build_object(
            'description', 'Inisialisasi 5 akun pengujian standar WasteWise (Warga, Petugas, Mitra, Admin, Super Admin)',
            'seed_time', now()
        )
    );

END $$;
