'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/** Allowed roles a user can self-select during signup */
const ALLOWED_SIGNUP_ROLES = new Set(['customer', 'technician']);

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

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
          } catch {
            // Ignored — middleware handles session refresh
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // After login, fetch actual role from DB (authoritative source)
  const { data: { user } } = await supabase.auth.getUser();
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: profile } = await adminClient
    .from('users')
    .select('role')
    .eq('id', user!.id)
    .single();

  const role = profile?.role ?? 'customer';

  // Sync DB role into auth user_metadata so the middleware JWT is always correct.
  // This means promoting a user to admin in the DB takes effect on their NEXT login.
  if (user!.user_metadata?.role !== role) {
    await adminClient.auth.admin.updateUserById(user!.id, {
      user_metadata: { ...user!.user_metadata, role },
    });
  }

  revalidatePath('/', 'layout');

  const next = formData.get('next') as string | null;
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    redirect(next);
  }

  if (role === 'admin') redirect('/admin');
  if (role === 'technician') redirect('/technician');
  redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const rawRole = formData.get('role') as string;

  // ── Security: only allow safe roles ──────────────────────────────
  const role = ALLOWED_SIGNUP_ROLES.has(rawRole) ? rawRole : 'customer';

  if (!email || !password || !name) {
    return { error: 'All fields are required.' };
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

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
          } catch {
            // Ignored
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        // Store role in metadata for convenience, but DB is authoritative
        role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Upsert user into public.users using service-role key (bypasses RLS)
  if (data.user) {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: insertError } = await adminClient.from('users').upsert(
      {
        id: data.user.id,
        email: data.user.email,
        name,
        // Role is set server-side — never trust the raw form value
        role,
      },
      { onConflict: 'id' }
    );

    if (insertError) {
      console.error('[signup] Failed to insert user profile:', insertError.message);
    }
  }

  revalidatePath('/', 'layout');

  if (role === 'technician') redirect('/technician');
  redirect('/dashboard');
}

export async function logout() {
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
          } catch {
            // Ignored
          }
        },
      },
    }
  );

  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/auth/login');
}
