'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product, ProductCategory } from '@/types'

export function useProducts(category?: ProductCategory) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient()
      let query = supabase
        .from('products')
        .select('*')
        .neq('status', 'archived')
        .order('sort_order', { ascending: true })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query
      if (error) {
        setError(error.message)
      } else {
        setProducts(data as Product[])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [category])

  return { products, loading, error }
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('status', 'active')
        .order('sort_order', { ascending: true })
        .limit(4)

      setProducts((data as Product[]) || [])
      setLoading(false)
    }

    fetchFeatured()
  }, [])

  return { products, loading }
}
