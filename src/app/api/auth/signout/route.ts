import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  const response = NextResponse.json({ ok: true })

  // Delete every sb- cookie
  allCookies.forEach(cookie => {
    if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
      response.cookies.set(cookie.name, '', {
        maxAge:   0,
        path:     '/',
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    }
  })

  return response
}