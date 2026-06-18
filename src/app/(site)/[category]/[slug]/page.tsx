import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductDetailClient from '@/components/product/ProductDetailClient'
import JournalEntryPage from '@/components/pages/JournalEntryPage'
import type { Product } from '@/types'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

const VALID_CATEGORIES = ['surfaces', 'lighting', 'objects', 'textiles', 'bespoke']
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ihera.com'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const supabase = await createClient()

  if (category === 'journal') {
    const { data } = await supabase
      .from('journal_entries')
      .select('title, excerpt, cover_image')
      .eq('slug', slug)
      .single()
    if (!data) return { title: 'Not Found' }
    return {
      title:       data.title,
      description: data.excerpt ?? undefined,
      openGraph: {
        title:       data.title,
        description: data.excerpt ?? undefined,
        images:      data.cover_image
          ? [{ url: data.cover_image, width: 1200, height: 630, alt: data.title }]
          : [],
        type: 'article',
      },
      twitter: {
        card:        'summary_large_image',
        title:       data.title,
        description: data.excerpt ?? undefined,
        images:      data.cover_image ? [data.cover_image] : [],
      },
    }
  }

  const { data } = await supabase
    .from('products')
    .select('name, tagline, cover_image, brand_statement, category')
    .eq('slug', slug)
    .single()
  if (!data) return { title: 'Not Found' }

  const description = data.brand_statement || data.tagline || undefined

  return {
    title:       `${data.name} — IHE'RA`,
    description,
    openGraph: {
      title:       `${data.name} — IHE'RA`,
      description,
      url:         `${SITE_URL}/${data.category}/${slug}`,
      siteName:    "IHE'RA",
      images:      data.cover_image
        ? [{ url: data.cover_image, width: 1200, height: 630, alt: data.name }]
        : [],
      type: 'website',
    },
    twitter: {
      card:        'summary_large_image',
      title:       `${data.name} — IHE'RA`,
      description,
      images:      data.cover_image ? [data.cover_image] : [],
    },
  }
}

export default async function SlugPage({ params }: Props) {
  const { category, slug } = await params
  const supabase = await createClient()

  // ── Journal entry ──
  if (category === 'journal') {
    const { data: entry } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    if (!entry) notFound()

    const { data: linkedProducts } = await supabase
      .from('product_journals')
      .select('products(*)')
      .eq('journal_id', entry.id)
    const products = (linkedProducts || [])
      .map((r: { products: unknown }) => r.products)
      .filter(Boolean)

    return (
      <JournalEntryPage
        entry={entry}
        products={products as Product[]}
      />
    )
  }

  // ── Product detail ──
  if (!VALID_CATEGORIES.includes(category)) notFound()

  const { data: product } = await supabase
    .from('products')
    .select(`*, sections:product_sections(*, items:section_items(*))`)
    .eq('slug', slug)
    .eq('category', category)
    .neq('status', 'archived')
    .single()

  if (!product) notFound()

  const sorted = {
    ...product,
    sections: (product.sections || [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((s: { items: { sort_order: number }[] }) => ({
        ...s,
        items: (s.items || []).sort(
          (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
        ),
      })),
  } as Product

  // Linked journals
  const { data: linkedJournals } = await supabase
    .from('product_journals')
    .select('journal_entries(*)')
    .eq('product_id', product.id)
  const journals = (linkedJournals || [])
    .map((r: { journal_entries: unknown }) => r.journal_entries)
    .filter(Boolean)

  // Related products — same category, exclude current, max 4
  const { data: related } = await supabase
    .from('products')
    .select('id, name, slug, category, tagline, cover_image, status, price, price_on_request')
    .eq('category', category)
    .neq('slug', slug)
    .neq('status', 'archived')
    .order('sort_order', { ascending: true })
    .limit(4)

  return (
    <ProductDetailClient
      product={sorted}
      journals={journals as { id: string; title: string; slug: string; excerpt: string | null }[]}
      related={(related as Product[]) || []}
    />
  )
}