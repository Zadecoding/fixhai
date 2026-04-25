-- ================================================================
-- Fixhai Patch: Add service_pincodes array for multi-pincode support
-- Run in Supabase SQL Editor (idempotent)
-- ================================================================

-- Add service_pincodes column if it doesn't exist.
-- A technician can serve multiple pincodes beyond their primary one.
ALTER TABLE public.technician_profiles
  ADD COLUMN IF NOT EXISTS service_pincodes TEXT[] DEFAULT '{}';

-- Index for fast @> (contains) queries on the array
CREATE INDEX IF NOT EXISTS idx_tech_profiles_service_pincodes
  ON public.technician_profiles USING GIN (service_pincodes);

-- Backfill: copy the existing primary pincode into service_pincodes
-- for any rows that don't have it yet (safe, idempotent)
UPDATE public.technician_profiles
SET service_pincodes = ARRAY[pincode]
WHERE service_pincodes = '{}' OR service_pincodes IS NULL;
