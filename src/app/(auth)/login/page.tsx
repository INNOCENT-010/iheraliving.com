'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const router = useRouter()

  async function handleLogin() {
    if (!email || !password) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-8"
      style={{ backgroundColor: '#0d0d0d' }}
    >
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-12">
          <p
            className="font-display text-3xl tracking-widest mb-2"
            style={{ color: '#f5f0e8' }}
          >
            IHE&apos;RA
          </p>
          <p
            className="font-body text-[10px] tracking-widest uppercase"
            style={{ color: '#b8924a' }}
          >
            Admin Portal
          </p>
        </div>

        {/* Form */}
        <div
          className="p-10 flex flex-col gap-6 border"
          style={{ borderColor: 'rgba(184,146,74,0.2)' }}
        >
          {/* Email */}
          <div>
            <label
              className="font-body text-[9px] tracking-widest uppercase block mb-3"
              style={{ color: 'rgba(245,240,232,0.4)' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoComplete="email"
              className="w-full bg-transparent py-3 font-body text-sm focus:outline-none transition-colors border-b"
              style={{
                borderColor: 'rgba(58,58,58,0.8)',
                color:       '#f5f0e8',
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="font-body text-[9px] tracking-widest uppercase block mb-3"
              style={{ color: 'rgba(245,240,232,0.4)' }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
              className="w-full bg-transparent py-3 font-body text-sm focus:outline-none transition-colors border-b"
              style={{
                borderColor: 'rgba(58,58,58,0.8)',
                color:       '#f5f0e8',
              }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-2 font-body text-[11px] tracking-widest uppercase py-4 transition-colors disabled:opacity-50"
            style={{
              backgroundColor: '#b8924a',
              color:           '#0d0d0d',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}