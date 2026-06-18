import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json()
    if (!path) return NextResponse.json({ ok: false, reason: 'no path' })

    if (path.startsWith('/admin') || path.startsWith('/auth')) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key  = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      console.error('Missing Supabase env vars:', { url: !!url, key: !!key })
      return NextResponse.json({ ok: false, reason: 'missing env vars' })
    }

    const supabase = createClient(url, key)

    const { error } = await supabase.from('page_views').insert({
      path,
      referrer:  referrer || null,
      viewed_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Page view insert error:', error.message)
      return NextResponse.json({ ok: false, reason: error.message })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Page view exception:', err)
    return NextResponse.json({ ok: false, reason: 'exception' })
  }
}