'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/types'

interface Props {
  product:    Product
  className?: string
}

export default function ProductCard({ product, className = '' }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`/${product.category}/${product.slug}`}
      className={`group block ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden w-full"
        style={{
          aspectRatio:     '4/3',
          backgroundColor: 'var(--bg-card)',
          maxHeight:       '320px',
        }}
      >
        {product.cover_image ? (
          <img
            src={product.cover_image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700"
            style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <span className="font-display text-2xl" style={{ color: 'var(--text-faint)' }}>
              IHE&apos;RA
            </span>
          </div>
        )}

        {product.status === 'coming_soon' && (
          <div className="absolute top-3 left-3">
            <span
              className="font-body text-[8px] tracking-widest uppercase px-2 py-1"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'var(--brass)' }}
            >
              Coming Soon
            </span>
          </div>
        )}

        {/* Mobile tap hint — shows on touch devices, hidden on hover */}
        <div
          className="absolute inset-0 flex items-end justify-end p-3 md:hidden"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }}
        >
          <span
            className="font-body text-[8px] tracking-widest uppercase px-2.5 py-1.5"
            style={{ backgroundColor: 'rgba(184,146,74,0.9)', color: '#0d0d0d' }}
          >
            View →
          </span>
        </div>

        {/* Desktop hover overlay */}
        <div
          className="absolute inset-0 hidden md:flex items-center justify-center transition-opacity duration-300"
          style={{
            backgroundColor: 'rgba(0,0,0,0.35)',
            opacity:         hovered ? 1 : 0,
          }}
        >
          <span
            className="font-body text-[9px] tracking-widest uppercase px-5 py-2.5 border"
            style={{ borderColor: 'rgba(245,240,232,0.6)', color: '#f5f0e8' }}
          >
            View Product
          </span>
        </div>

        {/* Bottom brass line on hover — desktop only */}
        <div
          className="absolute bottom-0 left-0 h-px transition-all duration-500 hidden md:block"
          style={{
            width:           hovered ? '100%' : '0%',
            backgroundColor: 'var(--brass)',
          }}
        />
      </div>

      {/* Text */}
      <div className="pt-3">
        <p
          className="font-body text-[8px] tracking-widest uppercase mb-1"
          style={{ color: 'var(--brass)' }}
        >
          {product.category}
        </p>
        <h3
          className="font-display text-base leading-snug transition-colors duration-300"
          style={{ color: hovered ? 'var(--brass)' : 'var(--text)' }}
        >
          {product.name}
        </h3>
        {product.tagline && (
          <p
            className="font-body text-xs mt-1 leading-relaxed line-clamp-1"
            style={{ color: 'var(--text-faint)' }}
          >
            {product.tagline}
          </p>
        )}
        <p
          className="font-body text-[9px] tracking-widest uppercase mt-2"
          style={{ color: 'var(--text-faint)' }}
        >
          {product.price_on_request ? 'Price on Request' : `₦${product.price?.toLocaleString()}`}
        </p>
      </div>
    </Link>
  )
}