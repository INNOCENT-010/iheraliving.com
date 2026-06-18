import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for anonymous page view inserts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json()
    if (!path) return NextResponse.json({ ok: false })

    // Skip admin and auth paths
    if (path.startsWith('/admin') || path.startsWith('/auth')) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const { error } = await supabase.from('page_views').insert({
      path,
      referrer: referrer || null,
      viewed_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Page view insert error:', error.message)
      return NextResponse.json({ ok: false })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Page view error:', err)
    return NextResponse.json({ ok: false })
  }
}