import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              options as Parameters<typeof supabaseResponse.cookies.set>[2]
            )
          )
        },
      },
    }
  )

  // getUser validates server-side — more reliable than getSession
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    // Clear any stale cookies before redirecting
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)

    // Clear Supabase auth cookies
    request.cookies.getAll().forEach(cookie => {
      if (
        cookie.name.includes('supabase') ||
        cookie.name.includes('sb-')
      ) {
        redirectResponse.cookies.delete(cookie.name)
      }
    })

    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}