import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json()
    if (!path) return NextResponse.json({ ok: false })

    const supabase = await createClient()
    await supabase.from('page_views').insert({
      path,
      referrer: referrer || null,
      viewed_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}