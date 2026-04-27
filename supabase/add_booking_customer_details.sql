-- Add customer_name and customer_phone to the bookings table to track the exact details entered during booking

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS customer_phone text;
