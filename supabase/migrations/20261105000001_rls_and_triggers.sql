-- ====================================================================
-- WasteWise RLS Policies, Security Functions, and Database Triggers
-- Version: 20261105000001
-- Target: Supabase PostgreSQL 15+
-- Description: Complete Access Control & Business Logic Automation
-- ====================================================================

-- 1. SECURITY HELPER FUNCTIONS
-- Mengambil role pengguna aktif secara efisien dari tabel profiles
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Memeriksa apakah user saat ini adalah admin atau super_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Memeriksa apakah user saat ini adalah petugas lapangan
CREATE OR REPLACE FUNCTION public.is_officer()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'petugas'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Memeriksa apakah user saat ini adalah pengelola mitra
CREATE OR REPLACE FUNCTION public.is_partner()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'mitra'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Memeriksa apakah petugas ditugaskan ke pickup tertentu
CREATE OR REPLACE FUNCTION public.is_assigned_officer(p_pickup_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.pickup_assignments
        WHERE pickup_id = p_pickup_id 
          AND officer_id = auth.uid()
          AND status IN ('assigned', 'accepted', 'in_progress', 'completed')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ====================================================================
-- 2. ENABLE RLS PADA SELURUH TABEL
-- ====================================================================
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 3. RLS POLICIES
-- ====================================================================

-- 3.1 SYSTEM SETTINGS
CREATE POLICY "Public read system settings"
ON public.system_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super Admin manage system settings"
ON public.system_settings FOR ALL
TO authenticated
USING (public.get_current_role() = 'super_admin')
WITH CHECK (public.get_current_role() = 'super_admin');

-- 3.2 PARTNERS
CREATE POLICY "Admins and Partners view partners"
ON public.partners FOR SELECT
TO authenticated
USING (
    public.is_admin_or_super() OR 
    (public.is_partner() AND id = (SELECT partner_id FROM public.profiles WHERE id = auth.uid()))
);

CREATE POLICY "Admins manage partners"
ON public.partners FOR ALL
TO authenticated
USING (public.is_admin_or_super())
WITH CHECK (public.is_admin_or_super());

-- 3.3 PROFILES
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (
    id = auth.uid() OR 
    public.is_admin_or_super() OR
    (public.is_officer() AND id IN (
        SELECT pr.user_id FROM public.pickup_requests pr
        JOIN public.pickup_assignments pa ON pa.pickup_id = pr.id
        WHERE pa.officer_id = auth.uid()
    ))
);

CREATE POLICY "Users can update own non-sensitive profile info"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.is_admin_or_super())
WITH CHECK (
    id = auth.uid() OR public.is_admin_or_super()
);

-- 3.4 USER ADDRESSES
CREATE POLICY "Users can manage own addresses"
ON public.user_addresses FOR ALL
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_super())
WITH CHECK (user_id = auth.uid() OR public.is_admin_or_super());

CREATE POLICY "Officers can view address of assigned pickups"
ON public.user_addresses FOR SELECT
TO authenticated
USING (
    public.is_officer() AND id IN (
        SELECT address_id FROM public.pickup_requests pr
        JOIN public.pickup_assignments pa ON pa.pickup_id = pr.id
        WHERE pa.officer_id = auth.uid()
    )
);

-- 3.5 STAFF ASSIGNMENTS
CREATE POLICY "Officers view own assignment details"
ON public.staff_assignments FOR SELECT
TO authenticated
USING (officer_id = auth.uid() OR public.is_admin_or_super());

CREATE POLICY "Admins manage staff assignments"
ON public.staff_assignments FOR ALL
TO authenticated
USING (public.is_admin_or_super())
WITH CHECK (public.is_admin_or_super());

-- 3.6 MODEL VERSIONS & WASTE CATEGORIES (Read-only for all auth)
CREATE POLICY "Anyone authenticated can view model versions"
ON public.model_versions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins manage model versions"
ON public.model_versions FOR ALL
TO authenticated
USING (public.is_admin_or_super())
WITH CHECK (public.is_admin_or_super());

CREATE POLICY "Anyone authenticated can view waste categories"
ON public.waste_categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins manage waste categories"
ON public.waste_categories FOR ALL
TO authenticated
USING (public.is_admin_or_super())
WITH CHECK (public.is_admin_or_super());

-- 3.7 WASTE CLASSIFICATIONS (Immutable Audit Trail)
CREATE POLICY "Users view own classifications"
ON public.waste_classifications FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_super());

