'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createProfile(formData: FormData) {
  const full_name = formData.get('full_name') as string;
  const phone = formData.get('phone') as string;
  const category = formData.get('category') as string;
  const city = formData.get('city') as string;
  const pincode = formData.get('pincode') as string;
  const bio = formData.get('bio') as string | null;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Ignored when called from Server Component
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Use service role key to bypass RLS for insertion
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

  // Ensure user exists in public.users to satisfy foreign key
  const { data: existingUser } = await supabaseAdmin.from('users').select('id').eq('id', user.id).single();
  if (!existingUser) {
    await supabaseAdmin.from('users').insert({
      id: user.id,
      email: user.email,
      name: full_name,
      role: 'technician'
    });
  }

  // Check if profile already exists to prevent duplicates
  const { data: existingProfile } = await supabaseAdmin.from('technician_profiles').select('id').eq('user_id', user.id).limit(1);
  
  if (existingProfile && existingProfile.length > 0) {
    // Profile already exists, just redirect to dashboard
    revalidatePath('/technician');
    return { success: true };
  }

  const { error } = await supabaseAdmin.from('technician_profiles').insert({
    user_id: user.id,
    full_name,
    phone,
    category,
    city,
    pincode,
    bio,
    active: true, // Default active
    verified: false, // Default not verified until admin checks
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/technician');
  return { success: true };
}
