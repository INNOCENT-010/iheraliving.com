'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.startsWith('/admin')) return
    if (pathname.startsWith('/auth'))  return

    console.log('Tracking page view:', pathname)

    fetch('/api/pageview', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        path:     pathname,
        referrer: document.referrer || null,
      }),
    })
    .then(res => res.json())
    .then(data => console.log('Page view response:', data))
    .catch(err => console.error('Page view fetch error:', err))
  }, [pathname])

  return null
}