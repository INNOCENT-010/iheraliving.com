'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, MailOpen, Archive, Trash2 } from 'lucide-react'
import { formatRelative } from '@/lib/utils/formatters'
import toast from 'react-hot-toast'
import type { Enquiry } from '@/types'

const STATUS_FILTERS = ['all', 'new', 'read', 'replied', 'archived'] as const

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState<string>('all')
  const [selected,  setSelected]  = useState<Enquiry | null>(null)

  async function fetchEnquiries() {
    setLoading(true)
    const supabase = createClient()

    // Force session refresh before query
    const { error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError) console.error('Session refresh error:', refreshError.message)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('No session found on enquiries page')
      setLoading(false)
      return
    }

    let query = supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'all') query = query.eq('status', filter)

    const { data, error } = await query
    if (error) console.error('Enquiries fetch error:', error.message)
    setEnquiries((data as Enquiry[]) || [])
    setLoading(false)
  }

  useEffect(() => { fetchEnquiries() }, [filter])

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    await supabase.auth.refreshSession()
    const { error } = await supabase
      .from('enquiries')
      .update({ status })
      .eq('id', id)
    if (error) { toast.error('Failed.'); return }
    setEnquiries(prev =>
      prev.map(e => e.id === id ? { ...e, status: status as Enquiry['status'] } : e)
    )
    if (selected?.id === id) {
      setSelected(prev => prev ? { ...prev, status: status as Enquiry['status'] } : null)
    }
    toast.success('Updated.')
  }

  async function deleteEnquiry(id: string) {
    if (!confirm('Delete this enquiry?')) return
    const supabase = createClient()
    await supabase.auth.refreshSession()
    await supabase.from('enquiries').delete().eq('id', id)
    setEnquiries(prev => prev.filter(e => e.id !== id))
    if (selected?.id === id) setSelected(null)
    toast.success('Deleted.')
  }

  async function openEnquiry(enquiry: Enquiry) {
    setSelected(enquiry)
    if (enquiry.status === 'new') await updateStatus(enquiry.id, 'read')
  }

  const newCount = enquiries.filter(e => e.status === 'new').length

  return (
    <div
      className="flex h-[calc(100vh-64px)] lg:h-screen overflow-hidden admin-dark"
      style={{ backgroundColor: '#0d0d0d' }}
    >
      {/* ── Left: List ── */}
      <div
        className="w-full lg:w-[380px] shrink-0 flex flex-col border-r overflow-hidden"
        style={{ borderColor: 'rgba(184,146,74,0.12)' }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'rgba(184,146,74,0.12)', backgroundColor: '#111111' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-display text-xl" style={{ color: '#f5f0e8' }}>Enquiries</p>
              {newCount > 0 && (
                <p
                  className="font-body text-[9px] tracking-widest uppercase mt-0.5"
                  style={{ color: '#b8924a' }}
                >
                  {newCount} new
                </p>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-0 border-b overflow-x-auto" style={{ borderColor: 'rgba(184,146,74,0.1)' }}>
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="font-body text-[8px] tracking-widest uppercase px-3 py-2 transition-colors capitalize border-b-2 -mb-px shrink-0"
                style={{
                  color:       filter === f ? '#b8924a' : 'rgba(245,240,232,0.3)',
                  borderColor: filter === f ? '#b8924a' : 'transparent',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 flex flex-col gap-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : enquiries.length === 0 ? (
            <div className="p-6 text-center mt-8">
              <p className="font-body text-sm" style={{ color: 'rgba(245,240,232,0.2)' }}>
                No enquiries yet.
              </p>
            </div>
          ) : (
            enquiries.map(enquiry => (
              <div
                key={enquiry.id}
                onClick={() => openEnquiry(enquiry)}
                className="px-5 py-4 border-b cursor-pointer transition-colors"
                style={{
                  borderColor:     'rgba(184,146,74,0.06)',
                  backgroundColor: selected?.id === enquiry.id
                    ? 'rgba(184,146,74,0.08)'
                    : enquiry.status === 'new'
                      ? 'rgba(184,146,74,0.04)'
                      : 'transparent',
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p
                    className="font-body text-sm truncate"
                    style={{ color: enquiry.status === 'new' ? '#f5f0e8' : 'rgba(245,240,232,0.7)' }}
                  >
                    {enquiry.name}
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {enquiry.status === 'new' && (
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: '#b8924a' }}
                      />
                    )}
                    <span className="font-body text-[8px]" style={{ color: 'rgba(245,240,232,0.25)' }}>
                      {formatRelative(enquiry.created_at)}
                    </span>
                  </div>
                </div>
                <p className="font-body text-xs truncate" style={{ color: 'rgba(245,240,232,0.35)' }}>
                  {enquiry.email}
                </p>
                <p className="font-body text-xs mt-1 line-clamp-2" style={{ color: 'rgba(245,240,232,0.3)' }}>
                  {enquiry.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right: Detail ── */}
      <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
        {selected ? (
          <div className="flex flex-col h-full">
            <div
              className="px-8 py-5 border-b shrink-0 flex items-start justify-between"
              style={{ borderColor: 'rgba(184,146,74,0.12)', backgroundColor: '#111111' }}
            >
              <div>
                <p className="font-display text-xl mb-1" style={{ color: '#f5f0e8' }}>
                  {selected.name}
                </p>
                <a
                  href={`mailto:${selected.email}`}
                  className="font-body text-xs"
                  style={{ color: '#b8924a' }}
                >
                  {selected.email}
                </a>
                {selected.phone && (
                  <p className="font-body text-xs mt-1" style={{ color: 'rgba(245,240,232,0.4)' }}>
                    {selected.phone}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selected.status !== 'replied' && (
                  <button
                    onClick={() => updateStatus(selected.id, 'replied')}
                    className="flex items-center gap-2 font-body text-[9px] tracking-widest uppercase px-4 py-2"
                    style={{ backgroundColor: 'rgba(184,146,74,0.15)', color: '#b8924a' }}
                  >
                    <MailOpen size={11} />
                    Mark Replied
                  </button>
                )}
                {selected.status !== 'archived' && (
                  <button
                    onClick={() => updateStatus(selected.id, 'archived')}
                    className="p-2"
                    style={{ color: 'rgba(245,240,232,0.3)' }}
                    title="Archive"
                  >
                    <Archive size={14} />
                  </button>
                )}
                <button
                  onClick={() => deleteEnquiry(selected.id)}
                  className="p-2 hover:text-red-400 transition-colors"
                  style={{ color: 'rgba(245,240,232,0.3)' }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div
              className="px-8 py-4 border-b flex items-center gap-6"
              style={{ borderColor: 'rgba(184,146,74,0.08)' }}
            >
              <div>
                <span
                  className="font-body text-[8px] tracking-widest uppercase block mb-1"
                  style={{ color: 'rgba(245,240,232,0.3)' }}
                >
                  Received
                </span>
                <span className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.6)' }}>
                  {formatRelative(selected.created_at)}
                </span>
              </div>
              <div>
                <span
                  className="font-body text-[8px] tracking-widest uppercase block mb-1"
                  style={{ color: 'rgba(245,240,232,0.3)' }}
                >
                  Status
                </span>
                <span
                  className="font-body text-[9px] tracking-widests uppercase px-2 py-0.5 inline-block"
                  style={{
                    backgroundColor:
                      selected.status === 'new'     ? 'rgba(184,146,74,0.15)' :
                      selected.status === 'replied' ? 'rgba(74,184,74,0.12)'  :
                      'rgba(255,255,255,0.06)',
                    color:
                      selected.status === 'new'     ? '#b8924a' :
                      selected.status === 'replied' ? '#6ee26e' :
                      'rgba(245,240,232,0.4)',
                  }}
                >
                  {selected.status}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8">
              <p
                className="font-body text-sm leading-loose whitespace-pre-wrap"
                style={{ color: 'rgba(245,240,232,0.7)' }}
              >
                {selected.message}
              </p>
            </div>

            <div
              className="px-8 py-5 border-t shrink-0"
              style={{ borderColor: 'rgba(184,146,74,0.12)' }}
            >
              <a
                href={`mailto:${selected.email}?subject=Re: IHE'RA Enquiry`}
                className="inline-flex items-center gap-3 font-body text-[10px] tracking-widests uppercase px-8 py-3 transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#b8924a', color: '#0d0d0d' }}
              >
                <Mail size={12} />
                Reply via Email
              </a>
            </div>
          </div>
        ) : (
          <div
            className="flex-1 flex items-center justify-center"
            style={{ color: 'rgba(245,240,232,0.2)' }}
          >
            <div className="text-center">
              <div className="w-8 h-px mx-auto mb-4" style={{ backgroundColor: 'rgba(184,146,74,0.3)' }} />
              <p className="font-body text-[10px] tracking-widests uppercase">
                Select an enquiry
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}