'use client'

import Link from 'next/link'
import { useFeaturedProducts } from '@/lib/hooks/useProducts'
import ProductCard from '@/components/ui/ProductCard'

export default function FeaturedProducts() {
  const { products, loading } = useFeaturedProducts()

  return (
    <section className="py-16 px-8 md:px-16 max-w-screen-xl mx-auto">
      <div className="flex items-end justify-between mb-14">
        <div>
          <span
            className="font-body text-[10px] tracking-widest uppercase mb-4 block"
            style={{ color: 'var(--brass)' }}
          >
            Selected Works
          </span>
          <h2
            className="font-display text-4xl md:text-5xl"
            style={{ color: 'var(--text)' }}
          >
            Surface & Light
          </h2>
        </div>
        <Link
          href="/surfaces"
          className="hidden md:block font-body text-[10px] tracking-widest uppercase transition-colors duration-300"
          style={{ color: 'var(--text-faint)' }}
        >
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse"
              style={{ backgroundColor: 'var(--bg-card)' }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  )
}