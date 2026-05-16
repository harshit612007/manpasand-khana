import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // Public routes
  if (
    url.pathname === '/' || 
    url.pathname.startsWith('/login') || 
    url.pathname.startsWith('/signup') ||
    url.pathname.startsWith('/auth/callback') ||
    url.pathname === '/sw.js'
  ) {
    // If logged in and trying to access login/signup/home, redirect to dashboard
    if (user && (url.pathname === '/' || url.pathname.startsWith('/login') || url.pathname.startsWith('/signup'))) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Not logged in for protected routes
  if (!user) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Check role using admin client to bypass potential RLS infinite recursion
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'customer'

  // Owner routes protection
  const isOwnerRoute = url.pathname.startsWith('/admin')

  if (isOwnerRoute && role !== 'owner') {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect owner to admin dashboard if they try to access customer dashboard
  if (url.pathname === '/dashboard' && role === 'owner') {
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
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
}