CREATE POLICY "Users insert own classifications"
ON public.waste_classifications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Note: Tidak ada policy UPDATE atau DELETE pada waste_classifications agar riwayat AI kekal.

-- 3.8 POINT RULES & WASTE PRICES
CREATE POLICY "View active point rules"
ON public.point_rules FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins manage point rules"
ON public.point_rules FOR ALL
TO authenticated
USING (public.is_admin_or_super())
WITH CHECK (public.is_admin_or_super());

CREATE POLICY "View waste prices"
ON public.waste_prices FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and Partners manage waste prices"
ON public.waste_prices FOR ALL
TO authenticated
USING (public.is_admin_or_super() OR (public.is_partner() AND partner_id = (SELECT partner_id FROM public.profiles WHERE id = auth.uid())))
WITH CHECK (public.is_admin_or_super() OR (public.is_partner() AND partner_id = (SELECT partner_id FROM public.profiles WHERE id = auth.uid())));

-- 3.9 PICKUP REQUESTS
CREATE POLICY "Warga view own requests"
ON public.pickup_requests FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR 
    public.is_admin_or_super() OR
    (public.is_officer() AND public.is_assigned_officer(id))
);

CREATE POLICY "Warga create own pickup requests"
ON public.pickup_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Warga update own draft or pending request"
ON public.pickup_requests FOR UPDATE
TO authenticated
USING (
    (user_id = auth.uid() AND status IN ('draft', 'pending')) OR
    public.is_admin_or_super() OR
    (public.is_officer() AND public.is_assigned_officer(id))
)
WITH CHECK (
    (user_id = auth.uid() AND status IN ('draft', 'pending', 'cancelled')) OR
    public.is_admin_or_super() OR
    (public.is_officer() AND public.is_assigned_officer(id))
);

-- 3.10 PICKUP ITEMS
CREATE POLICY "View pickup items based on request access"
ON public.pickup_items FOR SELECT
TO authenticated
USING (
    pickup_id IN (
        SELECT id FROM public.pickup_requests 
        WHERE user_id = auth.uid() OR public.is_admin_or_super() OR (public.is_officer() AND public.is_assigned_officer(id))
    )
);

CREATE POLICY "Users insert items into own requests"
ON public.pickup_items FOR INSERT
TO authenticated
WITH CHECK (
    pickup_id IN (
        SELECT id FROM public.pickup_requests WHERE user_id = auth.uid() AND status IN ('draft', 'pending')
    ) OR public.is_admin_or_super()
);

-- 3.11 PICKUP ASSIGNMENTS
CREATE POLICY "View assignments"
ON public.pickup_assignments FOR SELECT
TO authenticated
USING (
    officer_id = auth.uid() OR 
    public.is_admin_or_super() OR 
    pickup_id IN (SELECT id FROM public.pickup_requests WHERE user_id = auth.uid())
);

CREATE POLICY "Admins manage assignments"
ON public.pickup_assignments FOR ALL
TO authenticated
USING (public.is_admin_or_super())
WITH CHECK (public.is_admin_or_super());

CREATE POLICY "Officers update assigned task status"
ON public.pickup_assignments FOR UPDATE
TO authenticated
USING (officer_id = auth.uid())
WITH CHECK (officer_id = auth.uid());

-- 3.12 PICKUP VERIFICATIONS (Krusial: Hanya Petugas Terverifikasi)
CREATE POLICY "View verifications"
ON public.pickup_verifications FOR SELECT
TO authenticated
USING (
    public.is_admin_or_super() OR
    verified_by_officer_id = auth.uid() OR
    pickup_id IN (SELECT id FROM public.pickup_requests WHERE user_id = auth.uid())
);

CREATE POLICY "Assigned officer can create verification"
ON public.pickup_verifications FOR INSERT
TO authenticated
WITH CHECK (
    public.is_officer() AND 
    verified_by_officer_id = auth.uid() AND
    public.is_assigned_officer(pickup_id)
);

-- 3.13 WASTE RECORDS
CREATE POLICY "View waste records"
ON public.waste_records FOR SELECT
TO authenticated
USING (
    public.is_admin_or_super() OR
    verification_id IN (
        SELECT pv.id FROM public.pickup_verifications pv
        JOIN public.pickup_requests pr ON pr.id = pv.pickup_id
        WHERE pr.user_id = auth.uid() OR pv.verified_by_officer_id = auth.uid()
    )
);

