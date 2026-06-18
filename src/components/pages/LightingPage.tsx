'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LightingPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  async function handleNotify() {
    if (!email || !email.includes('@')) { toast.error('Enter a valid email.'); return }
    setLoading(true)
    const supabase = createClient()
    await supabase.from('enquiries').insert({ name: 'Lighting Notification', email, message: "Requested notification for IHE'RA Lighting collection launch." })
    setDone(true)
    setLoading(false)
  }

  return (
    <div className="py-24">
      <div className="border py-48 text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="font-display text-3xl italic mb-10" style={{ color: 'var(--text-faint)' }}>Coming Soon</p>
        {done ? (
          <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>You'll be among the first to know.</p>
        ) : (
          <div className="flex gap-0 max-w-xs mx-auto">
            <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNotify()}
              className="flex-1 px-0 py-3 font-body text-sm focus:outline-none border-b bg-transparent"
              style={{ borderColor: 'var(--border-soft)', color: 'var(--text)' }} />
            <button onClick={handleNotify} disabled={loading}
              className="font-body text-[9px] tracking-widest uppercase px-6 py-3 ml-4 disabled:opacity-50"
              style={{ backgroundColor: 'var(--brass)', color: 'var(--bg)' }}>
              {loading ? '…' : 'Notify'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}