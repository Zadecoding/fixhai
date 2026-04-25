-- ================================================================
-- Fix support_tickets table - add ALL missing columns safely
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. Rename 'message' → 'description' if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='support_tickets' AND column_name='description'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='support_tickets' AND column_name='message'
    ) THEN
      ALTER TABLE public.support_tickets RENAME COLUMN message TO description;
    ELSE
      ALTER TABLE public.support_tickets ADD COLUMN description TEXT NOT NULL DEFAULT '';
    END IF;
  END IF;
END $$;

-- 2. Add 'priority' column if missing
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal'
  CHECK (priority IN ('normal', 'high', 'critical'));

-- 3. Add 'status' column if missing
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open'
  CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'));

-- 4. Add 'booking_id' column if missing
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL;

-- Verify final schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'support_tickets'
ORDER BY ordinal_position;
