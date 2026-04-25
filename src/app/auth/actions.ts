'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  const next = formData.get('next') as string | null;

  if (error) {
    return { error: error.message };
  }

  // Determine redirect based on role (for simplicity, sending to dashboard)
  revalidatePath('/', 'layout');
  if (next && next.startsWith('/')) {
    redirect(next);
  } else {
    redirect('/dashboard');
  }
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as string; // 'customer' or 'technician'

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
        role: role,
      },
    },
  });

  const next = formData.get('next') as string | null;

  if (error) {
    return { error: error.message };
  }

  // Insert user into public.users table to satisfy foreign key constraints
  if (data.user) {
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
    
    // Check if user already exists (in case of double clicks or existing auth)
    const { data: existingUser } = await supabaseAdmin.from('users').select('id').eq('id', data.user.id).single();
    
    if (!existingUser) {
      await supabaseAdmin.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        name: name,
        role: role
      });
    }
  }

  revalidatePath('/', 'layout');
  
  if (next && next.startsWith('/')) {
    redirect(next);
  } else if (role === 'technician') {
    redirect('/technician');
  } else {
    redirect('/dashboard');
  }
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
          } catch (error) {
          }
        },
      },
    }
  );

  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/auth/login');
}
