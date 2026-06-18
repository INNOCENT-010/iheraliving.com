import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { type, title, data, draftId } = body

  if (!type || !data) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const payload = {
    type,
    title: title?.trim() || 'Untitled Draft',
    data,
    user_id: user.id,
  }

  if (draftId) {
    const { data: updated, error } = await supabase
      .from('drafts')
      .update({ type: payload.type, title: payload.title, data: payload.data })
      .eq('id', draftId)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (error) {
      // Row may have been deleted — insert fresh
      const { data: inserted, error: ie } = await supabase
        .from('drafts')
        .insert(payload)
        .select('id')
        .single()
      if (ie) return NextResponse.json({ error: ie.message }, { status: 500 })
      return NextResponse.json({ id: inserted.id })
    }

    return NextResponse.json({ id: updated.id })
  }

  const { data: created, error } = await supabase
    .from('drafts')
    .insert(payload)
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: created.id })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { draftId } = await req.json()
  if (!draftId) return NextResponse.json({ error: 'Missing draftId' }, { status: 400 })

  const { error } = await supabase
    .from('drafts')
    .delete()
    .eq('id', draftId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('drafts')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ drafts: data || [] })
}