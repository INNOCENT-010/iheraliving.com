'use client'

import { Monitor, Smartphone } from 'lucide-react'
import { useState } from 'react'
import ProductTemplate from '@/components/product/ProductTemplate'
import type { Product } from '@/types'

interface Props {
  product: Partial<Product>
}

export default function ProductPreview({ product }: Props) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')

  // Build a safe product object with defaults for preview
  const previewProduct: Product = {
    id:               'preview',
    name:             product.name             || '',
    slug:             product.slug             || 'preview',
    tagline:          product.tagline          || null,
    subtitle:         product.subtitle         || null,
    description:      product.description      || null,
    brand_statement:  product.brand_statement  || null,
    footer_statement: product.footer_statement || null,
    collection_label: product.collection_label || 'Collection',
    category:         product.category         || 'surfaces',
    template:         product.template         || 'surface',
    status:           product.status           || 'active',
    price:            product.price            || null,
    price_on_request: product.price_on_request ?? true,
    cover_image:      product.cover_image      || null,
    images:           product.images           || [],
    materials:        product.materials        || [],
    dimensions:       product.dimensions       || null,
    sort_order:       product.sort_order       || 0,
    featured:         product.featured         ?? false,
    created_at:       new Date().toISOString(),
    updated_at:       new Date().toISOString(),
    sections:         product.sections         || [],
  }

  return (
    <div className="flex flex-col h-full">
      {/* Preview header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--brass)' }}
          />
          <span
            className="font-body text-[9px] tracking-widest uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Live Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewport('desktop')}
            className="p-1.5 transition-colors duration-200"
            style={{ color: viewport === 'desktop' ? 'var(--brass)' : 'var(--text-faint)' }}
          >
            <Monitor size={13} />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className="p-1.5 transition-colors duration-200"
            style={{ color: viewport === 'mobile' ? 'var(--brass)' : 'var(--text-faint)' }}
          >
            <Smartphone size={13} />
          </button>
        </div>
      </div>

      {/* Preview viewport */}
      <div
        className="flex-1 overflow-auto"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        <div
          className={`transition-all duration-300 mx-auto ${
            viewport === 'mobile' ? 'max-w-[390px]' : 'w-full'
          }`}
        >
          {previewProduct.name || previewProduct.cover_image ? (
            <ProductTemplate product={previewProduct} preview={true} />
          ) : (
            <div
              className="flex flex-col items-center justify-center h-64 gap-3"
              style={{ color: 'var(--text-faint)' }}
            >
              <div
                className="w-10 h-px"
                style={{ backgroundColor: 'var(--brass)' }}
              />
              <p className="font-body text-[10px] tracking-widest uppercase">
                Preview updates as you fill in details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}