CREATE POLICY "Assigned officer insert waste records"
ON public.waste_records FOR INSERT
TO authenticated
WITH CHECK (
    public.is_officer() AND 
    verification_id IN (
        SELECT id FROM public.pickup_verifications WHERE verified_by_officer_id = auth.uid()
    ) OR public.is_admin_or_super()
);

-- 3.14 WASTE PHOTOS
CREATE POLICY "View waste photos"
ON public.waste_photos FOR SELECT
TO authenticated
USING (
    public.is_admin_or_super() OR
    uploaded_by = auth.uid() OR
    pickup_id IN (SELECT id FROM public.pickup_requests WHERE user_id = auth.uid())
);

CREATE POLICY "Upload waste photos"
ON public.waste_photos FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

-- 3.15 REWARDS & REDEMPTIONS
CREATE POLICY "Anyone view active rewards"
ON public.rewards FOR SELECT
TO authenticated
USING (is_active = true OR public.is_admin_or_super());

CREATE POLICY "Admins manage rewards"
ON public.rewards FOR ALL
TO authenticated
USING (public.is_admin_or_super())
WITH CHECK (public.is_admin_or_super());

CREATE POLICY "Users view own redemptions"
ON public.reward_redemptions FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_super());

CREATE POLICY "Users redeem rewards"
ON public.reward_redemptions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3.16 REWARD TRANSACTIONS (LEDGER - HANYA BISA DIBACA USER, DITULIS OLEH TRIGGER/ADMIN)
CREATE POLICY "Users view own ledger transactions"
ON public.reward_transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_super());

CREATE POLICY "Admin adjust ledger"
ON public.reward_transactions FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_super());

-- 3.17 PROCESSING BATCHES, OUTPUTS, AND RECEIPTS
CREATE POLICY "Mitra and Admin manage batches"
ON public.processing_batches FOR ALL
TO authenticated
USING (public.is_admin_or_super() OR public.is_partner())
WITH CHECK (public.is_admin_or_super() OR public.is_partner());

CREATE POLICY "Mitra and Admin manage outputs"
ON public.processing_outputs FOR ALL
TO authenticated
USING (public.is_admin_or_super() OR public.is_partner())
WITH CHECK (public.is_admin_or_super() OR public.is_partner());

CREATE POLICY "Mitra and Admin manage receipts"
ON public.partner_receipts FOR ALL
TO authenticated
USING (public.is_admin_or_super() OR public.is_partner())
WITH CHECK (public.is_admin_or_super() OR public.is_partner());

-- 3.18 NOTIFICATIONS
CREATE POLICY "Users manage own notifications"
ON public.notifications FOR ALL
TO authenticated
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- 3.19 AUDIT LOGS (Immutable read-only for Admin)
CREATE POLICY "Admins view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_admin_or_super());

-- ====================================================================
-- 4. DATABASE TRIGGERS & AUTOMATION
-- ====================================================================

-- 4.1 Trigger Auto Create Profile saat Sign Up di auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, status)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'User'), '@', 1)),
        'warga',
        'active'
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4.2 Pencegahan Eskalasi Privilege Role dan Mutasi Saldo Liar
CREATE OR REPLACE FUNCTION public.prevent_profile_tampering()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika bukan super_admin atau admin, dilarang merubah role
    IF (OLD.role IS DISTINCT FROM NEW.role) AND NOT public.is_admin_or_super() THEN
        RAISE EXCEPTION 'Akses Ditolak: Pengguna tidak diizinkan mengubah role akun.';
    END IF;

    -- Cegah pengubahan poin saldo secara langsung tanpa lewat ledger reward_transactions
    -- (Kecuali dilakukan via trigger kalkulasi internal yang berjalan dengan session superuser/definer)
    IF (OLD.points_balance IS DISTINCT FROM NEW.points_balance) AND current_user != 'postgres' AND NOT public.is_admin_or_super() THEN
        -- Dicek apakah update berasal dari ledger
        IF pg_trigger_depth() <= 1 THEN
            RAISE EXCEPTION 'Akses Ditolak: Saldo poin hanya dapat diubah melalui sistem transaksi ledger resmi.';
        END IF;
    END IF;

    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_profile_tampering ON public.profiles;
CREATE TRIGGER trg_prevent_profile_tampering
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_tampering();

-- 4.3 Trigger Otomasi Verifikasi Penjemputan, Kalkulasi Poin, & Ledger
CREATE OR REPLACE FUNCTION public.process_pickup_verification_and_points()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_request_status pickup_status;
    v_total_points INTEGER := 0;
    v_rec RECORD;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_rule_points INTEGER;
