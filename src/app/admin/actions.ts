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

export async function verifyTechnician(technicianId: string, verify: boolean) {
  // Validate input types
  if (!isValidUUID(technicianId)) {
    return { error: 'Invalid technician ID.' };
  }
  if (typeof verify !== 'boolean') {
    return { error: 'Invalid verification value.' };
  }

  const adminUser = await requireAdmin();
  if (!adminUser) return { error: 'Unauthorized' };

  const admin = getAdminClient();
  const { error } = await admin
    .from('technician_profiles')
    .update({ verified: verify, active: verify })
    .eq('id', technicianId);

  if (error) {
    console.error('[verifyTechnician] error:', error.message);
    return { error: 'Failed to update technician status.' };
  }

  revalidatePath('/admin');
  return { success: true };
}
