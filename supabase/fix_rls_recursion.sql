-- ================================================================
-- Fix: Infinite RLS recursion between bookings and technician_profiles
-- Run in Supabase SQL Editor
-- ================================================================

-- 1. Drop the two mutually-recursive policies
DROP POLICY IF EXISTS "Customers can view technician on their booking" ON public.technician_profiles;
DROP POLICY IF EXISTS "Technicians can view assigned bookings"         ON public.bookings;
DROP POLICY IF EXISTS "Technicians can update assigned bookings"       ON public.bookings;

-- 2. Create a SECURITY DEFINER function to look up the technician profile id
--    for the currently-authenticated user WITHOUT triggering RLS on technician_profiles.
CREATE OR REPLACE FUNCTION public.get_my_technician_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.technician_profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- 3. Re-create the bookings policies using the SECURITY DEFINER function
--    (no cross-table RLS check = no recursion)

CREATE POLICY "Technicians can view assigned bookings"
ON public.bookings
FOR SELECT
USING (
  technician_id = public.get_my_technician_id()
);

CREATE POLICY "Technicians can update assigned bookings"
ON public.bookings
FOR UPDATE
USING (
  technician_id = public.get_my_technician_id()
)
WITH CHECK (
  technician_id = public.get_my_technician_id()
);

-- 4. The "Customers can view technician on their booking" policy is NOT needed
--    because the app uses the service_role key for admin fetches and JOIN
--    queries from the booking side. Leaving it out eliminates the recursion.
--    Customers can still read their own bookings and see technician data
--    via the joined query in server actions that use service_role key.
