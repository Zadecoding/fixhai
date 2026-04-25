'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Check if at least one verified & active technician is available
 * for the given service category and customer pincode.
 *
 * Uses the service-role client so RLS is bypassed (we need to
 * query ALL technicians, not just the logged-in user's own row).
 */
export async function checkAvailability(categorySlug: string, pincode: string) {
  // ── Auth guard: require a logged-in customer ────────────────────
  const cookieStore = await cookies();
  const anonClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const {
    data: { user },
  } = await anonClient.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized. You must be logged in to book a technician.' };
  }

  // ── Use service-role client to bypass RLS for technician lookup ──
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Strategy 1: exact pincode match on primary `pincode` column
  // NOTE: do NOT select service_pincodes here — that column may not exist yet
  const { data: exactMatch, error: exactError } = await adminClient
    .from('technician_profiles')
    .select('id, full_name, rating, pincode')
    .eq('category', categorySlug)
    .eq('pincode', pincode)
    .eq('verified', true)
    .eq('active', true);

  if (exactError) {
    console.error('[checkAvailability] exact match error:', exactError);
    return { error: 'Failed to check availability. Please try again.' };
  }

  // Strategy 2: check `service_pincodes` array column (technicians
  // who cover this pincode in addition to their primary one).
  // This column is optional — silently skip if it doesn't exist yet.
  // Run supabase/add_service_pincodes.sql to enable multi-pincode support.
  let arrayMatch: { id: string; full_name: string; rating: number; pincode: string }[] = [];
  try {
    const { data, error: arrayError } = await adminClient
      .from('technician_profiles')
      .select('id, full_name, rating, pincode')
      .eq('category', categorySlug)
      .eq('verified', true)
      .eq('active', true)
      .contains('service_pincodes', [pincode]);   // PostgreSQL @> operator

    if (arrayError) {
      // Column doesn't exist yet — not a problem, exact match is the fallback
      console.warn('[checkAvailability] service_pincodes not available yet:', arrayError.message);
    } else {
      arrayMatch = data ?? [];
    }
  } catch {
    // silently swallow
  }

  // Merge both result sets, de-duplicate by id
  const allMatches = [...(exactMatch ?? []), ...(arrayMatch ?? [])];
  const unique = Array.from(new Map(allMatches.map((t) => [t.id, t])).values());

  if (unique.length === 0) {
    return {
      available: false,
      technicianCount: 0,
      message: `No technicians are currently available in pincode ${pincode} for this service.`,
    };
  }

  // Pick the highest-rated technician
  const sorted = unique.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  const assignedTech = sorted[0];

  return {
    available: true,
    technicianCount: unique.length,
    technician_id: assignedTech.id,
    technician_name: assignedTech.full_name,
    technician_rating: assignedTech.rating,
  };
}
