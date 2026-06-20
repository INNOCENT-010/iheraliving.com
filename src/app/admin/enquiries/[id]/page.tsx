'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { EnquiryDetail } from '@/components/admin/EnquiryDetail'
import type { Enquiry } from '@/types'

export default function EnquiryDetailPage() {
  const params  = useParams()
  const router  = useRouter()
  const id      = params.id as string

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      await supabase.auth.refreshSession()

      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) { router.push('/admin/enquiries'); return }

      if (data.status === 'new') {
        await supabase.from('enquiries').update({ status: 'read' }).eq('id', id)
        data.status = 'read'
      }

      setEnquiry(data as Enquiry)
      setLoading(false)
    }
    load()
  }, [id, router])

  async function handleStatusUpdate(id: string, status: string) {
    const supabase = createClient()
    await supabase.auth.refreshSession()
    await supabase.from('enquiries').update({ status }).eq('id', id)
    if (enquiry) setEnquiry({ ...enquiry, status: status as Enquiry['status'] })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this enquiry?')) return
    const supabase = createClient()
    await supabase.auth.refreshSession()
    await supabase.from('enquiries').delete().eq('id', id)
    router.push('/admin/enquiries')
  }

  if (loading) return (
    <div
      className="flex items-center justify-center h-screen admin-dark"
      style={{ backgroundColor: '#0d0d0d' }}
    >
      <p
        className="font-body text-xs tracking-widest uppercase"
        style={{ color: 'rgba(245,240,232,0.3)' }}
      >
        Loading…
      </p>
    </div>
  )

  if (!enquiry) return null

  return (
    <div
      className="h-[calc(100vh-56px)] lg:h-screen overflow-hidden admin-dark"
      style={{ backgroundColor: '#0d0d0d' }}
    >
      <EnquiryDetail
        enquiry={enquiry}
        onStatusUpdate={handleStatusUpdate}
        onDelete={handleDelete}
        showBack
        onBack={() => router.push('/admin/enquiries')}
      />
    </div>
  )
}