'use server';

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Returns the verified DB role for the currently authenticated user. */
async function getAuthenticatedUserWithRole() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single();

  return profile ? { id: profile.id, role: profile.role as string } : null;
}

// ── Public actions ────────────────────────────────────────────────────────────

export async function getCategories() {
  const supabase = await getSupabase();
  const { data: categories, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) {
    console.error('[getCategories] error:', error.message);
    return { categories: [] };
  }

  return { categories };
}

// ── Customer actions ──────────────────────────────────────────────────────────

export async function getCustomerDashboardData() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized', bookings: [], reviews: [] };

  const [{ data: bookings }, { data: reviews }] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, technician:technician_profiles(full_name, phone)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('reviews')
      .select('*, technician:technician_profiles(full_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  return {
    bookings: bookings ?? [],
    reviews: reviews ?? [],
  };
}

// ── Technician actions ────────────────────────────────────────────────────────

/**
 * Fetches bookings assigned to a technician.
 * Verifies the caller is the technician via their auth session.
 */
export async function getTechnicianAssignedBookings() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized', bookings: [] };

  const admin = getSupabaseAdmin();

  // Find the technician profile that belongs to this user
  const { data: techProfile } = await admin
    .from('technician_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!techProfile) {
    return { error: 'Technician profile not found.', bookings: [] };
  }

  const { data: bookings, error } = await admin
    .from('bookings')
    .select('*, user:users(name, phone)')
    .eq('technician_id', techProfile.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getTechnicianAssignedBookings] error:', error.message);
    return { error: 'Failed to fetch bookings.', bookings: [] };
  }

  return { bookings: bookings ?? [] };
}

// ── Admin actions ─────────────────────────────────────────────────────────────

/**
 * Fetches all admin dashboard data.
 * Verifies the caller has role = 'admin' in the database.
 */
export async function getAdminDashboardData() {
  const caller = await getAuthenticatedUserWithRole();

  if (!caller || caller.role !== 'admin') {
    return { error: 'Forbidden', bookings: [], tickets: [], users: [] };
  }

  const admin = getSupabaseAdmin();

  const [bookingsResult, ticketsResult, usersResult] = await Promise.all([
    admin
      .from('bookings')
      .select('*, user:users(name), technician:technician_profiles(full_name)')
      .order('created_at', { ascending: false }),
    admin
      .from('support_tickets')
      .select('*, user:users(name, email)')
      .order('created_at', { ascending: false }),
    admin
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false }),
  ]);

  if (bookingsResult.error) {
    console.error('[getAdminDashboardData] bookings error:', bookingsResult.error.message);
  }
  if (ticketsResult.error) {
    console.error('[getAdminDashboardData] tickets error:', ticketsResult.error.message);
  }
  if (usersResult.error) {
    console.error('[getAdminDashboardData] users error:', usersResult.error.message);
  }

  return {
    bookings: bookingsResult.data ?? [],
    tickets: ticketsResult.data ?? [],
    users: usersResult.data ?? [],
  };
}

/** Update a support ticket's status (admin only). */
export async function updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'resolved' | 'closed') {
  const caller = await getAuthenticatedUserWithRole();
  if (!caller || caller.role !== 'admin') return { error: 'Forbidden' };

  if (!ticketId || typeof ticketId !== 'string') return { error: 'Invalid ticket ID.' };

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from('support_tickets')
    .update({ status })
    .eq('id', ticketId);

  if (error) {
    console.error('[updateTicketStatus] error:', error.message);
    return { error: 'Failed to update ticket status.' };
  }

  return { success: true };
}

/**
 * Fetches a single booking's status.
 * Only the booking owner can fetch their own booking.
 */
export async function getBookingStatus(id: string) {
  if (!id || typeof id !== 'string') {
    return { error: 'Invalid booking ID.' };
  }

  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized.' };

  const admin = getSupabaseAdmin();

  // Fetch the booking only if the user owns it
  const { data: booking, error } = await admin
    .from('bookings')
    .select('*, technician:technician_profiles(full_name, phone, rating, category, city)')
    .eq('id', id)
    .eq('user_id', user.id)   // ← ownership check
    .single();

  if (error || !booking) {
    return { error: 'Booking not found.' };
  }

  return { booking };
}

/** Submit a support ticket (any authenticated user). */
export async function submitSupportTicket(data: {
  subject: string;
  description: string;
  priority: 'normal' | 'high' | 'critical';
  booking_id?: string;
}) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in to raise a support ticket.' };

  if (!data.subject?.trim() || !data.description?.trim()) {
    return { error: 'Subject and description are required.' };
  }

  const admin = getSupabaseAdmin();

  // Build payload progressively — only include columns that exist in DB.
  // The DB may have 'message' instead of 'description', and may be missing
  // priority / status / booking_id until the migration is run.
  const payloads = [
    // Attempt 1: full schema (post-migration)
    { user_id: user.id, subject: data.subject.trim(), description: data.description.trim(), priority: data.priority ?? 'normal', booking_id: data.booking_id || null, status: 'open' },
    // Attempt 2: 'message' instead of 'description' (pre-migration column name)
    { user_id: user.id, subject: data.subject.trim(), message: data.description.trim(), priority: data.priority ?? 'normal', booking_id: data.booking_id || null, status: 'open' },
    // Attempt 3: no priority/booking_id/status
    { user_id: user.id, subject: data.subject.trim(), description: data.description.trim() },
    // Attempt 4: 'message' column, no extra columns
    { user_id: user.id, subject: data.subject.trim(), message: data.description.trim() },
  ];

  let lastError: string | null = null;
  for (const payload of payloads) {
    const { error } = await admin.from('support_tickets').insert(payload as Record<string, unknown>);
    if (!error) return { success: true };
    lastError = error.message;
    // Only retry on schema-cache / column-not-found errors
    if (!error.message.includes('column') && !error.message.includes('schema cache')) break;
  }

  console.error('[submitSupportTicket] all attempts failed:', lastError);
  return { error: 'Failed to submit your ticket. Please run the DB migration in supabase/fix_support_tickets_columns.sql and try again.' };
}
