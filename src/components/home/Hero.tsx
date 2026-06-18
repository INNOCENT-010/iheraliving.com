'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface HeroProps {
  heroImage: string
}

export default function Hero({ heroImage }: HeroProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${heroImage}')`,
          transform: loaded ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform 8s ease-out',
        }}
      />

      {/* Dark overlay only — no gradient flush */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end pb-16 px-10 md:px-20">
        <div
          className={cn(
            'transition-all duration-1000',
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          )}
          style={{ transitionDelay: '300ms' }}
        >
          <h1
            className="font-display leading-none tracking-tight"
            style={{
              fontSize:  'clamp(5rem, 14vw, 13rem)',
              color:     '#f5f0e8',
            }}
          >
            IHE&apos;RA
          </h1>
        </div>

        <div
          className={cn(
            'flex items-center justify-between mt-4 transition-all duration-1000',
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
          style={{ transitionDelay: '600ms' }}
        >
          <p
            className="font-body text-[10px] tracking-widest uppercase"
            style={{ color: 'rgba(245,240,232,0.6)' }}
          >
            Curated Living
          </p>
          <Link
            href="/collection"
            className="font-body text-[10px] tracking-widest uppercase flex items-center gap-3 group transition-colors duration-300"
            style={{ color: 'rgba(245,240,232,0.7)' }}
          >
            Enter Collection
            <span
              className="block h-px transition-all duration-500 w-8 group-hover:w-14"
              style={{ backgroundColor: 'currentColor' }}
            />
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={cn(
          'absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{ transitionDelay: '1200ms' }}
      >
        <div
          className="w-px h-10 animate-pulse mx-auto"
          style={{ background: 'linear-gradient(to bottom, rgba(245,240,232,0.5), transparent)' }}
        />
      </div>
    </section>
  )
}