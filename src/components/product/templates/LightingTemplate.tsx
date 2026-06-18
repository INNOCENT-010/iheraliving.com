'use client'

import { useState } from 'react'
import Image from 'next/image'
import ProductLightbox from '../ProductLightbox'
import type { TemplateProps } from './types'

export default function LightingTemplate({ product, preview = false, onImageClick }: TemplateProps) {
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

  function handleImage(images: string[], index: number) {
    if (onImageClick) { onImageClick(images, index); return }
    if (!preview) setLightbox({ images, index })
  }

  return (
    <>
      <div className="w-full" style={{ color: 'var(--text)' }}>

        {/* ── HERO — centered, minimal ── */}
        <div
          className="relative w-full overflow-hidden flex items-end"
          style={{ height: preview ? '40vh' : '95vh', backgroundColor: 'var(--bg)' }}
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
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)',
            }}
          />
          <div className="relative z-10 p-8 md:p-16 w-full flex items-end justify-between">
            <div>
              <p
                className="font-body text-[9px] tracking-widest uppercase mb-3"
                style={{ color: 'var(--brass)' }}
              >
                {product.collection_label || 'IHE\'RA Lighting'}
              </p>
              <h1
                className={`font-display leading-none ${preview ? 'text-3xl' : 'text-5xl md:text-7xl'}`}
                style={{ color: 'rgba(245,240,232,1)' }}
              >
                {product.name || 'Product Name'}
              </h1>
            </div>
            {product.tagline && (
              <p
                className="hidden md:block font-body text-xs italic max-w-xs text-right"
                style={{ color: 'rgba(245,240,232,0.5)' }}
              >
                {product.tagline}
              </p>
            )}
          </div>
        </div>

        {/* ── SECTIONS ── */}
        {product.sections?.map((section) => {
          const items = section.items || []

          if (section.section_type === 'detail') {
            const item = items[0]
            return (
              <div
                key={section.id}
                className="grid grid-cols-1 md:grid-cols-2 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                {item?.image_url && (
                  <div
                    className="relative overflow-hidden cursor-pointer"
                    style={{ minHeight: preview ? '200px' : '500px' }}
                    onClick={() => item.image_url && handleImage([item.image_url], 0)}
                  >
                    <Image src={item.image_url} alt={section.header} fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="50vw" />
                  </div>
                )}
                <div className="flex flex-col justify-center p-10 md:p-16" style={{ backgroundColor: 'var(--bg-soft)' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                    <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>{section.header}</span>
                  </div>
                  <p className="font-body text-sm leading-loose" style={{ color: 'var(--text-muted)' }}>{item?.body || ''}</p>
                </div>
              </div>
            )
          }

          if (section.section_type === 'highlights') {
            return (
              <div key={section.id} className="px-8 md:px-16 py-16 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-10">
                  <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                  <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>{section.header}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                  {items.map((item, i) => (
                    <div key={item.id}>
                      {item.image_url && (
                        <div className="relative overflow-hidden cursor-pointer mb-4" style={{ aspectRatio: '1/1' }}
                          onClick={() => { const imgs = items.filter(it => it.image_url).map(it => it.image_url!); handleImage(imgs, i) }}>
                          <Image src={item.image_url} alt={item.title || ''} fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="25vw" />
                        </div>
                      )}
                      {item.title && <p className="font-body text-[10px] tracking-widest uppercase mb-1" style={{ color: 'var(--text)' }}>{item.title}</p>}
                      {item.body  && <p className="font-body text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.body}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          if (section.section_type === 'variants') {
            return (
              <div key={section.id} className="px-8 md:px-16 py-16 border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}>
                <div className="flex items-center gap-3 mb-10">
                  <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                  <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>{section.header}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  {items.map((item) => (
                    <div key={item.id}>
                      {item.image_url && (
                        <div className="relative overflow-hidden cursor-pointer mb-4" style={{ aspectRatio: '3/4' }}
                          onClick={() => item.image_url && handleImage([item.image_url], 0)}>
                          <Image src={item.image_url} alt={item.title || ''} fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="33vw" />
                        </div>
                      )}
                      {item.title    && <p className="font-body text-[10px] tracking-widest uppercase mb-1" style={{ color: 'var(--text)' }}>{item.title}</p>}
                      {item.subtitle && <p className="font-body text-xs italic mb-1" style={{ color: 'var(--brass)' }}>{item.subtitle}</p>}
                      {item.body     && <p className="font-body text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.body}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          if (section.section_type === 'specifications') {
            return (
              <div key={section.id} className="px-8 md:px-16 py-16 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-10">
                  <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                  <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>{section.header}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-2xl">
                  {items.map((item) => (
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
          <div className="w-full py-16 md:py-24 px-8 md:px-16 border-t text-center" style={{ borderColor: 'var(--border)' }}>
            <p className="font-display text-2xl md:text-4xl italic max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              &ldquo;{product.footer_statement}&rdquo;
            </p>
          </div>
        )}
      </div>

      {lightbox && <ProductLightbox images={lightbox.images} startIndex={lightbox.index} onClose={() => setLightbox(null)} />}
    </>
  )
}