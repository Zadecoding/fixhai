'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { BookingStatus } from '@/types/database';

export async function updateBookingStatusAction(bookingId: string, status: BookingStatus) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Using service role to bypass RLS for simplicity here
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {}
      }
    }
  );

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);

  if (error) {
    console.error('Failed to update booking status:', error.message);
    return { error: error.message };
  }

  revalidatePath('/technician');
  revalidatePath(`/booking/${bookingId}`);
  revalidatePath('/admin');
  return { success: true };
}
