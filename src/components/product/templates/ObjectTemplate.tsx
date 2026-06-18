'use client'

import { useState } from 'react'
import Image from 'next/image'
import ProductLightbox from '../ProductLightbox'
import type { TemplateProps } from './types'

export default function ObjectTemplate({ product, preview = false, onImageClick }: TemplateProps) {
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

  function handleImage(images: string[], index: number) {
    if (onImageClick) { onImageClick(images, index); return }
    if (!preview) setLightbox({ images, index })
  }

  return (
    <>
      <div className="w-full" style={{ color: 'var(--text)' }}>

        {/* ── HERO — object on field ── */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: preview ? '40vh' : '90vh', backgroundColor: 'var(--bg-soft)' }}
        >
          {product.cover_image ? (
            <Image
              src={product.cover_image}
              alt={product.name}
              fill
              className="object-contain cursor-pointer p-8 md:p-16"
              sizes="100vw"
              priority
              onClick={() => product.cover_image && handleImage([product.cover_image], 0)}
            />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: 'var(--bg-card)' }} />
          )}

          {/* Name — bottom left */}
          <div className="absolute bottom-0 left-0 p-8 md:p-14">
            <p className="font-body text-[9px] tracking-widest uppercase mb-3" style={{ color: 'var(--brass)' }}>
              {product.collection_label || "IHE'RA Objects"}
            </p>
            <h1 className={`font-display leading-none ${preview ? 'text-3xl' : 'text-5xl md:text-7xl'}`} style={{ color: 'var(--text)' }}>
              {product.name || 'Product Name'}
            </h1>
            {product.tagline && (
              <p className="font-body text-sm italic mt-3" style={{ color: 'var(--text-muted)' }}>
                {product.tagline}
              </p>
            )}
          </div>
        </div>

        {/* ── BRAND STATEMENT ── */}
        {product.brand_statement && (
          <div className="px-8 md:px-16 lg:px-32 py-16 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="font-display text-2xl md:text-3xl italic leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {product.brand_statement}
            </p>
          </div>
        )}

        {/* ── SECTIONS ── */}
        {product.sections?.map((section) => {
          const items = section.items || []

          if (section.section_type === 'detail') {
            const item = items[0]
            return (
              <div key={section.id} className="grid grid-cols-1 md:grid-cols-2 border-t" style={{ borderColor: 'var(--border)' }}>
                {item?.image_url && (
                  <div className="relative overflow-hidden cursor-pointer" style={{ minHeight: preview ? '200px' : '500px' }}
                    onClick={() => item.image_url && handleImage([item.image_url], 0)}>
                    <Image src={item.image_url} alt={section.header} fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="50vw" />
                  </div>
                )}
                <div className="flex flex-col justify-center p-10 md:p-16">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                    <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>{section.header}</span>
                  </div>
                  <p className="font-body text-sm leading-loose" style={{ color: 'var(--text-muted)' }}>{item?.body || ''}</p>
                </div>
              </div>
            )
          }

          if (section.section_type === 'perspectives') {
            return (
              <div key={section.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="px-8 md:px-16 pt-14 pb-8 flex items-center gap-3">
                  <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                  <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>{section.header}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ backgroundColor: 'var(--border)' }}>
                  {items.map((item, i) => (
                    <div key={item.id} className="relative overflow-hidden cursor-pointer group" style={{ aspectRatio: '3/4', backgroundColor: 'var(--bg-card)' }}
                      onClick={() => { const imgs = items.filter(it => it.image_url).map(it => it.image_url!); handleImage(imgs, i) }}>
                      {item.image_url && <Image src={item.image_url} alt={item.title || ''} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="25vw" />}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {item.title && <p className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'rgba(245,240,232,0.8)' }}>{item.title}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          if (section.section_type === 'material_story') {
            return (
              <div key={section.id} className="px-8 md:px-16 py-16 border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}>
                <div className="flex items-center gap-3 mb-10">
                  <span className="w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
                  <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>{section.header}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
                  {items.map((item) => (
                    <div key={item.id}>
                      {item.title && <p className="font-body text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--text)' }}>{item.title}</p>}
                      {item.body  && <p className="font-body text-sm leading-loose" style={{ color: 'var(--text-muted)' }}>{item.body}</p>}
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