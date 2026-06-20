'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, MailOpen, Archive, Trash2 } from 'lucide-react'
import { formatRelative } from '@/lib/utils/formatters'
import toast from 'react-hot-toast'
import type { Enquiry } from '@/types'

export function EnquiryDetail({
  enquiry,
  onStatusUpdate,
  onDelete,
  showBack = false,
  onBack,
}: {
  enquiry:        Enquiry
  onStatusUpdate: (id: string, status: string) => void
  onDelete:       (id: string) => void
  showBack?:      boolean
  onBack?:        () => void
}) {
  const [reply,        setReply]        = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [replySent,    setReplySent]    = useState(!!enquiry.reply_message)

  async function handleSendReply() {
    if (!reply.trim()) { toast.error('Write a reply first.'); return }
    setSendingReply(true)
    const supabase = createClient()
    await supabase.auth.refreshSession()

    try {
      const { error: dbError } = await supabase
        .from('enquiries')
        .update({
          reply_message: reply.trim(),
          replied_at:    new Date().toISOString(),
          status:        'replied',
        })
        .eq('id', enquiry.id)

      if (dbError) throw dbError

      const res = await fetch('/api/email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          type:         'enquiry_reply',
          clientEmail:  enquiry.email,
          clientName:   enquiry.name,
          replyMessage: reply.trim(),
          enquiryId:    enquiry.id,
        }),
      })

      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'Email failed')

      onStatusUpdate(enquiry.id, 'replied')
      setReplySent(true)
      toast.success('Reply sent.')
    } catch (err) {
      console.error(err)
      toast.error('Failed to send reply.')
    } finally {
      setSendingReply(false)
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#0d0d0d' }}>

      {/* Header */}
      <div
        className="px-5 md:px-8 py-5 border-b shrink-0 flex items-start justify-between gap-4"
        style={{ borderColor: 'rgba(184,146,74,0.12)', backgroundColor: '#111111' }}
      >
        <div className="flex items-start gap-3 min-w-0">
          {showBack && (
            <button
              onClick={onBack}
              className="shrink-0 mt-0.5 transition-opacity hover:opacity-60"
              style={{ color: 'rgba(245,240,232,0.4)' }}
            >
              ←
            </button>
          )}
          <div className="min-w-0">
            <p className="font-display text-xl mb-1 truncate" style={{ color: '#f5f0e8' }}>
              {enquiry.name}
            </p>
            <a
              href={`mailto:${enquiry.email}`}
              className="font-body text-xs"
              style={{ color: '#b8924a' }}
            >
              {enquiry.email}
            </a>
            {enquiry.phone && (
              <p className="font-body text-xs mt-0.5" style={{ color: 'rgba(245,240,232,0.4)' }}>
                {enquiry.phone}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {enquiry.status !== 'archived' && (
            <button
              onClick={() => onStatusUpdate(enquiry.id, 'archived')}
              className="p-2 transition-opacity hover:opacity-60"
              style={{ color: 'rgba(245,240,232,0.3)' }}
              title="Archive"
            >
              <Archive size={14} />
            </button>
          )}
          <button
            onClick={() => onDelete(enquiry.id)}
            className="p-2 hover:text-red-400 transition-colors"
            style={{ color: 'rgba(245,240,232,0.3)' }}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Meta */}
      <div
        className="px-5 md:px-8 py-3 border-b flex items-center gap-6 flex-wrap"
        style={{ borderColor: 'rgba(184,146,74,0.08)' }}
      >
        <div>
          <span
            className="font-body text-[8px] tracking-widest uppercase block mb-0.5"
            style={{ color: 'rgba(245,240,232,0.3)' }}
          >
            Received
          </span>
          <span className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.6)' }}>
            {formatRelative(enquiry.created_at)}
          </span>
        </div>
        <div>
          <span
            className="font-body text-[8px] tracking-widest uppercase block mb-0.5"
            style={{ color: 'rgba(245,240,232,0.3)' }}
          >
            Status
          </span>
          <span
            className="font-body text-[9px] tracking-widest uppercase px-2 py-0.5 inline-block"
            style={{
              backgroundColor:
                enquiry.status === 'new'     ? 'rgba(184,146,74,0.15)' :
                enquiry.status === 'replied' ? 'rgba(74,184,74,0.12)'  :
                'rgba(255,255,255,0.06)',
              color:
                enquiry.status === 'new'     ? '#b8924a' :
                enquiry.status === 'replied' ? '#6ee26e' :
                'rgba(245,240,232,0.4)',
            }}
          >
            {enquiry.status}
          </span>
        </div>
      </div>

      {/* Message + Reply */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6">
        <p
          className="font-body text-[9px] tracking-widest uppercase mb-3"
          style={{ color: 'rgba(245,240,232,0.25)' }}
        >
          Message
        </p>
        <p
          className="font-body text-sm leading-loose whitespace-pre-wrap mb-8"
          style={{ color: 'rgba(245,240,232,0.7)' }}
        >
          {enquiry.message}
        </p>

        {/* Previous reply */}
        {enquiry.reply_message && (
          <div
            className="p-4 border-l-2 mb-8"
            style={{ borderColor: '#b8924a', backgroundColor: 'rgba(184,146,74,0.05)' }}
          >
            <p
              className="font-body text-[9px] tracking-widest uppercase mb-2"
              style={{ color: '#b8924a' }}
            >
              Your reply · {enquiry.replied_at ? formatRelative(enquiry.replied_at) : ''}
            </p>
            <p className="font-body text-sm leading-loose" style={{ color: 'rgba(245,240,232,0.6)' }}>
              {enquiry.reply_message}
            </p>
          </div>
        )}

        {/* Reply composer */}
        {!replySent ? (
          <div>
            <p
              className="font-body text-[9px] tracking-widest uppercase mb-3"
              style={{ color: 'rgba(245,240,232,0.3)' }}
            >
              Reply via Dashboard
            </p>
            <textarea
              rows={5}
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder={`Hi ${enquiry.name.split(' ')[0]}, thank you for reaching out…`}
              className="w-full bg-transparent border py-3 px-4 font-body text-sm focus:outline-none resize-none mb-4"
              style={{ borderColor: 'rgba(184,146,74,0.2)', color: '#f5f0e8' }}
            />
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleSendReply}
                disabled={sendingReply}
                className="flex items-center gap-2 font-body text-[10px] tracking-widest uppercase px-6 py-3 transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: '#b8924a', color: '#0d0d0d' }}
              >
                <Mail size={12} />
                {sendingReply ? 'Sending…' : 'Send Reply'}
              </button>
              <a
                href={`mailto:${enquiry.email}?subject=Re: IHE'RA Enquiry`}
                className="flex items-center gap-2 font-body text-[10px] tracking-widest uppercase px-6 py-3 border transition-colors"
                style={{ borderColor: 'rgba(184,146,74,0.3)', color: '#b8924a' }}
              >
                <MailOpen size={12} />
                Open in Mail App
              </a>
            </div>
          </div>
        ) : (
          <div
            className="p-4 border"
            style={{ borderColor: 'rgba(74,184,74,0.2)', backgroundColor: 'rgba(74,184,74,0.06)' }}
          >
            <p className="font-body text-xs" style={{ color: '#6ee26e' }}>
              ✓ Reply sent to {enquiry.email}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}