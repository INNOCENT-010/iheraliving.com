'use client'

import { useState } from 'react'
import Image from 'next/image'
import ProductLightbox from '../ProductLightbox'
import type { TemplateProps } from './types'

export default function SurfaceTemplate({ product, preview = false, onImageClick }: TemplateProps) {
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

  function handleImage(images: string[], index: number) {
    if (onImageClick) { onImageClick(images, index); return }
    if (!preview) setLightbox({ images, index })
  }

  return (
    <>
      <div className="w-full" style={{ color: 'var(--text)' }}>

        {/* ── HERO — full bleed, text bottom-left ── */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: preview ? '40vh' : '95vh' }}
        >
          {product.cover_image ? (
            <Image
              src={product.cover_image}
              alt={product.name}
              fill
              className="object-cover cursor-pointer"
              sizes="100vw"
              priority
              onClick={() => product.cover_image && handleImage([product.cover_image], 0)}
            />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: 'var(--bg-card)' }} />
          )}

          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
            }}
          />

          <div className="absolute bottom-0 left-0 p-8 md:p-16">
            <p
              className="font-body text-[9px] tracking-widest uppercase mb-4"
              style={{ color: 'var(--brass)' }}
            >
              {product.collection_label || 'IHE\'RA Surfaces'}
            </p>
            <h1
              className={`font-display leading-none mb-3 ${preview ? 'text-3xl' : 'text-6xl md:text-8xl'}`}
              style={{ color: 'rgba(245,240,232,1)' }}
            >
              {product.name || 'Product Name'}
            </h1>
            {product.subtitle && (
              <p
                className="font-body text-[10px] tracking-widest uppercase"
                style={{ color: 'rgba(245,240,232,0.5)' }}
              >
                {product.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* ── BRAND STATEMENT ── */}
        {product.brand_statement && (
          <div
            className="px-8 md:px-16 lg:px-24 py-16 border-b grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-4">
              <span className="w-8 h-px shrink-0" style={{ backgroundColor: 'var(--brass)' }} />
              <p
                className="font-display text-2xl md:text-3xl leading-snug italic"
                style={{ color: 'var(--text)' }}
              >
                {product.brand_statement}
              </p>
            </div>
            {product.tagline && (
              <p
                className="font-body text-sm leading-loose"
                style={{ color: 'var(--text-muted)' }}
              >
                {product.tagline}
              </p>
            )}
          </div>
        )}

        {/* ── SECTIONS ── */}
        {product.sections?.map((section) => {
          const items = section.items || []

          // ── THE MATERIAL (detail) ──
          if (section.section_type === 'detail') {
            const item = items[0]
            return (
              <div
                key={section.id}
                className="grid grid-cols-1 md:grid-cols-2 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="flex flex-col justify-center p-10 md:p-16 order-2 md:order-1"
                  style={{ backgroundColor: 'var(--bg-soft)' }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
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
                    {item?.body || ''}
                  </p>
                </div>
                {item?.image_url && (
                  <div
                    className="relative overflow-hidden cursor-pointer order-1 md:order-2"
                    style={{ minHeight: preview ? '200px' : '500px' }}
                    onClick={() => item.image_url && handleImage([item.image_url], 0)}
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
              </div>
            )
          }

          // ── APPLICATIONS ──
          if (section.section_type === 'applications') {
            return (
              <div
                key={section.id}
                className="border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="px-8 md:px-16 pt-14 pb-8 flex items-center gap-3">
                  <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                  <span
                    className="font-body text-[9px] tracking-widest uppercase"
                    style={{ color: 'var(--brass)' }}
                  >
                    {section.header}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ backgroundColor: 'var(--border)' }}>
                  {items.map((item, i) => (
                    <div
                      key={item.id}
                      className="relative overflow-hidden cursor-pointer group"
                      style={{
                        aspectRatio: '16/10',
                        backgroundColor: 'var(--bg-card)',
                      }}
                      onClick={() => {
                        const imgs = items.filter(it => it.image_url).map(it => it.image_url!)
                        handleImage(imgs, i)
                      }}
                    >
                      {item.image_url && (
                        <Image
                          src={item.image_url}
                          alt={item.title || ''}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="50vw"
                        />
                      )}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
                      />
                      {(item.title || item.body) && (
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          {item.title && (
                            <p
                              className="font-body text-[10px] tracking-widest uppercase mb-1"
                              style={{ color: 'rgba(245,240,232,0.9)' }}
                            >
                              {item.title}
                            </p>
                          )}
                          {item.body && (
                            <p
                              className="font-body text-xs"
                              style={{ color: 'rgba(245,240,232,0.6)' }}
                            >
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

          // ── FINISHES ──
          if (section.section_type === 'finishes') {
            return (
              <div
                key={section.id}
                className="px-8 md:px-16 py-16 border-t"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--bg-soft)',
                }}
              >
                <div className="flex items-center gap-3 mb-10">
                  <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                  <span
                    className="font-body text-[9px] tracking-widest uppercase"
                    style={{ color: 'var(--brass)' }}
                  >
                    {section.header}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {items.map((item) => (
                    <div key={item.id}>
                      {item.image_url && (
                        <div
                          className="relative overflow-hidden cursor-pointer mb-3"
                          style={{ aspectRatio: '1/1' }}
                          onClick={() => item.image_url && handleImage([item.image_url], 0)}
                        >
                          <Image
                            src={item.image_url}
                            alt={item.title || ''}
                            fill
                            className="object-cover"
                            sizes="16vw"
                          />
                        </div>
                      )}
                      {item.title && (
                        <p
                          className="font-body text-[9px] tracking-widest uppercase mb-0.5"
                          style={{ color: 'var(--text)' }}
                        >
                          {item.title}
                        </p>
                      )}
                      {item.subtitle && (
                        <p
                          className="font-body text-[9px] italic"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          // ── SPECIFICATIONS ──
          if (section.section_type === 'specifications') {
            return (
              <div
                key={section.id}
                className="px-8 md:px-16 py-16 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-3 mb-10">
                  <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                  <span
                    className="font-body text-[9px] tracking-widest uppercase"
                    style={{ color: 'var(--brass)' }}
                  >
                    {section.header}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-2xl">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-4 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span
                        className="w-1 h-1 rounded-full shrink-0"
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

        {/* ── FOOTER STATEMENT ── */}
        {product.footer_statement && (
          <div
            className="w-full py-16 md:py-24 px-8 md:px-16 border-t text-center"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}
          >
            <p
              className="font-display text-xl md:text-3xl italic max-w-3xl mx-auto leading-relaxed tracking-wide"
              style={{ color: 'var(--text-muted)' }}
            >
              &ldquo;{product.footer_statement}&rdquo;
            </p>
          </div>
        )}
      </div>

      {lightbox && (
        <ProductLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}