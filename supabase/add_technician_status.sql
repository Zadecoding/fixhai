-- Add a status column to technician_profiles for granular state tracking
-- Run this in Supabase SQL Editor

ALTER TABLE public.technician_profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Backfill existing rows based on current verified/active flags
UPDATE public.technician_profiles
SET status = CASE
  WHEN verified = TRUE  THEN 'approved'
  WHEN verified = FALSE THEN 'pending'
  ELSE 'pending'
END;
