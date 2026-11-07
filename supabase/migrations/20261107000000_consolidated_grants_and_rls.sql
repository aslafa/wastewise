-- ====================================================================
-- WasteWise Consolidated Grants and Table Privileges
-- Version: 20261107000000
-- Target: Supabase PostgreSQL 15+
-- Description: Resolves 42501 permission denied by explicitly granting
--              schema and table privileges to anon, authenticated, and service_role
-- ====================================================================

-- 1. Schema Usage Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant Table Privileges
-- Service role and postgres owner get full control
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, service_role;

-- Authenticated users (warga, petugas, admin, mitra) get standard CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- Anon users (landing page, public catalog, auth signup) get read-only on master catalogs
GRANT SELECT ON public.waste_categories TO anon;
GRANT SELECT ON public.waste_subcategories TO anon;
GRANT SELECT ON public.system_settings TO anon;
GRANT SELECT ON public.rewards TO anon;

-- 3. Set Default Privileges for Any Future Tables/Sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON ROUTINES TO authenticated;

-- 4. Ensure RLS Policies for pickup_requests allow citizen creation & officer updates
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pickup_requests' AND policyname = 'citizens_insert_own_pickups'
  ) THEN
    CREATE POLICY citizens_insert_own_pickups ON public.pickup_requests
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pickup_requests' AND policyname = 'citizens_view_own_pickups'
  ) THEN
    CREATE POLICY citizens_view_own_pickups ON public.pickup_requests
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id OR public.is_admin_or_super() OR public.is_officer());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pickup_requests' AND policyname = 'officers_update_pickups'
  ) THEN
    CREATE POLICY officers_update_pickups ON public.pickup_requests
      FOR UPDATE TO authenticated
      USING (public.is_admin_or_super() OR public.is_officer())
      WITH CHECK (public.is_admin_or_super() OR public.is_officer());
  END IF;
END $$;

