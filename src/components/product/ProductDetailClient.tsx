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

      {/* ── 1. HERO ── */}
      <div className="relative w-full overflow-hidden" style={{ height: '100vh' }}>
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
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-10 md:px-16 pb-12 flex items-end justify-between">
          <div>
            <p
              className="font-body text-[9px] tracking-widest uppercase mb-3"
              style={{ color: 'rgba(184,146,74,0.8)' }}
            >
              {product.collection_label || `IHE'RA ${product.category}`}
            </p>
            <h1
              className="font-display leading-none"
              style={{ color: '#f5f0e8', fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
            >
              {product.name}
            </h1>
            {product.subtitle && (
              <p
                className="font-body text-[10px] tracking-widest uppercase mt-2"
                style={{ color: 'rgba(245,240,232,0.5)' }}
              >
                {product.subtitle}
              </p>
            )}
          </div>
          <div className="hidden md:flex flex-col items-center gap-2 pb-2">
            <span
              className="font-body text-[8px] tracking-widest uppercase"
              style={{ color: 'rgba(245,240,232,0.3)', writingMode: 'vertical-rl' }}
            >
              Scroll
            </span>
            <div
              className="w-px h-10"
              style={{ background: 'linear-gradient(to bottom, rgba(245,240,232,0.3), transparent)' }}
            />
          </div>
        </div>
      </div>

      {/* ── 2. INTRO ── */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 border-b"
        style={{ borderColor: 'var(--border)', minHeight: '70vh' }}
      >
        <div
          className="relative overflow-hidden cursor-pointer"
          style={{ minHeight: '400px', backgroundColor: 'var(--bg-card)' }}
          onClick={() => openLightbox(allImages, product.images?.length ? 1 : 0)}
        >
          {(product.images?.[0] || product.cover_image) && (
            <Image
              src={product.images?.[0] || product.cover_image!}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="50vw"
            />
          )}
        </div>
        <div
          className="flex flex-col justify-center px-12 md:px-16 py-16"
          style={{ backgroundColor: 'var(--bg-soft)' }}
        >
          <p
            className="font-body text-[9px] tracking-widest uppercase mb-2"
            style={{ color: 'var(--brass)' }}
          >
            {product.category}
          </p>
          <h2
            className="font-display leading-tight mb-6"
            style={{ color: 'var(--text)', fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {product.name}
          </h2>
          {(product.brand_statement || product.tagline) && (
            <p
              className="font-body text-sm leading-loose mb-8 max-w-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              {product.brand_statement || product.tagline}
            </p>
          )}
          {product.materials?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {product.materials.map((mat: string) => (
                <span
                  key={mat}
                  className="font-body text-[8px] tracking-widest uppercase px-3 py-1.5 border"
                  style={{ color: 'var(--text-faint)', borderColor: 'var(--border-soft)' }}
                >
                  {mat}
                </span>
              ))}
            </div>
          )}
          <div className="w-full h-px mb-8" style={{ backgroundColor: 'var(--border)' }} />
          <button
            onClick={() => {
              document.getElementById('sections')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="group inline-flex flex-col items-start gap-1 font-body text-[10px] tracking-widest uppercase w-fit"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>Discover</span>
            <span
              className="block h-px transition-all duration-300 w-full"
              style={{ backgroundColor: 'var(--text-faint)' }}
            />
          </button>
        </div>
      </div>

      {/* ── 3. TABS ── */}
      <div
        className="sticky top-0 z-40 flex items-center border-b"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        {(['overview', 'gallery'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="font-body text-[9px] tracking-widest uppercase px-10 py-4 transition-colors duration-300 capitalize border-b-2 -mb-px"
            style={{
              color:       tab === t ? 'var(--brass)' : 'var(--text-faint)',
              borderColor: tab === t ? 'var(--brass)' : 'transparent',
            }}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto px-6">
          <a
            href="#enquire"
            className="font-body text-[9px] tracking-widest uppercase"
            style={{ color: 'var(--brass)' }}
          >
            Enquire
          </a>
        </div>
      </div>

      {/* ── 4. OVERVIEW ── */}
      {tab === 'overview' && (
        <div id="sections">
          <ProductSections product={product} onImageClick={openLightbox} />

          {/* ── ENQUIRE ── */}
          <div
            id="enquire"
            className="px-10 md:px-20 py-20 border-t"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}
          >
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>
                  Enquire
                </span>
              </div>
              <h2
                className="font-display mb-3 leading-tight"
                style={{ color: 'var(--text)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
              >
                {product.name}
              </h2>
              <p className="font-body text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
                {product.price_on_request
                  ? 'Pricing available on request. We respond within 24 hours.'
                  : `From ₦${product.price?.toLocaleString()}`}
              </p>
              <Link
                href={`/contact?product=${encodeURIComponent(product.name)}&slug=${product.slug}`}
                className="inline-block font-body text-[10px] tracking-widest uppercase px-10 py-4 transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'var(--brass)', color: 'var(--bg)' }}
              >
                Begin Enquiry
              </Link>
            </div>

            {journals.length > 0 && (
              <div className="mt-16 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                  <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>
                    From the Journal
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {journals.map(j => (
                    <Link key={j.id} href={`/journal/${j.slug}`} className="group flex items-center gap-4">
                      <span
                        className="block w-4 h-px transition-all duration-300 group-hover:w-8"
                        style={{ backgroundColor: 'var(--brass)' }}
                      />
                      <span
                        className="font-display text-xl transition-colors duration-300"
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

          {/* ── RELATED PRODUCTS ── */}
          {related.length > 0 && (
            <div
              className="px-10 md:px-16 py-16 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                  <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {related.map(r => (
                  <RelatedCard key={r.id} product={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. GALLERY TAB ── */}
      {tab === 'gallery' && (
        <GalleryTab product={product} />
      )}

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

function RelatedCard({ product }: { product: Product }) {
  return (
    <Link href={`/${product.category}/${product.slug}`} className="group block">
      <div
        className="relative overflow-hidden mb-3"
        style={{ aspectRatio: '4/3', backgroundColor: 'var(--bg-card)', maxHeight: '240px' }}
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
            <span className="font-display text-lg" style={{ color: 'var(--text-faint)' }}>
              IHE&apos;RA
            </span>
          </div>
        )}
        <div
          className="absolute bottom-0 left-0 h-px transition-all duration-500 w-0 group-hover:w-full"
          style={{ backgroundColor: 'var(--brass)' }}
        />
      </div>
      <p className="font-body text-[8px] tracking-widest uppercase mb-1" style={{ color: 'var(--brass)' }}>
        {product.category}
      </p>
      <h3
        className="font-display text-base leading-snug transition-colors duration-300"
        style={{ color: 'var(--text)' }}
      >
        {product.name}
      </h3>
      {product.tagline && (
        <p className="font-body text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-faint)' }}>
          {product.tagline}
        </p>
      )}
    </Link>
  )
}

// ── Sections renderer ──
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
      {product.sections.map((section: ProductSection) => {
        const items = section.items || []

        if (section.section_type === 'detail') {
          const item = items[0]
          if (!item) return null
          return (
            <div
              key={section.id}
              className="grid grid-cols-1 md:grid-cols-2 border-b"
              style={{ borderColor: 'var(--border)', minHeight: '500px' }}
            >
              {item.image_url && (
                <div
                  className="relative overflow-hidden cursor-pointer"
                  style={{ minHeight: '400px', backgroundColor: 'var(--bg-card)' }}
                  onClick={() => onImageClick([item.image_url!], 0)}
                >
                  <Image src={item.image_url} alt={section.header} fill className="object-cover transition-transform duration-700 hover:scale-105" sizes="50vw" />
                </div>
              )}
              <div className="flex flex-col justify-center px-12 md:px-16 py-16" style={{ backgroundColor: 'var(--bg-soft)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                  <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>
                    {section.header}
                  </span>
                </div>
                <p className="font-body text-sm leading-loose" style={{ color: 'var(--text-muted)' }}>
                  {item.body}
                </p>
              </div>
            </div>
          )
        }

        if (['highlights', 'applications', 'perspectives'].includes(section.section_type)) {
          const imgItems = items.filter((i: SectionItem) => i.image_url)
          return (
            <div key={section.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="px-10 md:px-16 pt-14 pb-8 flex items-center gap-3">
                <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>
                  {section.header}
                </span>
              </div>
              <div
                className="grid gap-px"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`,
                  backgroundColor:     'var(--border)',
                }}
              >
                {items.map((item: SectionItem) => (
                  <div
                    key={item.id}
                    className="relative group cursor-pointer"
                    style={{ aspectRatio: '3/4', backgroundColor: 'var(--bg-card)' }}
                    onClick={() => {
                      const imgs = imgItems.map((it: SectionItem) => it.image_url!)
                      const idx  = imgItems.findIndex((it: SectionItem) => it.id === item.id)
                      onImageClick(imgs, idx)
                    }}
                  >
                    {item.image_url && (
                      <Image src={item.image_url} alt={item.title || ''} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="25vw" />
                    )}
                    {(item.title || item.body) && (
                      <div
                        className="absolute bottom-0 left-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
                      >
                        {item.title && (
                          <p className="font-body text-[9px] tracking-widest uppercase mb-1" style={{ color: 'rgba(245,240,232,0.9)' }}>
                            {item.title}
                          </p>
                        )}
                        {item.body && (
                          <p className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.6)' }}>
                            {item.body}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        }

        if (['colourways', 'finishes', 'variants'].includes(section.section_type)) {
          return (
            <div key={section.id} className="px-10 md:px-16 py-16 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}>
              <div className="flex items-center gap-3 mb-10">
                <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>
                  {section.header}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {items.map((item: SectionItem) => (
                  <div key={item.id}>
                    {item.image_url && (
                      <div
                        className="relative overflow-hidden cursor-pointer mb-4 group"
                        style={{ aspectRatio: '3/4' }}
                        onClick={() => onImageClick([item.image_url!], 0)}
                      >
                        <Image src={item.image_url} alt={item.title || ''} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="25vw" />
                      </div>
                    )}
                    {item.title && <p className="font-body text-[9px] tracking-widest uppercase mb-1" style={{ color: 'var(--text)' }}>{item.title}</p>}
                    {item.subtitle && <p className="font-body text-xs italic" style={{ color: 'var(--text-muted)' }}>{item.subtitle}</p>}
                    {item.body && <p className="font-body text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.body}</p>}
                  </div>
                ))}
              </div>
            </div>
          )
        }

        if (['materials', 'material_story'].includes(section.section_type)) {
          return (
            <div key={section.id} className="px-10 md:px-16 py-16 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 mb-10">
                <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>
                  {section.header}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {items.map((item: SectionItem) => (
                  <div key={item.id} className="flex gap-5 items-start">
                    {item.image_url && (
                      <div
                        className="relative shrink-0 overflow-hidden cursor-pointer"
                        style={{ width: 88, height: 88 }}
                        onClick={() => onImageClick([item.image_url!], 0)}
                      >
                        <Image src={item.image_url} alt={item.title || ''} fill className="object-cover" sizes="88px" />
                      </div>
                    )}
                    <div>
                      {item.title && <p className="font-body text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--text)' }}>{item.title}</p>}
                      {item.body && <p className="font-body text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.body}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        if (['specifications', 'dimensions'].includes(section.section_type)) {
          return (
            <div key={section.id} className="px-10 md:px-16 py-16 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 mb-10">
                <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>
                  {section.header}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-2xl">
                {items.map((item: SectionItem) => (
                  <div key={item.id} className="flex items-center gap-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--brass)' }} />
                    <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        return null
      })}

      {product.footer_statement && (
        <div
          className="py-20 md:py-28 px-10 md:px-16 text-center border-b"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}
        >
          <p
            className="font-display italic max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-muted)', fontSize: 'clamp(1.4rem, 3vw, 2.5rem)' }}
          >
            &ldquo;{product.footer_statement}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}