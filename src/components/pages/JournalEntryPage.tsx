'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatDateLong } from '@/lib/utils/formatters'
import ProductCard from '@/components/ui/ProductCard'
import type { Product } from '@/types'

interface JournalEntry {
  id:           string
  title:        string
  slug:         string
  excerpt:      string | null
  content:      string | null
  cover_image:  string | null
  published_at: string | null
  read_time:    number
  tags:         string[]
}

export default function JournalEntryPage({
  entry,
  products,
}: {
  entry:    JournalEntry
  products: Product[]
}) {
  return (
    <div
      className="min-h-screen pt-32 pb-24"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <article className="max-w-3xl mx-auto px-8">
        <Link
          href="/journal"
          className="font-body text-[10px] tracking-widest uppercase mb-12 block transition-colors duration-300"
          style={{ color: 'var(--text-faint)' }}
        >
          ← Journal
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-6">
          <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>
            {formatDateLong(entry.published_at)}
          </span>
          <span style={{ color: 'var(--text-faint)' }}>·</span>
          <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>
            {entry.read_time} min read
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-display text-5xl md:text-6xl leading-tight mb-6"
          style={{ color: 'var(--text)' }}
        >
          {entry.title}
        </h1>

        {/* Excerpt */}
        {entry.excerpt && (
          <p
            className="font-body text-lg italic leading-relaxed mb-10"
            style={{ color: 'var(--text-muted)' }}
          >
            {entry.excerpt}
          </p>
        )}

        {/* Cover */}
        {entry.cover_image && (
          <div className="relative aspect-[16/9] mb-12 overflow-hidden">
            <Image
              src={entry.cover_image}
              alt={entry.title}
              fill
              className="object-cover"
              sizes="768px"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="journal-content font-body text-sm leading-loose"
          dangerouslySetInnerHTML={{ __html: entry.content || '' }}
        />

        {/* Tags */}
        {entry.tags?.length > 0 && (
          <div className="mt-12 pt-8 border-t flex flex-wrap gap-3" style={{ borderColor: 'var(--border)' }}>
            {entry.tags.map((tag: string) => (
              <span
                key={tag}
                className="font-body text-[9px] tracking-widest uppercase px-3 py-1.5 border"
                style={{ color: 'var(--brass)', borderColor: 'var(--border)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Linked products */}
      {products?.length > 0 && (
        <div className="max-w-screen-xl mx-auto px-8 md:px-16 mt-24 pt-16 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-10">
            <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
            <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>
              Featured in this piece
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}