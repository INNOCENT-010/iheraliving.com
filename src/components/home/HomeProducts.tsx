'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'

export default function HomeProducts() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .neq('status', 'archived')
        .order('sort_order', { ascending: true })
        .limit(5)
      setProducts((data as Product[]) || [])
    }
    load()
  }, [])

  if (!products.length) return null

  return (
    <section className="w-full py-4">
      {products.map((product, index) => (
        <ProductRow key={product.id} product={product} index={index} />
      ))}
    </section>
  )
}

function ProductRow({ product, index }: { product: Product; index: number }) {
  const isEven = index % 2 === 0
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.12 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`
        flex flex-col md:flex-row items-center
        px-8 md:px-16 lg:px-24 py-16 md:py-24
        gap-10 md:gap-16 max-w-screen-2xl mx-auto
        border-t
        ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}
      `}
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Image */}
      <div
        className={`
          relative overflow-hidden shrink-0 w-full md:w-[44%] lg:w-[40%]
          transition-all duration-1000 ease-out
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        `}
        style={{ aspectRatio: '4/5', backgroundColor: 'var(--bg-card)' }}
      >
        {product.cover_image ? (
          <Image
            src={product.cover_image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-[3000ms] ease-out"
            style={{ transform: visible ? 'scale(1.03)' : 'scale(1)' }}
            sizes="(max-width: 768px) 100vw, 44vw"
            priority={index === 0}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <span
              className="font-display text-4xl"
              style={{ color: 'var(--text-faint)' }}
            >
              IHE&apos;RA
            </span>
          </div>
        )}

        {product.status === 'coming_soon' && (
          <div className="absolute top-5 left-5">
            <span
              className="font-body text-[8px] tracking-widest uppercase px-3 py-1.5"
              style={{
                backgroundColor: 'var(--overlay-img)',
                color: 'var(--brass)',
              }}
            >
              Coming Soon
            </span>
          </div>
        )}
      </div>

      {/* Text */}
      <div
        className={`
          flex flex-col justify-center flex-1
          transition-all duration-1000 ease-out
          ${isEven ? 'md:pl-4' : 'md:pr-4'}
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
        style={{ transitionDelay: '200ms' }}
      >
        {/* Category */}
        <div className="flex items-center gap-3 mb-8">
          <span className="block w-8 h-px" style={{ backgroundColor: 'var(--brass)' }} />
          <span
            className="font-body text-[9px] tracking-widest uppercase"
            style={{ color: 'var(--brass)' }}
          >
            IHE&apos;RA {product.category}
          </span>
        </div>

        {/* Ghost number */}
        <div className="relative mb-2">
          <span
            className="absolute font-display leading-none select-none pointer-events-none text-[8rem] md:text-[10rem]"
            style={{
              color: 'var(--brass-ghost)',
              top: '-3rem',
              left: '-1rem',
              lineHeight: 1,
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>

          <h2
            className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight relative z-10"
            style={{ color: 'var(--text)' }}
          >
            {product.name}
          </h2>
        </div>

        {/* Tagline */}
        {product.tagline && (
          <p
            className="font-body text-sm italic leading-relaxed mt-4 max-w-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {product.tagline}
          </p>
        )}

        {/* Materials */}
        {product.materials?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {product.materials.slice(0, 3).map((mat: string) => (
              <span
                key={mat}
                className="font-body text-[8px] tracking-widest uppercase px-3 py-1.5 border"
                style={{
                  color: 'var(--text-faint)',
                  borderColor: 'var(--border-soft)',
                }}
              >
                {mat}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div
          className="mt-10 pt-8 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <Link
            href={`/${product.category}/${product.slug}`}
            className="group inline-flex items-center gap-4 font-body text-[10px] tracking-widest uppercase transition-colors duration-300"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>Discover</span>
            <span
              className="block h-px transition-all duration-500 w-8 group-hover:w-14"
              style={{ backgroundColor: 'currentColor' }}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}