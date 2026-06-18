'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Send, Users, Clock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Campaign {
  id:              string
  subject:         string
  recipient_count: number
  sent_at:         string
}

interface Recipient {
  email: string
  name:  string
}

export default function MarketingPage() {
  const [subject,     setSubject]     = useState('')
  const [message,     setMessage]     = useState('')
  const [sending,     setSending]     = useState(false)
  const [campaigns,   setCampaigns]   = useState<Campaign[]>([])
  const [recipients,  setRecipients]  = useState<Recipient[]>([])
  const [selected,    setSelected]    = useState<string[]>([])
  const [allSelected, setAllSelected] = useState(true)
  const [preview,     setPreview]     = useState(false)
  const [loading,     setLoading]     = useState(true)

  async function loadData() {
  const supabase = createClient()
  await supabase.auth.refreshSession()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    console.error('No session on marketing page')
    setLoading(false)
    return
  }

  const [{ data: enquiries }, { data: subscribers }, { data: cams }] = await Promise.all([
    supabase.from('enquiries').select('email, name').order('created_at', { ascending: false }),
    supabase.from('subscribers').select('email, name').order('created_at', { ascending: false }),
    supabase.from('email_campaigns').select('*').order('sent_at', { ascending: false }).limit(20),
  ])

  const seen   = new Set<string>()
  const merged: Recipient[] = []
  for (const e of [...(enquiries || []), ...(subscribers || [])]) {
    if (!e.email || seen.has(e.email)) continue
    seen.add(e.email)
    merged.push({ email: e.email, name: e.name || '' })
  }

  setRecipients(merged)
  setSelected(merged.map(r => r.email))
  setAllSelected(true)
  setCampaigns((cams as Campaign[]) || [])
  setLoading(false)
}

  useEffect(() => { loadData() }, [])

  function toggleRecipient(email: string) {
    setSelected(prev => {
      const next = prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
      setAllSelected(next.length === recipients.length)
      return next
    })
  }

  function toggleAll() {
    if (allSelected) {
      setSelected([])
      setAllSelected(false)
    } else {
      setSelected(recipients.map(r => r.email))
      setAllSelected(true)
    }
  }

  async function handleSend() {
    if (!subject.trim())  { toast.error('Add a subject.');   return }
    if (!message.trim())  { toast.error('Write a message.'); return }
    if (!selected.length) { toast.error('Select at least one recipient.'); return }

    if (!window.confirm(`Send to ${selected.length} recipient${selected.length > 1 ? 's' : ''}?`)) return

    setSending(true)
    try {
      const res = await fetch('/api/email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          type:       'marketing',
          subject:    subject.trim(),
          message:    message.trim(),
          recipients: selected,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (data.mock) {
        toast('Campaign saved. Add RESEND_API_KEY to .env.local to send real emails.', {
          icon:     '⚠️',
          duration: 6000,
        })
      } else {
        toast.success(`Sent to ${data.sent} recipient${data.sent !== 1 ? 's' : ''}.`)
      }

      setSubject('')
      setMessage('')
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Failed: ${msg}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="p-8 admin-dark"
      style={{ minHeight: '100vh', backgroundColor: '#0d0d0d' }}
    >
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl" style={{ color: '#f5f0e8' }}>Marketing</h1>
        <p
          className="font-body text-xs mt-1 tracking-wider"
          style={{ color: 'rgba(245,240,232,0.3)' }}
        >
          Compose and send emails to your client list
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ── Left — Compose ── */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* API key notice */}
          <div
            className="px-5 py-4 border flex items-start gap-3"
            style={{ borderColor: 'rgba(184,146,74,0.2)', backgroundColor: 'rgba(184,146,74,0.05)' }}
          >
            <Mail size={13} style={{ color: '#b8924a', marginTop: 1, flexShrink: 0 }} />
            <div>
              <p className="font-body text-xs" style={{ color: '#b8924a' }}>
                Email system is ready — add your Resend API key to go live
              </p>
              <p className="font-body text-[10px] mt-1 leading-relaxed" style={{ color: 'rgba(245,240,232,0.3)' }}>
                Add <code style={{ color: 'rgba(245,240,232,0.5)' }}>RESEND_API_KEY</code>,{' '}
                <code style={{ color: 'rgba(245,240,232,0.5)' }}>RESEND_FROM_EMAIL</code>, and{' '}
                <code style={{ color: 'rgba(245,240,232,0.5)' }}>ADMIN_EMAIL</code> to{' '}
                <code style={{ color: 'rgba(245,240,232,0.5)' }}>.env.local</code>.
                Campaigns are saved even without the key.
              </p>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="admin-label">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="New Arrivals — IHE'RA Surface Collection"
              className="admin-input mt-1 w-full"
            />
          </div>

          {/* Message */}
          <div>
            <label className="admin-label">Message *</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={`We are pleased to introduce our latest additions to the IHE'RA collection.\n\nVisit our site to explore the full range.`}
              rows={14}
              className="admin-input mt-1 w-full resize-none"
              style={{ lineHeight: 1.85 }}
            />
            <p className="font-body text-[9px] mt-1.5" style={{ color: 'rgba(245,240,232,0.18)' }}>
              Plain text — line breaks are preserved in the email.
            </p>
          </div>

          {/* Preview */}
          <div>
            <button
              onClick={() => setPreview(v => !v)}
              className="font-body text-[9px] tracking-widest uppercase mb-3 transition-colors"
              style={{ color: preview ? '#b8924a' : 'rgba(245,240,232,0.25)' }}
            >
              {preview ? '▲ Hide Preview' : '▼ Show Email Preview'}
            </button>

            {preview && (
              <div
                className="border overflow-auto"
                style={{
                  borderColor:     'rgba(184,146,74,0.15)',
                  backgroundColor: '#1a1a1a',
                  maxHeight:       '420px',
                }}
              >
                <div style={{ padding: '40px', fontFamily: 'Georgia, serif', maxWidth: '520px' }}>
                  <h1 style={{ fontSize: '22px', letterSpacing: '5px', color: '#b8924a', margin: '0 0 4px' }}>
                    IHE&apos;RA
                  </h1>
                  <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', margin: '0 0 28px' }}>
                    Curated Living
                  </p>
                  <div style={{ fontSize: '14px', lineHeight: 1.9, color: 'rgba(245,240,232,0.85)', whiteSpace: 'pre-wrap' }}>
                    {message || 'Your message will appear here...'}
                  </div>
                  <div style={{ marginTop: '28px' }}>
                    <span style={{ display: 'inline-block', background: '#b8924a', color: '#0d0d0d', padding: '12px 28px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase' }}>
                      Explore Collection
                    </span>
                  </div>
                  <p style={{ marginTop: '28px', fontSize: '10px', color: 'rgba(245,240,232,0.18)', lineHeight: 1.6 }}>
                    IHE&apos;RA — Curated Living · Lagos, Nigeria<br />
                    You are receiving this because you contacted IHE&apos;RA or subscribed on our website.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Send */}
          <div className="flex items-center gap-5 pt-1">
            <button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !message.trim() || !selected.length}
              className="admin-btn-primary flex items-center gap-2 disabled:opacity-40"
            >
              <Send size={12} />
              {sending
                ? 'Sending — please wait...'
                : `Send to ${selected.length} recipient${selected.length !== 1 ? 's' : ''}`
              }
            </button>
            {sending && (
              <p className="font-body text-[9px]" style={{ color: 'rgba(245,240,232,0.25)' }}>
                Do not close this tab
              </p>
            )}
          </div>
        </div>

        {/* ── Right ── */}
        <div className="flex flex-col gap-6">

          {/* Recipients */}
          <div className="border" style={{ borderColor: 'rgba(184,146,74,0.12)' }}>
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'rgba(184,146,74,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-center gap-2">
                <Users size={13} style={{ color: '#b8924a' }} />
                <span
                  className="font-body text-[9px] tracking-widest uppercase"
                  style={{ color: 'rgba(245,240,232,0.4)' }}
                >
                  Recipients
                </span>
              </div>
              <button
                onClick={toggleAll}
                className="font-body text-[8px] tracking-widest uppercase transition-colors"
                style={{ color: allSelected ? '#b8924a' : 'rgba(245,240,232,0.25)' }}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
              {loading ? (
                <div className="p-5 flex flex-col gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="h-10 animate-pulse"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                    />
                  ))}
                </div>
              ) : recipients.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.2)' }}>
                    No contacts yet. Enquiries and subscribers will appear here.
                  </p>
                </div>
              ) : (
                recipients.map(r => {
                  const isSelected = selected.includes(r.email)
                  return (
                    <div
                      key={r.email}
                      onClick={() => toggleRecipient(r.email)}
                      className="flex items-center gap-3 px-5 py-3 cursor-pointer border-b transition-colors"
                      style={{
                        borderColor:     'rgba(184,146,74,0.06)',
                        backgroundColor: isSelected ? 'rgba(184,146,74,0.05)' : 'transparent',
                      }}
                    >
                      <div
                        className="w-4 h-4 border flex items-center justify-center shrink-0 transition-colors"
                        style={{
                          borderColor:     isSelected ? '#b8924a' : 'rgba(245,240,232,0.2)',
                          backgroundColor: isSelected ? '#b8924a' : 'transparent',
                        }}
                      >
                        {isSelected && <CheckCircle size={10} color="#0d0d0d" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="font-body text-xs truncate"
                          style={{ color: '#f5f0e8' }}
                        >
                          {r.name || '—'}
                        </p>
                        <p
                          className="font-body text-[9px] truncate"
                          style={{ color: 'rgba(245,240,232,0.3)' }}
                        >
                          {r.email}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer count */}
            <div
              className="px-5 py-3 border-t"
              style={{ borderColor: 'rgba(184,146,74,0.08)' }}
            >
              <p className="font-body text-[9px]" style={{ color: 'rgba(245,240,232,0.22)' }}>
                {selected.length} of {recipients.length} selected
              </p>
            </div>
          </div>

          {/* Past campaigns */}
          <div className="border" style={{ borderColor: 'rgba(184,146,74,0.12)' }}>
            <div
              className="flex items-center gap-2 px-5 py-4 border-b"
              style={{ borderColor: 'rgba(184,146,74,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
            >
              <Clock size={13} style={{ color: '#b8924a' }} />
              <span
                className="font-body text-[9px] tracking-widest uppercase"
                style={{ color: 'rgba(245,240,232,0.4)' }}
              >
                Past Campaigns
              </span>
            </div>

            {campaigns.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.2)' }}>
                  No campaigns sent yet.
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto" style={{ maxHeight: '260px' }}>
                {campaigns.map(c => (
                  <div
                    key={c.id}
                    className="px-5 py-4 border-b"
                    style={{ borderColor: 'rgba(184,146,74,0.06)' }}
                  >
                    <p
                      className="font-body text-xs mb-1 truncate"
                      style={{ color: '#f5f0e8' }}
                    >
                      {c.subject}
                    </p>
                    <div className="flex items-center gap-3">
                      <span
                        className="font-body text-[9px]"
                        style={{ color: 'rgba(245,240,232,0.3)' }}
                      >
                        {c.recipient_count} recipient{c.recipient_count !== 1 ? 's' : ''}
                      </span>
                      <span style={{ color: 'rgba(245,240,232,0.15)' }}>·</span>
                      <span
                        className="font-body text-[9px]"
                        style={{ color: 'rgba(245,240,232,0.3)' }}
                      >
                        {new Date(c.sent_at).toLocaleDateString('en-GB', {
                          day:   '2-digit',
                          month: 'short',
                          year:  'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}