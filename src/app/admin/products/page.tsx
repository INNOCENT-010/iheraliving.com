'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)

  async function fetchProducts() {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })
    setProducts((data as Product[]) || [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  async function toggleStatus(product: Product) {
    const supabase  = createClient()
    const newStatus = product.status === 'active' ? 'archived' : 'active'
    const { error } = await supabase
      .from('products')
      .update({ status: newStatus })
      .eq('id', product.id)
    if (error) { toast.error('Failed to update.'); return }
    toast.success(`Product ${newStatus === 'active' ? 'activated' : 'archived'}.`)
    fetchProducts()
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return
    const supabase  = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) { toast.error('Failed to delete.'); return }
    toast.success('Product deleted.')
    fetchProducts()
  }

  return (
    <div
      className="p-4 md:p-8 admin-dark"
      style={{ minHeight: '100vh', backgroundColor: '#0d0d0d' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl" style={{ color: '#f5f0e8' }}>
            Products
          </h1>
          <p
            className="font-body text-xs mt-1 tracking-wider"
            style={{ color: 'rgba(245,240,232,0.3)' }}
          >
            {products.length} items
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/admin/products/sort"
            className="flex items-center gap-1.5 font-body text-[9px] tracking-widest uppercase px-3 md:px-5 py-2.5 border transition-colors"
            style={{
              borderColor:     'rgba(184,146,74,0.3)',
              color:           '#b8924a',
              backgroundColor: 'rgba(184,146,74,0.07)',
            }}
          >
            <GripVertical size={12} />
            <span className="hidden md:inline">Sort</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 font-body text-[9px] tracking-widest uppercase px-3 md:px-6 py-2.5 transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#b8924a', color: '#0d0d0d' }}
          >
            <Plus size={12} />
            <span className="hidden md:inline">New Product</span>
            <span className="md:hidden">New</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <div className="border min-w-[600px]" style={{ borderColor: 'rgba(184,146,74,0.12)' }}>
              <div
                className="grid px-6 py-3 border-b"
                style={{
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 120px',
                  borderColor:         'rgba(184,146,74,0.12)',
                  backgroundColor:     'rgba(255,255,255,0.02)',
                }}
              >
                {['Product', 'Category', 'Status', 'Featured', 'Actions'].map(h => (
                  <span
                    key={h}
                    className="font-body text-[9px] tracking-widest uppercase"
                    style={{ color: 'rgba(245,240,232,0.25)' }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {products.map(product => (
                <div
                  key={product.id}
                  className="grid px-6 py-4 border-b last:border-0 items-center"
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 120px',
                    borderColor:         'rgba(184,146,74,0.06)',
                  }}
                >
                  <div className="min-w-0 pr-4">
                    <p className="font-body text-sm truncate" style={{ color: '#f5f0e8' }}>
                      {product.name}
                    </p>
                    <p className="font-body text-xs truncate" style={{ color: 'rgba(245,240,232,0.3)' }}>
                      {product.tagline}
                    </p>
                  </div>
                  <span className="font-body text-xs capitalize" style={{ color: 'rgba(245,240,232,0.5)' }}>
                    {product.category}
                  </span>
                  <span
                    className="font-body text-[9px] tracking-widest uppercase inline-block px-2 py-1 w-fit"
                    style={{
                      backgroundColor:
                        product.status === 'active'      ? 'rgba(74,184,74,0.12)'  :
                        product.status === 'coming_soon' ? 'rgba(184,146,74,0.15)' :
                        'rgba(255,255,255,0.06)',
                      color:
                        product.status === 'active'      ? '#6ee26e' :
                        product.status === 'coming_soon' ? '#b8924a' :
                        'rgba(245,240,232,0.3)',
                    }}
                  >
                    {product.status.replace('_', ' ')}
                  </span>
                  <span
                    className="font-body text-xs"
                    style={{ color: product.featured ? '#b8924a' : 'rgba(245,240,232,0.25)' }}
                  >
                    {product.featured ? '✓' : '—'}
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      style={{ color: 'rgba(245,240,232,0.3)' }}
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => toggleStatus(product)}
                      style={{ color: 'rgba(245,240,232,0.3)' }}
                      title={product.status === 'active' ? 'Archive' : 'Activate'}
                    >
                      {product.status === 'active' ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="hover:text-red-400 transition-colors"
                      style={{ color: 'rgba(245,240,232,0.3)' }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {!products.length && (
                <div className="px-6 py-16 text-center">
                  <p className="font-body text-sm" style={{ color: 'rgba(245,240,232,0.3)' }}>
                    No products yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {!products.length ? (
              <div className="py-16 text-center border" style={{ borderColor: 'rgba(184,146,74,0.12)' }}>
                <p className="font-body text-sm" style={{ color: 'rgba(245,240,232,0.3)' }}>
                  No products yet.
                </p>
              </div>
            ) : (
              products.map(product => (
                <div
                  key={product.id}
                  className="border p-4"
                  style={{ borderColor: 'rgba(184,146,74,0.12)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-sm truncate" style={{ color: '#f5f0e8' }}>
                        {product.name}
                      </p>
                      <p className="font-body text-xs mt-0.5" style={{ color: 'rgba(245,240,232,0.3)' }}>
                        {product.category}
                      </p>
                    </div>
                    <span
                      className="font-body text-[8px] tracking-widest uppercase px-2 py-1 shrink-0"
                      style={{
                        backgroundColor:
                          product.status === 'active'      ? 'rgba(74,184,74,0.12)'  :
                          product.status === 'coming_soon' ? 'rgba(184,146,74,0.15)' :
                          'rgba(255,255,255,0.06)',
                        color:
                          product.status === 'active'      ? '#6ee26e' :
                          product.status === 'coming_soon' ? '#b8924a' :
                          'rgba(245,240,232,0.3)',
                      }}
                    >
                      {product.status.replace('_', ' ')}
                    </span>
                  </div>

                  {product.tagline && (
                    <p
                      className="font-body text-xs mb-3 line-clamp-1"
                      style={{ color: 'rgba(245,240,232,0.25)' }}
                    >
                      {product.tagline}
                    </p>
                  )}

                  <div
                    className="flex items-center justify-between pt-3 border-t"
                    style={{ borderColor: 'rgba(184,146,74,0.08)' }}
                  >
                    <span
                      className="font-body text-[9px]"
                      style={{ color: product.featured ? '#b8924a' : 'rgba(245,240,232,0.2)' }}
                    >
                      {product.featured ? '★ Featured' : 'Not featured'}
                    </span>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        style={{ color: 'rgba(245,240,232,0.4)' }}
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => toggleStatus(product)}
                        style={{ color: 'rgba(245,240,232,0.4)' }}
                      >
                        {product.status === 'active' ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="hover:text-red-400 transition-colors"
                        style={{ color: 'rgba(245,240,232,0.4)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}