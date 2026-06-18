'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/types'

const FILTERS = [
  { key: 'all',      label: 'All'      },
  { key: 'surfaces', label: 'Surfaces' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'objects',  label: 'Objects'  },
  { key: 'textiles', label: 'Textiles' },
  { key: 'bespoke',  label: 'Bespoke'  },
]

export default function CollectionMasonry({ products }: { products: Product[] }) {
  const [active, setActive] = useState('all')
  const [hovered, setHovered] = useState<string | null>(null)

  const filtered = active === 'all'
    ? products
    : products.filter(p => p.category === active)

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>

      {/* Header */}
      <div
        className="px-8 md:px-16 pt-8 pb-10 border-b max-w-screen-xl mx-auto"
        style={{ borderColor: 'var(--border)' }}
      >
        <p
          className="font-body text-[9px] tracking-widest uppercase mb-3"
          style={{ color: 'var(--brass)' }}
        >
          IHE&apos;RA
        </p>
        <h1
          className="font-display mb-8"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            color:    'var(--text)',
            lineHeight: 1,
          }}
        >
          The Collection
        </h1>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {FILTERS.map(filter => {
            const count = filter.key === 'all'
              ? products.length
              : products.filter(p => p.category === filter.key).length
            if (count === 0 && filter.key !== 'all') return null
            const isActive = active === filter.key
            return (
              <button
                key={filter.key}
                onClick={() => setActive(filter.key)}
                className="font-body text-[9px] tracking-widest uppercase px-4 py-2 transition-all duration-200"
                style={{
                  backgroundColor: isActive ? 'var(--brass)' : 'transparent',
                  color:           isActive ? 'var(--bg)'    : 'var(--text-faint)',
                  border:          `1px solid ${isActive ? 'var(--brass)' : 'var(--border)'}`,
                }}
              >
                {filter.label}
                <span
                  className="ml-1.5 font-mono"
                  style={{
                    fontSize: '8px',
                    opacity:  isActive ? 0.7 : 0.4,
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="px-8 md:px-16 py-12 max-w-screen-xl mx-auto">
        {filtered.length === 0 ? (
          <div
            className="py-40 text-center border"
            style={{ borderColor: 'var(--border)' }}
          >
            <p
              className="font-display text-2xl italic"
              style={{ color: 'var(--text-faint)' }}
            >
              Curation in progress.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filtered.map((product, i) => {
              const tall   = i % 5 === 0
              const isHov  = hovered === product.id
              return (
                <Link
                  key={product.id}
                  href={`/${product.category}/${product.slug}`}
                  className="block break-inside-avoid group"
                  onMouseEnter={() => setHovered(product.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Image */}
                  <div
                    className="relative overflow-hidden w-full"
                    style={{
                      aspectRatio:     tall ? '3/4' : '4/3',
                      backgroundColor: 'var(--bg-card)',
                      maxHeight:       '480px',
                    }}
                  >
                    {product.cover_image ? (
                      <img
                        src={product.cover_image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700"
                        style={{ transform: isHov ? 'scale(1.04)' : 'scale(1)' }}
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: 'var(--bg-card)' }}
                      >
                        <span
                          className="font-display text-xl"
                          style={{ color: 'var(--text-faint)' }}
                        >
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

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex flex-col justify-end p-4 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                        opacity:    isHov ? 1 : 0,
                      }}
                    >
                      <p
                        className="font-body text-[8px] tracking-widest uppercase mb-1"
                        style={{ color: 'rgba(245,240,232,0.6)' }}
                      >
                        {product.category}
                      </p>
                      <p
                        className="font-display text-base leading-tight"
                        style={{ color: '#f5f0e8' }}
                      >
                        {product.name}
                      </p>
                      {product.tagline && (
                        <p
                          className="font-body text-xs mt-1"
                          style={{ color: 'rgba(245,240,232,0.5)' }}
                        >
                          {product.tagline}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Text below */}
                  <div className="pt-3 pb-1">
                    <p
                      className="font-body text-[8px] tracking-widest uppercase mb-1"
                      style={{ color: 'var(--brass)' }}
                    >
                      {product.category}
                    </p>
                    <h3
                      className="font-display text-base leading-snug transition-colors duration-300"
                      style={{ color: isHov ? 'var(--brass)' : 'var(--text)' }}
                    >
                      {product.name}
                    </h3>
                    {product.tagline && (
                      <p
                        className="font-body text-xs mt-1 line-clamp-1"
                        style={{ color: 'var(--text-faint)' }}
                      >
                        {product.tagline}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}