'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Utility to create a supabase client for server actions
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

// Admin supabase for bypassing RLS when needed
async function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {}
      }
    }
  );
}

export async function getCategories() {
  const supabase = await getSupabase();
  const { data: categories, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('active', true)
    .order('name');
    
  if (error) {
    console.error('Error fetching categories:', error);
    return { categories: [] };
  }
  
  return { categories };
}

export async function getCustomerDashboardData() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized', bookings: [], reviews: [] };
  
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*, technician:technician_profiles(full_name, phone)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*, technician:technician_profiles(full_name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  return { 
    bookings: bookings || [], 
    reviews: reviews || [] 
  };
}

export async function getTechnicianAssignedBookings(technicianId: string) {
  const supabaseAdmin = await getSupabaseAdmin(); // Admin used since RLS might block if technician doesn't own it directly
  
  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select('*, user:users(name, phone)')
    .eq('technician_id', technicianId)
    .order('created_at', { ascending: false });
    
  return { bookings: bookings || [] };
}

export async function getAdminDashboardData() {
  const supabaseAdmin = await getSupabaseAdmin();
  
  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('*, user:users(name), technician:technician_profiles(full_name)')
    .order('created_at', { ascending: false });
    
  const { data: tickets } = await supabaseAdmin
    .from('support_tickets')
    .select('*, user:users(name)')
    .order('created_at', { ascending: false });
    
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false });
    
  return { 
    bookings: bookings || [], 
    tickets: tickets || [],
    users: users || []
  };
}

export async function getBookingStatus(id: string) {
  const supabaseAdmin = await getSupabaseAdmin();
  
  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select('*, technician:technician_profiles(*)')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching booking status:', error);
    return { error: error.message };
  }
  
  return { booking };
}
