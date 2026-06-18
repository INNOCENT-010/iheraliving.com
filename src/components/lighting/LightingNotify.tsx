'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LightingNotify() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  async function handleNotify() {
    if (!email || !email.includes('@')) {
      toast.error('Enter a valid email.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    await supabase.from('enquiries').insert({
      name:    'Lighting Notification',
      email,
      message: "Requested notification for IHE'RA Lighting collection launch.",
    })
    setDone(true)
    setLoading(false)
  }

  return (
    <div
      className="mt-24 px-8 md:px-16 max-w-screen-xl mx-auto pt-12 border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      {done ? (
        <div className="flex items-center gap-4">
          <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
          <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
            You&apos;ll be among the first to know.
          </p>
        </div>
      ) : (
        <div className="max-w-sm">
          <p
            className="font-body text-[9px] tracking-widest uppercase mb-5"
            style={{ color: 'var(--text-faint)' }}
          >
            Notify me when lighting launches
          </p>
          <div className="flex gap-0">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNotify()}
              className="flex-1 px-0 py-3 font-body text-sm focus:outline-none border-b transition-colors duration-300 bg-transparent"
              style={{ borderColor: 'var(--border-soft)', color: 'var(--text)' }}
            />
            <button
              onClick={handleNotify}
              disabled={loading}
              className="font-body text-[9px] tracking-widest uppercase px-8 py-3 ml-4 transition-colors duration-300 disabled:opacity-50"
              style={{ backgroundColor: 'var(--brass)', color: 'var(--bg)' }}
            >
              {loading ? '...' : 'Notify'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}