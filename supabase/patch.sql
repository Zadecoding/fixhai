-- ================================================================
-- Fixhai SQL Patch - Safe / idempotent Supabase version
-- ================================================================

-- 1. Add missing columns to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS service_name TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS preferred_slot TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2);

-- 2. Enable RLS on needed tables
ALTER TABLE public.technician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 3. Technician profiles policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'technician_profiles'
      AND policyname = 'Technician can read own profile'
  ) THEN
    CREATE POLICY "Technician can read own profile"
    ON public.technician_profiles
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'technician_profiles'
      AND policyname = 'Technician can insert own profile'
  ) THEN
    CREATE POLICY "Technician can insert own profile"
    ON public.technician_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'technician_profiles'
      AND policyname = 'Technician can update own profile'
  ) THEN
    CREATE POLICY "Technician can update own profile"
    ON public.technician_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Public categories policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'service_categories'
      AND policyname = 'Categories are public'
  ) THEN
    CREATE POLICY "Categories are public"
    ON public.service_categories
    FOR SELECT
    USING (TRUE);
  END IF;
END $$;

-- 5. Support tickets policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'support_tickets'
      AND policyname = 'Users can read own tickets'
  ) THEN
    CREATE POLICY "Users can read own tickets"
    ON public.support_tickets
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'support_tickets'
      AND policyname = 'Users can create tickets'
  ) THEN
    CREATE POLICY "Users can create tickets"
    ON public.support_tickets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 6. Bookings: users can read their own bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Users can read own bookings'
  ) THEN
    CREATE POLICY "Users can read own bookings"
    ON public.bookings
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 7. Customers can view technician profile if that technician is linked to one of their bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'technician_profiles'
      AND policyname = 'Customers can view technician on their booking'
  ) THEN
    CREATE POLICY "Customers can view technician on their booking"
    ON public.technician_profiles
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.bookings b
        WHERE b.user_id = auth.uid()
          AND b.technician_id = technician_profiles.id
      )
    );
  END IF;
END $$;

-- 8. Seed service categories safely without requiring a unique constraint
INSERT INTO public.service_categories (name, slug, description, icon, active)
SELECT *
FROM (
  VALUES
    ('Mobile Phone Repair', 'mobile-repair', 'Screen replacement, battery issues, charging problems, water damage and more', 'Smartphone', TRUE),
    ('Laptop Repair', 'laptop-repair', 'Keyboard issues, screen damage, slow performance, battery & charging faults', 'Laptop', TRUE),
    ('Washing Machine', 'washing-machine', 'Not starting, leaking, noisy, drum issues and electrical faults', 'WashingMachine', TRUE),
    ('Air Conditioner', 'air-conditioner', 'Gas refilling, not cooling, remote issues, compressor problems, servicing', 'Wind', TRUE),
    ('Refrigerator', 'refrigerator', 'Not cooling, ice maker issues, compressor faults, door seal problems', 'Thermometer', TRUE),
    ('TV & Electronics', 'tv-electronics', 'Screen issues, remote problems, smart TV connectivity, speaker faults', 'Tv', TRUE)
) AS v(name, slug, description, icon, active)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.service_categories sc
  WHERE sc.slug = v.slug
);
