'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getAdminTechnicians() {
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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || (user.email !== 'imsanju4141@gmail.com' && user.user_metadata?.role !== 'admin')) {
    return { error: 'Unauthorized' };
  }

  // Use service role key to bypass RLS for fetching all profiles
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

  const { data: technicians, error } = await supabaseAdmin
    .from('technician_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { technicians };
}

export async function verifyTechnician(technicianId: string, verify: boolean) {
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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || (user.email !== 'imsanju4141@gmail.com' && user.user_metadata?.role !== 'admin')) {
    return { error: 'Unauthorized' };
  }

  // Use service role key to bypass RLS for updating
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

  const { error } = await supabaseAdmin
    .from('technician_profiles')
    .update({ verified: verify, active: verify }) // Set active to true if verified
    .eq('id', technicianId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}
