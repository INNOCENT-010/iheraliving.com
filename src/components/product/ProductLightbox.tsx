'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxProps {
  images: string[]
  startIndex: number
  onClose: () => void
}

export default function ProductLightbox({ images, startIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(startIndex)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowRight') setCurrent(c => (c + 1) % images.length)
      if (e.key === 'ArrowLeft')  setCurrent(c => (c - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [images.length, onClose])

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.96)' }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-6 right-6 z-10 p-2 transition-colors duration-200"
        style={{ color: 'var(--text-muted)' }}
        onClick={onClose}
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <div
        className="absolute top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-widest"
        style={{ color: 'var(--text-faint)' }}
      >
        {String(current + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          className="absolute left-6 z-10 p-3 transition-colors duration-200"
          style={{ color: 'var(--text-muted)' }}
          onClick={e => { e.stopPropagation(); setCurrent(c => (c - 1 + images.length) % images.length) }}
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Image */}
      <div
        className="relative w-full h-full max-w-5xl max-h-[85vh] mx-16"
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={images[current]}
          alt={`Image ${current + 1}`}
          fill
          className="object-contain"
          sizes="90vw"
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          className="absolute right-6 z-10 p-3 transition-colors duration-200"
          style={{ color: 'var(--text-muted)' }}
          onClick={e => { e.stopPropagation(); setCurrent(c => (c + 1) % images.length) }}
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCurrent(i) }}
              className="relative w-12 h-12 overflow-hidden transition-opacity duration-200"
              style={{ opacity: i === current ? 1 : 0.35 }}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="48px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}