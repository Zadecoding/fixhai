import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the auth token
  const { data: { user } } = await supabase.auth.getUser();

  // ── Convenient redirects ──────────────────────────────────────────
  if (request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }
  if (request.nextUrl.pathname === '/signup') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/signup';
    return NextResponse.redirect(url);
  }

  // ── Protected route guard ─────────────────────────────────────────
  const protectedRoutes = ['/dashboard', '/technician', '/admin', '/book', '/booking'];
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    // Guard against open-redirect: only allow same-origin paths
    const next = request.nextUrl.pathname;
    if (next.startsWith('/') && !next.startsWith('//')) {
      url.searchParams.set('next', next);
    }
    return NextResponse.redirect(url);
  }

  // ── Role-based route restrictions ────────────────────────────────
  // NOTE: We check user_metadata here for fast middleware perf.
  // The authoritative check is always re-done server-side in each action/page.
  if (user) {
    const role = user.user_metadata?.role as string | undefined;

    // Restrict /admin to admin role
    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Restrict /technician to technician role
    if (request.nextUrl.pathname.startsWith('/technician') && role !== 'technician') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Redirect already-authenticated users away from login/signup
    const authRoutes = ['/auth/login', '/auth/signup'];
    if (authRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      const url = request.nextUrl.clone();
      if (role === 'admin') url.pathname = '/admin';
      else if (role === 'technician') url.pathname = '/technician';
      else url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
