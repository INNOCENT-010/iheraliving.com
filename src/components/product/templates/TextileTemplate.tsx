'use client'

import { useState } from 'react'
import Image from 'next/image'
import ProductLightbox from '../ProductLightbox'
import type { TemplateProps } from './types'

export default function TextileTemplate({ product, preview = false, onImageClick }: TemplateProps) {
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

  function handleImage(images: string[], index: number) {
    if (onImageClick) { onImageClick(images, index); return }
    if (!preview) setLightbox({ images, index })
  }

  const allImages = [
    product.cover_image,
    ...(product.images || []),
  ].filter(Boolean) as string[]

  return (
    <>
      <div className="w-full" style={{ color: 'var(--text)' }}>

        {/* ── HERO ── */}
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
              onClick={() => handleImage(allImages, 0)}
            />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: 'var(--bg-card)' }} />
          )}

          {/* Gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
            }}
          />

          {/* Hero text overlay — top left */}
          <div className="absolute top-0 left-0 p-8 md:p-14">
            <p
              className="font-display text-base tracking-widest mb-1"
              style={{ color: 'rgba(245,240,232,0.9)' }}
            >
              IHE&apos;RA
            </p>
            <p
              className="font-body text-[9px] tracking-widest uppercase mb-6"
              style={{ color: 'var(--brass)' }}
            >
              {product.collection_label || 'Collection'}
            </p>
            <h1
              className={`font-display leading-none ${preview ? 'text-3xl' : 'text-5xl md:text-7xl'}`}
              style={{ color: 'rgba(245,240,232,1)' }}
            >
              {product.name || 'Product Name'}
            </h1>
            {product.subtitle && (
              <p
                className="font-body text-[10px] tracking-widest uppercase mt-3"
                style={{ color: 'rgba(245,240,232,0.6)' }}
              >
                {product.subtitle}
              </p>
            )}

            {/* Brass line */}
            <div className="w-10 h-px mt-6 mb-5" style={{ backgroundColor: 'var(--brass)' }} />

            {product.brand_statement && (
              <p
                className="font-body text-xs leading-loose max-w-xs"
                style={{ color: 'rgba(245,240,232,0.65)' }}
              >
                {product.brand_statement}
              </p>
            )}
          </div>
        </div>

        {/* ── SECTIONS ── */}
        {product.sections?.map((section) => {
          const items = section.items || []

          // ── DETAIL ──
          if (section.section_type === 'detail') {
            const item = items[0]
            return (
              <div
                key={section.id}
                className="grid grid-cols-1 md:grid-cols-2 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Detail image */}
                {item?.image_url && (
                  <div
                    className="relative overflow-hidden cursor-pointer"
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

                {/* Detail text */}
                <div
                  className="flex flex-col justify-center p-10 md:p-16"
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
              </div>
            )
          }

          // ── HIGHLIGHTS ──
          if (section.section_type === 'highlights') {
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
                <div className={`grid gap-1 ${items.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                  {items.map((item, i) => (
                    <div key={item.id}>
                      {item.image_url && (
                        <div
                          className="relative overflow-hidden cursor-pointer mb-4"
                          style={{ aspectRatio: '3/4' }}
                          onClick={() => {
                            const imgs = items.filter(it => it.image_url).map(it => it.image_url!)
                            handleImage(imgs, i)
                          }}
                        >
                          <Image
                            src={item.image_url}
                            alt={item.title || ''}
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105"
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
                      {item.body && (
                        <p
                          className="font-body text-xs leading-relaxed"
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

          // ── COLOURWAYS ──
          if (section.section_type === 'colourways') {
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {items.map((item) => (
                    <div key={item.id}>
                      {item.image_url && (
                        <div
                          className="relative overflow-hidden cursor-pointer mb-4"
                          style={{ aspectRatio: '3/4' }}
                          onClick={() => item.image_url && handleImage([item.image_url], 0)}
                        >
                          <Image
                            src={item.image_url}
                            alt={item.title || ''}
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105"
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

          // ── MATERIALS ──
          if (section.section_type === 'materials') {
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-5 items-start">
                      {item.image_url && (
                        <div
                          className="relative shrink-0 overflow-hidden cursor-pointer"
                          style={{ width: 80, height: 80 }}
                          onClick={() => item.image_url && handleImage([item.image_url], 0)}
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
                            className="font-body text-xs tracking-widest uppercase mb-2"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
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
                      <p
                        className="font-body text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
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
            style={{ borderColor: 'var(--border)' }}
          >
            <p
              className="font-display text-2xl md:text-4xl italic max-w-3xl mx-auto leading-relaxed"
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