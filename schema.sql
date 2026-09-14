-- ==============================================================================
-- MOKA FLEET MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA & RLS SECURITY POLICIES
-- PostgreSQL schema for Multi-Tenant Fleet Operations, Real-Time NFC Auditing, and RLS
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
    id TEXT PRIMARY KEY DEFAULT ('comp_' || substring(md5(random()::text) from 1 for 10)),
    name TEXT NOT NULL,
    commercial_register TEXT,
    tax_number TEXT,
    country TEXT DEFAULT 'Saudi Arabia',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PROFILES TABLE (Links Supabase auth.users to company_id)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'Admin',
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '["read", "write", "admin", "audit"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id TEXT PRIMARY KEY DEFAULT ('veh_' || substring(md5(random()::text) from 1 for 10)),
    plate_number TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    department TEXT DEFAULT 'Fleet Operations',
    tag_id TEXT UNIQUE,
    odometer NUMERIC DEFAULT 0,
    fuel_limit_liters NUMERIC DEFAULT 100,
    company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DRIVERS TABLE
CREATE TABLE IF NOT EXISTS public.drivers (
    id TEXT PRIMARY KEY DEFAULT ('drv_' || substring(md5(random()::text) from 1 for 10)),
    full_name TEXT NOT NULL,
    badge_number TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    assigned_vehicle TEXT REFERENCES public.vehicles(id) ON DELETE SET NULL,
    company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STATIONS TABLE
CREATE TABLE IF NOT EXISTS public.stations (
    id TEXT PRIMARY KEY DEFAULT ('st_' || substring(md5(random()::text) from 1 for 10)),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT DEFAULT 'Riyadh',
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY DEFAULT ('txn_' || substring(md5(random()::text) from 1 for 10)),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    plate_number TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    liters NUMERIC NOT NULL,
    total_cost_sar NUMERIC NOT NULL,
    station_name TEXT NOT NULL,
    status TEXT DEFAULT 'Approved' CHECK (status IN ('Approved', 'Flagged', 'Pending Sync')),
    ocr_verified BOOLEAN DEFAULT true,
    odometer_reading NUMERIC DEFAULT 0,
    company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    anomaly_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Users can strictly access and modify ONLY rows matching their company_id
-- ==============================================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Helper function to retrieve the authenticated user's company_id
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS TEXT AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- --- RLS POLICIES FOR COMPANIES ---
CREATE POLICY "Users can view their own company"
    ON public.companies FOR SELECT
    USING (id = public.get_auth_company_id());

CREATE POLICY "Admins can update their company details"
    ON public.companies FOR UPDATE
    USING (id = public.get_auth_company_id());

-- --- RLS POLICIES FOR PROFILES ---
CREATE POLICY "Users can view profiles in their company"
    ON public.profiles FOR SELECT
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- --- RLS POLICIES FOR VEHICLES ---
CREATE POLICY "Users can view company vehicles"
    ON public.vehicles FOR SELECT
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Users can insert company vehicles"
    ON public.vehicles FOR INSERT
    WITH CHECK (company_id = public.get_auth_company_id());

CREATE POLICY "Users can update company vehicles"
    ON public.vehicles FOR UPDATE
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Users can delete company vehicles"
    ON public.vehicles FOR DELETE
    USING (company_id = public.get_auth_company_id());

-- --- RLS POLICIES FOR DRIVERS ---
CREATE POLICY "Users can view company drivers"
    ON public.drivers FOR SELECT
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Users can insert company drivers"
    ON public.drivers FOR INSERT
    WITH CHECK (company_id = public.get_auth_company_id());

CREATE POLICY "Users can update company drivers"
    ON public.drivers FOR UPDATE
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Users can delete company drivers"
    ON public.drivers FOR DELETE
    USING (company_id = public.get_auth_company_id());

-- --- RLS POLICIES FOR STATIONS ---
CREATE POLICY "Users can view stations"
    ON public.stations FOR SELECT
    USING (company_id IS NULL OR company_id = public.get_auth_company_id());

CREATE POLICY "Users can insert company stations"
    ON public.stations FOR INSERT
    WITH CHECK (company_id = public.get_auth_company_id());

-- --- RLS POLICIES FOR TRANSACTIONS ---
CREATE POLICY "Users can view company transactions"
    ON public.transactions FOR SELECT
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Users can insert company transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (company_id = public.get_auth_company_id());

CREATE POLICY "Users can update company transactions"
    ON public.transactions FOR UPDATE
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Users can delete company transactions"
    ON public.transactions FOR DELETE
    USING (company_id = public.get_auth_company_id());

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION FOR TRANSACTIONS
-- ==============================================================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- ==============================================================================
-- INITIAL SEED DATA FOR DEMO COMPANY & RECORDS
-- ==============================================================================
INSERT INTO public.companies (id, name, commercial_register, tax_number, country)
VALUES ('comp_moka_saudi', 'MOKA Saudi Arabia Fleet Logistics', '1010892019', '310928102900003', 'Saudi Arabia')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.stations (id, name, location, city, company_id, status)
VALUES 
  ('st_1', 'Al-Waha Hub', 'Riyadh North', 'Riyadh', 'comp_moka_saudi', 'active'),
  ('st_2', 'PetroMOKA East', 'Dammam Highway', 'Dammam', 'comp_moka_saudi', 'active'),
  ('st_3', 'PetroMOKA Central', 'Jeddah Corniche', 'Jeddah', 'comp_moka_saudi', 'active')
ON CONFLICT (id) DO NOTHING;
