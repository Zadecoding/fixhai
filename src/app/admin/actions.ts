'use server';

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Validates that the caller is an admin via the database (not user_metadata). */
async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = getAdminClient();
  const { data: profile } = await admin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin' ? user : null;
}

/** Simple UUID v4 format validation */
function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function getAdminTechnicians() {
  const adminUser = await requireAdmin();
  if (!adminUser) return { error: 'Unauthorized' };

  const admin = getAdminClient();
  const { data: technicians, error } = await admin
    .from('technician_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getAdminTechnicians] error:', error.message);
    return { error: 'Failed to fetch technicians.' };
  }

  return { technicians };
}

export async function verifyTechnician(technicianId: string, action: 'approved' | 'rejected' | 'pending') {
  if (!isValidUUID(technicianId)) {
    return { error: 'Invalid technician ID.' };
  }

  const adminUser = await requireAdmin();
  if (!adminUser) return { error: 'Unauthorized' };

  const admin = getAdminClient();

  // Map action → verified + active booleans
  const verified = action === 'approved';
  const active   = action === 'approved';

  const { error } = await admin
    .from('technician_profiles')
    .update({ verified, active, status: action })
    .eq('id', technicianId);

  if (error) {
    console.error('[verifyTechnician] error:', error.message);
    return { error: 'Failed to update technician status.' };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function addTechnicianByAdmin(data: {
  full_name: string;
  email: string;
  phone: string;
  category: string;
  city: string;
  pincode: string;
  bio?: string;
}) {
  const adminUser = await requireAdmin();
  if (!adminUser) return { error: 'Unauthorized' };

  // Basic validation
  if (!data.full_name?.trim()) return { error: 'Full name is required.' };
  if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return { error: 'Valid email is required.' };
  if (!data.phone?.trim()) return { error: 'Phone number is required.' };
  if (!data.category?.trim()) return { error: 'Service category is required.' };
  if (!data.city?.trim()) return { error: 'City is required.' };
  if (!data.pincode?.trim() || !/^\d{6}$/.test(data.pincode))
    return { error: 'Valid 6-digit pincode is required.' };

  const admin = getAdminClient();

  // Step 1: Check if a user with this email already exists
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const emailTaken = existingUsers?.users?.some(u => u.email === data.email.toLowerCase().trim());
  if (emailTaken) return { error: 'A user with this email already exists.' };

  // Step 2: Create auth user with a temporary password
  // Technician must reset it on first login via "Forgot Password"
  const tempPassword = `Fixhai@${Math.random().toString(36).slice(2, 10)}`;
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: data.email.toLowerCase().trim(),
    password: tempPassword,
    email_confirm: true, // skip email confirmation
    user_metadata: {
      full_name: data.full_name.trim(),
      role: 'technician',
    },
  });

  if (authError || !authData.user) {
    console.error('[addTechnicianByAdmin] auth create error:', authError?.message);
    return { error: authError?.message ?? 'Failed to create technician account.' };
  }

  const userId = authData.user.id;

  // Step 3: Upsert into public.users
  // (a DB trigger may have already inserted this row when the auth user was created)
  const { error: userInsertError } = await admin.from('users').upsert(
    {
      id: userId,
      email: data.email.toLowerCase().trim(),
      name: data.full_name.trim(),
      role: 'technician',
    },
    { onConflict: 'id' }
  );

  if (userInsertError) {
    // Rollback: delete the auth user we just created
    await admin.auth.admin.deleteUser(userId);
    console.error('[addTechnicianByAdmin] users insert error:', userInsertError.message);
    return { error: 'Failed to create user profile. Please try again.' };
  }

  // Step 4: Insert technician profile — pre-verified since admin is adding directly
  const { data: profile, error: profileError } = await admin
    .from('technician_profiles')
    .insert({
      user_id: userId,
      full_name: data.full_name.trim(),
      phone: data.phone.trim(),
      category: data.category,
      city: data.city.trim(),
      pincode: data.pincode.trim(),
      bio: data.bio?.trim() ?? null,
      verified: true,
      active: true,
      rating: 0,
    })
    .select('id')
    .single();

  if (profileError) {
    // Rollback both
    await admin.from('users').delete().eq('id', userId);
    await admin.auth.admin.deleteUser(userId);
    console.error('[addTechnicianByAdmin] profile insert error:', profileError.message);
    return { error: 'Failed to create technician profile. Please try again.' };
  }

  revalidatePath('/admin');
  return {
    success: true,
    technicianId: profile.id,
    tempPassword, // Return so admin can share it with the technician
  };
}
