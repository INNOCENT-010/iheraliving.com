'use client'

import { useState } from 'react'
import Image from 'next/image'
import ProductLightbox from './ProductLightbox'
import type { Product } from '@/types'

export default function GalleryTab({ product }: { product: Product }) {
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

  // Collect all images: cover + gallery + section images
  const allImages: string[] = []
  if (product.cover_image) allImages.push(product.cover_image)
  if (product.images?.length) allImages.push(...product.images)
  if (product.sections) {
    for (const section of product.sections) {
      if (section.items) {
        for (const item of section.items) {
          if (item.image_url && !allImages.includes(item.image_url)) {
            allImages.push(item.image_url)
          }
        }
      }
    }
  }

  if (!allImages.length) return (
    <div className="py-24 text-center">
      <p className="font-body text-sm" style={{ color: 'var(--text-faint)' }}>
        No images yet.
      </p>
    </div>
  )

  return (
    <>
      <div
        className="columns-2 md:columns-3 lg:columns-4 gap-1 px-8 md:px-16 py-12"
      >
        {allImages.map((src, i) => (
          <div
            key={i}
            className="relative break-inside-avoid mb-1 overflow-hidden cursor-pointer group"
            style={{ aspectRatio: i % 3 === 0 ? '3/4' : i % 3 === 1 ? '1/1' : '4/3' }}
            onClick={() => setLightbox({ images: allImages, index: i })}
          >
            <Image
              src={src}
              alt={`${product.name} ${i + 1}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="25vw"
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              <span className="font-body text-[9px] tracking-widest uppercase text-white">
                View
              </span>
            </div>
          </div>
        ))}
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