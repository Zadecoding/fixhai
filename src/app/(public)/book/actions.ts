'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Check if at least one verified & active technician is available
 * for the given service category and customer pincode.
 */
export async function checkAvailability(categorySlug: string, pincode: string) {
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

  const { data: { user } } = await anonClient.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized. You must be logged in to book a technician.' };
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: exactMatch, error: exactError } = await adminClient
    .from('technician_profiles')
    .select('id, full_name, rating, pincode')
    .eq('category', categorySlug)
    .eq('pincode', pincode)
    .eq('verified', true)
    .eq('active', true);

  if (exactError) {
    console.error('[checkAvailability] error:', exactError.message);
    return { error: 'Failed to check availability. Please try again.' };
  }

  let arrayMatch: { id: string; full_name: string; rating: number; pincode: string }[] = [];
  try {
    const { data, error: arrayError } = await adminClient
      .from('technician_profiles')
      .select('id, full_name, rating, pincode')
      .eq('category', categorySlug)
      .eq('verified', true)
      .eq('active', true)
      .contains('service_pincodes', [pincode]);

    if (!arrayError) {
      arrayMatch = data ?? [];
    }
  } catch {
    // service_pincodes column may not exist yet — silently skip
  }

  const allMatches = [...(exactMatch ?? []), ...arrayMatch];
  const unique = Array.from(new Map(allMatches.map(t => [t.id, t])).values());

  if (unique.length === 0) {
    return {
      available: false,
      technicianCount: 0,
      message: `No technicians are currently available in pincode ${pincode} for this service.`,
    };
  }

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

/**
 * Persists a confirmed booking record to Supabase after payment succeeds.
 */
export async function createBooking(params: {
  categorySlug: string;
  issueTitle: string;
  issueDescription: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  preferredSlot: string;
  bookingFee: number;
  technicianId: string | null;
  razorpayPaymentId: string;
  razorpayOrderId: string;
}) {
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

  const { data: { user } } = await anonClient.auth.getUser();
  if (!user) return { error: 'Unauthorized.' };

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Resolve category slug → id
  const { data: category } = await adminClient
    .from('service_categories')
    .select('id, name')
    .eq('slug', params.categorySlug)
    .single();

  if (!category) return { error: 'Invalid service category.' };

  const { data: booking, error } = await adminClient.from('bookings').insert({
    user_id: user.id,
    category_id: category.id,
    service_name: category.name,
    issue_title: params.issueTitle,
    issue_description: params.issueDescription,
    address: params.address,
    city: params.city,
    pincode: params.pincode,
    preferred_time: params.preferredSlot,
    preferred_slot: params.preferredSlot,
    booking_fee: params.bookingFee,
    technician_id: params.technicianId || null,
    status: 'pending',
    payment_status: 'paid',
  }).select('id').single();

  if (error) {
    console.error('[createBooking] insert error:', error.message);
    return { error: 'Failed to save booking. Please contact support.' };
  }

  // Record the payment transaction
  await adminClient.from('payments').insert({
    booking_id: booking.id,
    user_id: user.id,
    amount: params.bookingFee,
    payment_type: 'booking_fee',
    status: 'paid',
    provider: 'razorpay',
    transaction_id: params.razorpayPaymentId,
  });

  return { bookingDbId: booking.id };
}
