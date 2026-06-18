import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ui/ProductCard'
import { formatDateLong } from '@/lib/utils/formatters'
import type { JournalEntry, Product } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: entry } = await supabase
    .from('journal_entries')
    .select('title, excerpt')
    .eq('slug', slug)
    .single()

  if (!entry) return { title: 'Not Found' }
  return {
    title: entry.title,
    description: entry.excerpt ?? undefined,
  }
}

export default async function JournalEntryPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: entry } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!entry) notFound()

  // Fetch linked products
  const { data: linkedProducts } = await supabase
    .from('product_journals')
    .select('products(*)')
    .eq('journal_id', entry.id)

  const products = linkedProducts?.map((r: { products: unknown }) => r.products).filter(Boolean) as Product[]

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <article className="max-w-3xl mx-auto px-8 md:px-0">
        {/* Back */}
        <Link
          href="/journal"
          className="font-body text-[10px] tracking-widest uppercase text-cream/40 hover:text-brass transition-colors duration-300 mb-12 block"
        >
          ← Journal
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-body text-[9px] tracking-widest uppercase text-brass">
              {formatDateLong(entry.published_at)}
            </span>
            <span className="text-cream/20">·</span>
            <span className="font-body text-[9px] tracking-widest uppercase text-cream/40">
              {entry.read_time} min read
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-cream leading-tight">
            {entry.title}
          </h1>
          {entry.excerpt && (
            <p className="font-body text-lg text-cream/50 mt-6 leading-relaxed italic font-light">
              {entry.excerpt}
            </p>
          )}
        </div>

        {/* Cover */}
        {entry.cover_image && (
          <div className="relative aspect-[16/9] mb-12 overflow-hidden">
            <Image
              src={entry.cover_image}
              alt={entry.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="journal-content font-body text-sm text-cream/70 leading-loose"
          dangerouslySetInnerHTML={{ __html: entry.content || '' }}
        />

        {/* Tags */}
        {entry.tags?.length > 0 && (
          <div className="mt-12 pt-8 border-t border-brass/10 flex flex-wrap gap-3">
            {entry.tags.map((tag: string) => (
              <span
                key={tag}
                className="font-body text-[9px] tracking-widest uppercase text-brass/60 border border-brass/20 px-3 py-1.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Linked products */}
      {products?.length > 0 && (
        <div className="max-w-screen-xl mx-auto px-8 md:px-16 mt-24 pt-16 border-t border-brass/10">
          <h2 className="font-display text-3xl text-cream mb-10">
            Featured in this piece
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
