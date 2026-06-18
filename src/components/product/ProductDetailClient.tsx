'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProductLightbox from './ProductLightbox'
import GalleryTab from './GalleryTab'
import type { Product, ProductSection, SectionItem } from '@/types'

interface Props {
  product:  Product
  journals: { id: string; title: string; slug: string; excerpt: string | null }[]
  related:  Product[]
}

type Tab = 'overview' | 'gallery'

export default function ProductDetailClient({ product, journals, related }: Props) {
  const [tab,      setTab]      = useState<Tab>('overview')
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

  const allImages: string[] = []
  if (product.cover_image) allImages.push(product.cover_image)
  if (product.images?.length) allImages.push(...product.images)
  for (const section of product.sections || []) {
    for (const item of section.items || []) {
      if (item.image_url && !allImages.includes(item.image_url)) {
        allImages.push(item.image_url)
      }
    }
  }

  function openLightbox(images: string[], index: number) {
    setLightbox({ images, index })
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* ── HERO — name shows ONCE here only ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: '55vh', minHeight: '360px', maxHeight: '560px' }}
      >
        {product.cover_image ? (
          <Image
            src={product.cover_image}
            alt={product.name}
            fill
            className="object-cover cursor-pointer"
            sizes="100vw"
            priority
            onClick={() => openLightbox(allImages, 0)}
          />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: 'var(--bg-card)' }} />
        )}

        {/* Gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)',
          }}
        />

        {/* Name — bottom left */}
        <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-8">
          <p
            className="font-body text-[9px] tracking-widest uppercase mb-2"
            style={{ color: 'rgba(184,146,74,0.85)' }}
          >
            {product.collection_label || `IHE'RA — ${product.category}`}
          </p>
          <h1
            className="font-display leading-none mb-1"
            style={{ color: '#f5f0e8', fontSize: 'clamp(1.8rem, 4vw, 3.2rem)' }}
          >
            {product.name}
          </h1>
          {product.subtitle && (
            <p
              className="font-body text-[9px] tracking-widest uppercase"
              style={{ color: 'rgba(245,240,232,0.45)' }}
            >
              {product.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ── META BAR — materials + price + discover ── */}
      <div
        className="flex items-center justify-between px-8 md:px-16 py-5 border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {product.materials?.length > 0
            ? product.materials.map((mat: string) => (
                <span
                  key={mat}
                  className="font-body text-[8px] tracking-widest uppercase px-2.5 py-1 border"
                  style={{ color: 'var(--text-faint)', borderColor: 'var(--border-soft)' }}
                >
                  {mat}
                </span>
              ))
            : (product.tagline && (
                <p className="font-body text-sm italic" style={{ color: 'var(--text-muted)' }}>
                  {product.tagline}
                </p>
              ))
          }
        </div>
        <button
          onClick={() => document.getElementById('sections')?.scrollIntoView({ behavior: 'smooth' })}
          className="font-body text-[9px] tracking-widest uppercase flex items-center gap-2 shrink-0 transition-opacity hover:opacity-60"
          style={{ color: 'var(--brass)' }}
        >
          Discover
          <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)', display: 'inline-block' }} />
        </button>
      </div>

      {/* ── TABS ── */}
      <div
        className="sticky top-0 z-40 flex items-center border-b"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        {(['overview', 'gallery'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="font-body text-[9px] tracking-widest uppercase px-8 py-3.5 transition-colors duration-300 capitalize border-b-2 -mb-px"
            style={{
              color:       tab === t ? 'var(--brass)' : 'var(--text-faint)',
              borderColor: tab === t ? 'var(--brass)' : 'transparent',
            }}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto px-8">
          <a
            href="#enquire"
            className="font-body text-[9px] tracking-widest uppercase transition-opacity hover:opacity-60"
            style={{ color: 'var(--brass)' }}
          >
            Enquire
          </a>
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div id="sections">
          <ProductSections product={product} onImageClick={openLightbox} />

          {/* ── ENQUIRE ── */}
          <div
            id="enquire"
            className="px-8 md:px-16 py-14 border-t"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}
          >
            <div className="max-w-lg">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-5 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                <span
                  className="font-body text-[9px] tracking-widest uppercase"
                  style={{ color: 'var(--brass)' }}
                >
                  Enquire
                </span>
              </div>
              <h2
                className="font-display mb-2"
                style={{ color: 'var(--text)', fontSize: 'clamp(1.4rem, 2.5vw, 2rem)' }}
              >
                {product.name}
              </h2>
              <p className="font-body text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
                {product.price_on_request
                  ? 'Pricing available on request. We respond within 24 hours.'
                  : `From ₦${product.price?.toLocaleString()}`
                }
              </p>
              <Link
                href={`/contact?product=${encodeURIComponent(product.name)}&slug=${product.slug}`}
                className="inline-block font-body text-[10px] tracking-widest uppercase px-8 py-3.5 transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'var(--brass)', color: 'var(--bg)' }}
              >
                Begin Enquiry
              </Link>
            </div>

            {journals.length > 0 && (
              <div className="mt-12 pt-10 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-5 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                  <span
                    className="font-body text-[9px] tracking-widest uppercase"
                    style={{ color: 'var(--brass)' }}
                  >
                    From the Journal
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {journals.map(j => (
                    <Link
                      key={j.id}
                      href={`/journal/${j.slug}`}
                      className="group flex items-center gap-4"
                    >
                      <span
                        className="block w-4 h-px transition-all duration-300 group-hover:w-7"
                        style={{ backgroundColor: 'var(--brass)' }}
                      />
                      <span
                        className="font-display text-lg"
                        style={{ color: 'var(--text)' }}
                      >
                        {j.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RELATED ── */}
          {related.length > 0 && (
            <div
              className="px-8 md:px-16 py-12 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                  <span
                    className="font-body text-[9px] tracking-widest uppercase"
                    style={{ color: 'var(--brass)' }}
                  >
                    You May Also Like
                  </span>
                </div>
                <Link
                  href={`/${product.category}`}
                  className="font-body text-[9px] tracking-widest uppercase transition-opacity hover:opacity-60"
                  style={{ color: 'var(--text-faint)' }}
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {related.map(r => <RelatedCard key={r.id} product={r} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── GALLERY ── */}
      {tab === 'gallery' && <GalleryTab product={product} />}

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <ProductLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Sections renderer
// ─────────────────────────────────────────────
function ProductSections({
  product,
  onImageClick,
}: {
  product:      Product
  onImageClick: (images: string[], index: number) => void
}) {
  if (!product.sections?.length) return null

  return (
    <div>
      {product.sections.map((section: ProductSection, secIndex: number) => {
        const items = section.items || []

        // ── DETAIL — editorial split, alternates direction ──
        if (section.section_type === 'detail') {
          const item    = items[0]
          if (!item) return null
          const flip = secIndex % 2 !== 0

          return (
            <div
              key={section.id}
              className={`grid grid-cols-1 md:grid-cols-2 border-b ${flip ? 'md:[direction:rtl]' : ''}`}
              style={{ borderColor: 'var(--border)' }}
            >
              {item.image_url && (
                <div
                  className="relative overflow-hidden cursor-pointer md:[direction:ltr]"
                  style={{ aspectRatio: '4/3', maxHeight: '380px', backgroundColor: 'var(--bg-card)' }}
                  onClick={() => onImageClick([item.image_url!], 0)}
                >
                  <Image
                    src={item.image_url}
                    alt={section.header}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="50vw"
                  />
                </div>
              )}
              <div
                className="flex flex-col justify-center px-8 md:px-12 py-10 md:[direction:ltr]"
                style={{ backgroundColor: 'var(--bg-soft)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-5 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                  <span
                    className="font-body text-[9px] tracking-widest uppercase"
                    style={{ color: 'var(--brass)' }}
                  >
                    {section.header}
                  </span>
                </div>
                <p
                  className="font-body text-sm leading-loose"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.body}
                </p>
              </div>
            </div>
          )
        }

        // ── APPLICATIONS — editorial pairs, image + text alternating ──
        if (['highlights', 'applications', 'perspectives'].includes(section.section_type)) {
          return (
            <div key={section.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="px-8 md:px-16 pt-10 pb-4 flex items-center gap-3">
                <span className="w-5 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                <span
                  className="font-body text-[9px] tracking-widest uppercase"
                  style={{ color: 'var(--brass)' }}
                >
                  {section.header}
                </span>
              </div>

              <div className="flex flex-col">
                {items.map((item: SectionItem, idx: number) => {
                  const flip = idx % 2 !== 0
                  return (
                    <div
                      key={item.id}
                      className={`grid grid-cols-1 md:grid-cols-2 border-t ${flip ? 'md:[direction:rtl]' : ''}`}
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {/* Image */}
                      <div
                        className="relative overflow-hidden cursor-pointer md:[direction:ltr]"
                        style={{ aspectRatio: '16/9', maxHeight: '320px', backgroundColor: 'var(--bg-card)' }}
                        onClick={() => {
                          const imgs = items.filter((i: SectionItem) => i.image_url).map((i: SectionItem) => i.image_url!)
                          onImageClick(imgs, imgs.findIndex(u => u === item.image_url))
                        }}
                      >
                        {item.image_url && (
                          <Image
                            src={item.image_url}
                            alt={item.title || ''}
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105"
                            sizes="50vw"
                          />
                        )}
                      </div>

                      {/* Text */}
                      <div
                        className="flex flex-col justify-center px-8 md:px-12 py-8 md:[direction:ltr]"
                        style={{ backgroundColor: flip ? 'var(--bg)' : 'var(--bg-soft)' }}
                      >
                        {item.title && (
                          <h3
                            className="font-display mb-3"
                            style={{ color: 'var(--text)', fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}
                          >
                            {item.title}
                          </h3>
                        )}
                        {item.body && (
                          <p
                            className="font-body text-sm leading-relaxed"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {item.body}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }

        // ── FINISHES / COLOURWAYS / VARIANTS — larger swatches, 3 per row ──
        if (['colourways', 'finishes', 'variants'].includes(section.section_type)) {
          return (
            <div
              key={section.id}
              className="px-8 md:px-16 py-12 border-b"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="w-5 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                <span
                  className="font-body text-[9px] tracking-widest uppercase"
                  style={{ color: 'var(--brass)' }}
                >
                  {section.header}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((item: SectionItem) => (
                  <div key={item.id} className="group cursor-pointer">
                    {item.image_url && (
                      <div
                        className="relative overflow-hidden mb-3"
                        style={{ aspectRatio: '4/3' }}
                        onClick={() => onImageClick([item.image_url!], 0)}
                      >
                        <Image
                          src={item.image_url}
                          alt={item.title || ''}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="25vw"
                        />
                      </div>
                    )}
                    {item.title && (
                      <p
                        className="font-body text-[10px] tracking-widest uppercase mb-1"
                        style={{ color: 'var(--text)' }}
                      >
                        {item.title}
                      </p>
                    )}
                    {item.subtitle && (
                      <p
                        className="font-body text-xs italic"
                        style={{ color: 'var(--text-faint)' }}
                      >
                        {item.subtitle}
                      </p>
                    )}
                    {item.body && (
                      <p
                        className="font-body text-xs mt-1"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {item.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        }

        // ── MATERIALS / MATERIAL_STORY ──
        if (['materials', 'material_story'].includes(section.section_type)) {
          return (
            <div
              key={section.id}
              className="px-8 md:px-16 py-10 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="w-5 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                <span
                  className="font-body text-[9px] tracking-widest uppercase"
                  style={{ color: 'var(--brass)' }}
                >
                  {section.header}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((item: SectionItem) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    {item.image_url && (
                      <div
                        className="relative shrink-0 overflow-hidden cursor-pointer"
                        style={{ width: 80, height: 80 }}
                        onClick={() => onImageClick([item.image_url!], 0)}
                      >
                        <Image
                          src={item.image_url}
                          alt={item.title || ''}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div>
                      {item.title && (
                        <p
                          className="font-body text-[10px] tracking-widest uppercase mb-1.5"
                          style={{ color: 'var(--text)' }}
                        >
                          {item.title}
                        </p>
                      )}
                      {item.body && (
                        <p
                          className="font-body text-xs leading-relaxed"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {item.body}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        // ── SPECIFICATIONS ──
        if (['specifications', 'dimensions'].includes(section.section_type)) {
          return (
            <div
              key={section.id}
              className="px-8 md:px-16 py-10 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="w-5 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                <span
                  className="font-body text-[9px] tracking-widest uppercase"
                  style={{ color: 'var(--brass)' }}
                >
                  {section.header}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 max-w-2xl gap-0">
                {items.map((item: SectionItem) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 py-3 border-b"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span
                      className="w-1 h-1 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: 'var(--brass)' }}
                    />
                    <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        return null
      })}

      {/* Footer statement */}
      {product.footer_statement && (
        <div
          className="py-14 px-8 md:px-16 text-center border-b"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}
        >
          <p
            className="font-display italic max-w-2xl mx-auto leading-relaxed"
            style={{
              color:    'var(--text-muted)',
              fontSize: 'clamp(1.1rem, 2vw, 1.8rem)',
            }}
          >
            &ldquo;{product.footer_statement}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Related card
// ─────────────────────────────────────────────
function RelatedCard({ product }: { product: Product }) {
  return (
    <Link href={`/${product.category}/${product.slug}`} className="group block">
      <div
        className="relative overflow-hidden mb-3"
        style={{
          aspectRatio:     '4/3',
          maxHeight:       '200px',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        {product.cover_image ? (
          <Image
            src={product.cover_image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="25vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <span className="font-display text-sm" style={{ color: 'var(--text-faint)' }}>
              IHE&apos;RA
            </span>
          </div>
        )}
        <div
          className="absolute bottom-0 left-0 h-px transition-all duration-500 w-0 group-hover:w-full"
          style={{ backgroundColor: 'var(--brass)' }}
        />
      </div>
      <p
        className="font-body text-[8px] tracking-widest uppercase mb-0.5"
        style={{ color: 'var(--brass)' }}
      >
        {product.category}
      </p>
      <h3
        className="font-display text-sm leading-snug"
        style={{ color: 'var(--text)' }}
      >
        {product.name}
      </h3>
      {product.tagline && (
        <p
          className="font-body text-[10px] mt-0.5 line-clamp-1"
          style={{ color: 'var(--text-faint)' }}
        >
          {product.tagline}
        </p>
      )}
    </Link>
  )
}