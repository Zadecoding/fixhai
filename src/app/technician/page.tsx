import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TechnicianDashboardClient from './dashboard-client';

export default async function TechnicianPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
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
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/technician');
  }

  // Check if technician profile exists using admin key to bypass RLS if policies are missing
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {}
      }
    }
  );

  const { data: profiles, error } = await supabaseAdmin
    .from('technician_profiles')
    .select('*')
    .eq('user_id', user.id)
    .limit(1);

  const profile = profiles && profiles.length > 0 ? profiles[0] : null;

  if (error) {
    console.error('Error fetching profile:', error);
  }

  // Fetch assigned bookings if profile exists
  let bookings = [];
  if (profile) {
    const { data: bookingsData } = await supabaseAdmin
      .from('bookings')
      .select('*, user:users(name, phone)')
      .eq('technician_id', profile.id)
      .order('created_at', { ascending: false });
    bookings = bookingsData || [];
  }

  // Fetch categories for display
  const { data: categories } = await supabaseAdmin
    .from('service_categories')
    .select('*')
    .eq('active', true);

  return <TechnicianDashboardClient 
    profile={profile} 
    initialBookings={bookings} 
    categories={categories || []} 
  />;
}
