-- Add 'diagnosing' to the booking status check constraint
-- Run this in your Supabase SQL Editor

-- First, drop the existing constraint (if any)
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Re-add the constraint with 'diagnosing' included
ALTER TABLE bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'assigned', 'on_the_way', 'diagnosing', 'diagnosis_complete', 'completed', 'cancelled'));