BEGIN
    -- Ambil info pickup request
    SELECT user_id, status INTO v_user_id, v_request_status
    FROM public.pickup_requests
    WHERE id = NEW.pickup_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Permintaan penjemputan dengan ID % tidak ditemukan.', NEW.pickup_id;
    END IF;

    -- 1. Hitung akumulasi poin dari waste_records yang sudah diinput oleh petugas
    -- Menghubungkan ke point_rules dan waste_categories (B3 tidak mendapat poin otomatis)
    FOR v_rec IN 
        SELECT wr.category_id, wr.actual_weight_kg, wc.allows_auto_points, wc.code
        FROM public.waste_records wr
        JOIN public.waste_categories wc ON wc.id = wr.category_id
        WHERE wr.verification_id = NEW.id
    LOOP
        IF v_rec.allows_auto_points = true THEN
            -- Ambil aturan poin aktif untuk kategori ini (default 100 poin/kg jika belum terdefinisi)
            SELECT COALESCE(points_per_kg, 100) INTO v_rule_points
            FROM public.point_rules
            WHERE category_id = v_rec.category_id AND is_active = true
            ORDER BY created_at DESC LIMIT 1;

            IF v_rule_points IS NULL THEN
                v_rule_points := 100;
            END IF;

            -- Hitung poin berdasarkan berat riil
            v_total_points := v_total_points + FLOOR(v_rec.actual_weight_kg * v_rule_points);
        END IF;
    END LOOP;

    -- 2. Ambil saldo terkini warga
    SELECT points_balance INTO v_current_balance
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

    v_new_balance := v_current_balance + v_total_points;

    -- 3. Catat transaksi ke ledger reward_transactions (idempotent / anti double point)
    INSERT INTO public.reward_transactions (
        user_id,
        transaction_type,
        points_amount,
        balance_after,
        reference_id,
        reference_type,
        description
    ) VALUES (
        v_user_id,
        'earn_pickup',
        v_total_points,
        v_new_balance,
        NEW.id,
        'pickup_verifications',
        'Pemberian poin penjemputan sampah terverifikasi (' || NEW.total_scale_kg || ' Kg)'
    ) ON CONFLICT (reference_type, reference_id, transaction_type) DO NOTHING;

    -- 4. Update saldo di profiles warga
    UPDATE public.profiles
    SET points_balance = v_new_balance,
        updated_at = now()
    WHERE id = v_user_id;

    -- 5. Update status pickup request menjadi 'completed' dan sinkronisasi bobot final
    UPDATE public.pickup_requests
    SET status = 'completed',
        total_verified_kg = NEW.total_scale_kg,
        updated_at = now()
    WHERE id = NEW.pickup_id;

    -- 6. Update penugasan petugas menjadi 'completed'
    UPDATE public.pickup_assignments
    SET status = 'completed',
        completed_at = now()
    WHERE pickup_id = NEW.pickup_id AND officer_id = NEW.verified_by_officer_id;

    -- 7. Buat notifikasi otomatis ke warga
    INSERT INTO public.notifications (
        recipient_id,
        title,
        body,
        type,
        reference_id
    ) VALUES (
        v_user_id,
        'Penjemputan Selesai & Poin Diterima!',
        'Petugas telah memverifikasi sampah Anda seberat ' || NEW.total_scale_kg || ' Kg. Anda memperoleh ' || v_total_points || ' poin.',
        'pickup_completed',
        NEW.pickup_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_after_pickup_verified ON public.pickup_verifications;
CREATE TRIGGER trg_after_pickup_verified
    AFTER INSERT ON public.pickup_verifications
    FOR EACH ROW EXECUTE FUNCTION public.process_pickup_verification_and_points();

-- 4.4 Trigger Audit Logging Otomatis untuk Status Perubahan
CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.audit_logs (
            actor_id,
            actor_role,
            action,
            target_table,
            target_id,
            old_values,
            new_values
        ) VALUES (
            auth.uid(),
            COALESCE(public.get_current_role()::text, 'system'),
            'STATUS_CHANGE',
            TG_TABLE_NAME,
            NEW.id::text,
            jsonb_build_object('status', OLD.status),
            jsonb_build_object('status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_pickup_requests ON public.pickup_requests;
CREATE TRIGGER trg_audit_pickup_requests
    AFTER UPDATE ON public.pickup_requests
    FOR EACH ROW EXECUTE FUNCTION public.log_status_change();

