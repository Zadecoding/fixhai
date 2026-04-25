-- ================================================================
-- Fixhai Supabase Schema (production-ready)
-- Run in Supabase SQL Editor
-- ================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1) Tables
-- ================================================================

-- Public users profile table linked to auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'technician', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Technician profiles
CREATE TABLE IF NOT EXISTS public.technician_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  bio TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  earnings_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Technician documents
CREATE TABLE IF NOT EXISTS public.technician_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  technician_id UUID NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service categories
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Bookings (includes service_name, preferred_slot, total_amount used by the app)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES public.technician_profiles(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES public.service_categories(id),
  service_name TEXT,
  issue_title TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  preferred_slot TEXT,
  booking_fee NUMERIC(10,2) NOT NULL DEFAULT 99,
  final_quote NUMERIC(10,2),
  total_amount NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'on_the_way', 'diagnosis_complete', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking updates / timeline
CREATE TABLE IF NOT EXISTS public.booking_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('booking_fee', 'final_payment', 'refund')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'failed')),
  provider TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES public.technician_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Support tickets (description + priority columns added for app compatibility)
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- 2) Seed service categories
-- ================================================================

INSERT INTO public.service_categories (name, slug, description, icon, active) VALUES
  ('Mobile Phone Repair', 'mobile-repair', 'Screen replacement, battery issues, charging problems, water damage and more', 'Smartphone', TRUE),
  ('Laptop Repair', 'laptop-repair', 'Keyboard issues, screen damage, slow performance, battery & charging faults', 'Laptop', TRUE),
  ('Washing Machine', 'washing-machine', 'Not starting, leaking, noisy, drum issues and electrical faults', 'WashingMachine', TRUE),
  ('Air Conditioner', 'air-conditioner', 'Gas refilling, not cooling, remote issues, compressor problems, servicing', 'Wind', TRUE),
  ('Refrigerator', 'refrigerator', 'Not cooling, ice maker issues, compressor faults, door seal problems', 'Thermometer', TRUE),
  ('TV & Electronics', 'tv-electronics', 'Screen issues, remote problems, smart TV connectivity, speaker faults', 'Tv', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ================================================================
-- 3) Auto-create public.users row when a new auth user signs up
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, phone, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE
    SET name  = EXCLUDED.name,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- 4) Enable RLS on all tables
-- ================================================================

ALTER TABLE public.users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_documents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_updates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets       ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 5) Drop old policies (clean slate)
-- ================================================================

DROP POLICY IF EXISTS "Users can read own profile"                        ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile"                      ON public.users;
DROP POLICY IF EXISTS "Users can update own profile"                      ON public.users;

DROP POLICY IF EXISTS "Technician can read own profile"                   ON public.technician_profiles;
DROP POLICY IF EXISTS "Technician can insert own profile"                 ON public.technician_profiles;
DROP POLICY IF EXISTS "Technician can update own profile"                 ON public.technician_profiles;
DROP POLICY IF EXISTS "Customers can view technician on their booking"    ON public.technician_profiles;

DROP POLICY IF EXISTS "Technician can read own documents"                 ON public.technician_documents;
DROP POLICY IF EXISTS "Technician can create own documents"               ON public.technician_documents;
DROP POLICY IF EXISTS "Technician can update own documents"               ON public.technician_documents;

DROP POLICY IF EXISTS "Categories are public"                             ON public.service_categories;

DROP POLICY IF EXISTS "Customers can read own bookings"                   ON public.bookings;
DROP POLICY IF EXISTS "Customers can create bookings"                     ON public.bookings;
DROP POLICY IF EXISTS "Customers can update own bookings"                 ON public.bookings;
DROP POLICY IF EXISTS "Technicians can view assigned bookings"            ON public.bookings;
DROP POLICY IF EXISTS "Technicians can update assigned bookings"          ON public.bookings;

DROP POLICY IF EXISTS "Users can read booking updates"                    ON public.booking_updates;
DROP POLICY IF EXISTS "Technicians can add booking updates"               ON public.booking_updates;

DROP POLICY IF EXISTS "Users can read own payments"                       ON public.payments;

DROP POLICY IF EXISTS "Users can read own reviews"                        ON public.reviews;
DROP POLICY IF EXISTS "Users can create own reviews"                      ON public.reviews;
DROP POLICY IF EXISTS "Technicians can read reviews for them"             ON public.reviews;

DROP POLICY IF EXISTS "Users can read own tickets"                        ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create tickets"                          ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets"                      ON public.support_tickets;

-- ================================================================
-- 6) Create RLS policies
-- ================================================================

-- public.users
CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- technician_profiles
CREATE POLICY "Technician can read own profile"
ON public.technician_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Technician can insert own profile"
ON public.technician_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Technician can update own profile"
ON public.technician_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- technician_documents
CREATE POLICY "Technician can read own documents"
ON public.technician_documents FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.technician_profiles tp
  WHERE tp.user_id = auth.uid()
    AND tp.id = technician_documents.technician_id
));

CREATE POLICY "Technician can create own documents"
ON public.technician_documents FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.technician_profiles tp
  WHERE tp.user_id = auth.uid()
    AND tp.id = technician_documents.technician_id
));

CREATE POLICY "Technician can update own documents"
ON public.technician_documents FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.technician_profiles tp
  WHERE tp.user_id = auth.uid()
    AND tp.id = technician_documents.technician_id
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.technician_profiles tp
  WHERE tp.user_id = auth.uid()
    AND tp.id = technician_documents.technician_id
));

-- service_categories (public read)
CREATE POLICY "Categories are public"
ON public.service_categories FOR SELECT
USING (TRUE);

-- bookings
-- Helper function: returns the technician_profile id for the current user.
-- SECURITY DEFINER bypasses RLS on technician_profiles, breaking the recursion loop.
CREATE OR REPLACE FUNCTION public.get_my_technician_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.technician_profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

CREATE POLICY "Customers can read own bookings"
ON public.bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Customers can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers can update own bookings"
ON public.bookings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Technicians can view assigned bookings"
ON public.bookings FOR SELECT
USING (technician_id = public.get_my_technician_id());

CREATE POLICY "Technicians can update assigned bookings"
ON public.bookings FOR UPDATE
USING (technician_id = public.get_my_technician_id())
WITH CHECK (technician_id = public.get_my_technician_id());

-- booking_updates
CREATE POLICY "Users can read booking updates"
ON public.booking_updates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_updates.booking_id
      AND b.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.technician_profiles tp ON tp.id = b.technician_id
    WHERE b.id = booking_updates.booking_id
      AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Technicians can add booking updates"
ON public.booking_updates FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.bookings b
  JOIN public.technician_profiles tp ON tp.id = b.technician_id
  WHERE b.id = booking_updates.booking_id
    AND tp.user_id = auth.uid()
));

-- payments
CREATE POLICY "Users can read own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

-- reviews
CREATE POLICY "Users can read own reviews"
ON public.reviews FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reviews"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = reviews.booking_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Technicians can read reviews for them"
ON public.reviews FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.technician_profiles tp
  WHERE tp.id = reviews.technician_id
    AND tp.user_id = auth.uid()
));

-- support_tickets
CREATE POLICY "Users can read own tickets"
ON public.support_tickets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets"
ON public.support_tickets FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- 7) Trigger: auto-update bookings.updated_at
-- ================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
