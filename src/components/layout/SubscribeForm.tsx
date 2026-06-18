'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SubscribeForm() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  async function handleSubscribe() {
    if (!email || !email.includes('@')) {
      toast.error('Enter a valid email.')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('subscribers')
        .upsert(
          { email: email.trim().toLowerCase(), source: 'footer' },
          { onConflict: 'email' }
        )
      if (error) {
        console.error('Subscribe error:', error.message)
        toast.error('Could not subscribe. Please try again.')
        return
      }
      setDone(true)
      toast.success('You are on the list.')
    } catch (err) {
      console.error('Subscribe exception:', err)
      toast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <p className="font-body text-xs" style={{ color: 'var(--text-faint)' }}>
      You are on the list.
    </p>
  )

  return (
    <div className="flex flex-col gap-2">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
        placeholder="your@email.com"
        className="bg-transparent border-b py-2 font-body text-xs focus:outline-none transition-colors"
        style={{ borderColor: 'var(--border-soft)', color: 'var(--text)' }}
      />
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="font-body text-[9px] tracking-widest uppercase self-start transition-opacity hover:opacity-70 disabled:opacity-40"
        style={{ color: 'var(--brass)' }}
      >
        {loading ? 'Subscribing…' : 'Subscribe →'}
      </button>
    </div>
  )
}