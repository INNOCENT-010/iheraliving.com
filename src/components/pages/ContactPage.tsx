'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function ContactForm() {
  const searchParams = useSearchParams()
  const productName  = searchParams.get('product') || ''

  const [form, setForm] = useState({
    name:    '',
    email:   '',
    phone:   '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  useEffect(() => {
    if (productName) {
      setForm(prev => ({
        ...prev,
        message: `I am interested in ${productName} and would like to learn more about availability, pricing, and installation options.`,
      }))
    }
  }, [productName])

  async function handleSubmit() {
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill required fields.')
      return
    }
    setLoading(true)

    try {
      const supabase = createClient()

      const { data: enquiry, error } = await supabase
        .from('enquiries')
        .insert([{
          name:    form.name,
          email:   form.email,
          phone:   form.phone || null,
          message: form.message,
        }])
        .select()
        .single()

      if (error) {
        console.error('Enquiry error:', error.message)
        toast.error(`Could not submit: ${error.message}`)
        return
      }

      // Fire emails non-blocking
      if (enquiry?.id) {
        fetch('/api/email', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ type: 'enquiry_notify', enquiryId: enquiry.id }),
        }).catch(console.error)

        fetch('/api/email', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            type:        'enquiry_confirm',
            clientEmail: form.email,
            clientName:  form.name,
          }),
        }).catch(console.error)
      }

      setSent(true)
    } catch (err) {
      console.error('Submit exception:', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div
      className="min-h-screen pt-32 pb-24 flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="text-center max-w-md px-8">
        <div
          className="w-12 h-px mx-auto mb-8"
          style={{ backgroundColor: 'var(--brass)' }}
        />
        <h2
          className="font-display text-3xl mb-4"
          style={{ color: 'var(--text)' }}
        >
          Message Received
        </h2>
        <p
          className="font-body text-sm leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          Thank you for reaching out. We will be in contact within 48 hours.
        </p>
      </div>
    </div>
  )

  return (
    <div
      className="min-h-screen pt-32 pb-24"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <div className="max-w-screen-xl mx-auto px-8 md:px-16">

        {/* Header */}
        <div className="mb-14">
          {productName ? (
            <>
              <p
                className="font-body text-[9px] tracking-widest uppercase mb-3"
                style={{ color: 'var(--brass)' }}
              >
                Product Enquiry
              </p>
              <h1
                className="font-display text-4xl md:text-5xl"
                style={{ color: 'var(--text)' }}
              >
                {productName}
              </h1>
              <p
                className="font-body text-sm mt-2"
                style={{ color: 'var(--text-faint)' }}
              >
                Complete the form below and we will be in touch shortly.
              </p>
            </>
          ) : (
            <>
              <p
                className="font-body text-[9px] tracking-widest uppercase mb-3"
                style={{ color: 'var(--brass)' }}
              >
                Get in Touch
              </p>
              <h1
                className="font-display text-4xl md:text-5xl"
                style={{ color: 'var(--text)' }}
              >
                Contact
              </h1>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">

          {/* Contact info */}
          <div className="flex flex-col justify-between gap-12">
            <div className="flex flex-col gap-8">
              {[
                { label: 'Email',     value: 'iheraliving@gmail.com', href: 'mailto:iheraliving@gmail.com'    },
                { label: 'Instagram', value: '@iheraliving',          href: 'https://instagram.com/iheraliving' },
                { label: 'WhatsApp',  value: 'Chat with us',          href: 'https://wa.me/2349039463077'       },
              ].map(({ label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-5 group"
                >
                  <span
                    className="font-body text-[8px] tracking-widest uppercase w-16 shrink-0"
                    style={{ color: 'var(--brass)' }}
                  >
                    {label}
                  </span>
                  <span
                    className="font-body text-sm transition-opacity group-hover:opacity-60"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {value}
                  </span>
                </a>
              ))}
            </div>
            <p
              className="font-display text-lg italic"
              style={{ color: 'var(--text-faint)' }}
            >
              Lagos, Nigeria
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-8">
            {[
              { key: 'name',  label: 'Full Name *',     type: 'text'  },
              { key: 'email', label: 'Email Address *', type: 'email' },
              { key: 'phone', label: 'Phone',           type: 'tel'   },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label
                  className="font-body text-[9px] tracking-widest uppercase block mb-3"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-transparent py-3 font-body text-sm focus:outline-none border-b transition-colors"
                  style={{ borderColor: 'var(--border-soft)', color: 'var(--text)' }}
                />
              </div>
            ))}

            <div>
              <label
                className="font-body text-[9px] tracking-widest uppercase block mb-3"
                style={{ color: 'var(--text-faint)' }}
              >
                Message *
              </label>
              <textarea
                rows={5}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full bg-transparent py-3 font-body text-sm focus:outline-none border-b resize-none transition-colors"
                style={{ borderColor: 'var(--border-soft)', color: 'var(--text)' }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="self-start font-body text-[10px] tracking-widest uppercase px-10 py-4 disabled:opacity-50 transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--brass)', color: 'var(--bg)' }}
            >
              {loading ? 'Sending…' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-32" style={{ backgroundColor: 'var(--bg)' }} />
    }>
      <ContactForm />
    </Suspense>
  )
}