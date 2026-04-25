-- The support_tickets table was originally created with 'message' column.
-- Schema.sql references 'description'. This migration aligns the DB with the code.
-- Run this in Supabase SQL Editor.

-- Option A: Add 'description' as an alias (copy from message if it exists)
DO $$
BEGIN
  -- Add description column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'support_tickets'
      AND column_name  = 'description'
  ) THEN
    -- If 'message' column exists, rename it to 'description'
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = 'support_tickets'
        AND column_name  = 'message'
    ) THEN
      ALTER TABLE public.support_tickets RENAME COLUMN message TO description;
    ELSE
      -- Neither exists, add description fresh
      ALTER TABLE public.support_tickets ADD COLUMN description TEXT NOT NULL DEFAULT '';
    END IF;
  END IF;
END $$;
