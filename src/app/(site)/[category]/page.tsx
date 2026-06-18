import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ui/ProductCard'
import type { Product, JournalEntry } from '@/types'

interface Props {
  params: Promise<{ category: string }>
}

const VALID_CATEGORIES = ['surfaces', 'lighting', 'objects', 'textiles', 'collection', 'studio', 'journal', 'contact']
const PRODUCT_CATEGORIES = ['surfaces', 'lighting', 'objects', 'textiles']

export async function generateMetadata({ params }: Props) {
  const { category } = await params
  const labels: Record<string, string> = {
    surfaces:   "IHE'RA — Surfaces",
    lighting:   "IHE'RA — Lighting",
    objects:    "IHE'RA — Objects",
    collection: "IHE'RA — Collection",
    studio:     "IHE'RA — Studio",
    journal:    "IHE'RA — Journal",
    contact:    "IHE'RA — Contact",
  }
  return { title: labels[category] ?? "IHE'RA" }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params

  if (!VALID_CATEGORIES.includes(category)) notFound()

  // ── Static pages — no DB needed ──
  if (category === 'studio') return <StudioPage />
  if (category === 'contact') {
    const { default: ContactPage } = await import('@/components/pages/ContactPage')
    return <ContactPage />
  }

  const supabase = await createClient()

  // ── Journal ──
  if (category === 'journal') {
    const { data: entries } = await supabase
      .from('journal_entries')
      .select('id, title, slug, excerpt, cover_image, published_at, read_time, tags')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    return (
      <Suspense fallback={<PageShell />}>
        <JournalListPage entries={(entries as JournalEntry[]) || []} />
      </Suspense>
    )
  }

  // ── Collection ──
  if (category === 'collection') {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, slug, category, tagline, cover_image, status, price, price_on_request, featured')
      .neq('status', 'archived')
      .order('sort_order', { ascending: true })
    const { default: CollectionMasonry } = await import('@/components/collection/CollectionMasonry')
    return (
      <div className="min-h-screen pt-28 pb-24" style={{ backgroundColor: 'var(--bg)' }}>
        <CollectionMasonry products={(products as Product[]) || []} />
      </div>
    )
  }

  // ── Product categories ──
  if (PRODUCT_CATEGORIES.includes(category)) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, slug, category, tagline, cover_image, status, price, price_on_request, featured')
      .eq('category', category)
      .neq('status', 'archived')
      .order('sort_order', { ascending: true })

    return (
      <div className="min-h-screen pt-28 pb-24" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="px-8 md:px-16 max-w-screen-xl mx-auto">
          {!products?.length ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {(products as Product[]).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  notFound()
}

// ── Inline components — no extra imports ──

function PageShell() {
  return (
    <div className="min-h-screen pt-28" style={{ backgroundColor: 'var(--bg)' }} />
  )
}

function EmptyState() {
  return (
    <div
      className="py-48 text-center border"
      style={{ borderColor: 'var(--border)' }}
    >
      <p className="font-display text-3xl italic" style={{ color: 'var(--text-faint)' }}>
        Curation in progress.
      </p>
    </div>
  )
}

const SERVICES = [
  { n: '01', title: 'Interior Styling',      body: 'Cohesive styling across furniture, objects, surfaces, and light. We work from a defined concept — not a mood board.' },
  { n: '02', title: 'Material Selection',    body: 'Surface and material curation for residential and commercial projects. We specify with precision.' },
  { n: '03', title: 'Lighting Consultation', body: 'Layered lighting design that considers the architecture, the activities, and the emotional register of every room.' },
  { n: '04', title: 'Design Advisory',       body: 'Strategic design guidance for clients making major decisions. Our knowledge is a product.' },
]

function StudioPage() {
  return (
    <div className="min-h-screen pt-28 pb-24" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <div
        className="grid grid-cols-1 md:grid-cols-2 max-w-screen-xl mx-auto px-8 md:px-16 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        {SERVICES.map((s, i) => (
          <div
            key={s.n}
            className="p-10 md:p-14"
            style={{
              borderBottom: '1px solid var(--border)',
              borderRight:  i % 2 === 0 ? '1px solid var(--border)' : undefined,
            }}
          >
            <span className="font-mono text-xs block mb-5" style={{ color: 'var(--text-faint)' }}>{s.n}</span>
            <h3 className="font-display text-2xl mb-3" style={{ color: 'var(--text)' }}>{s.title}</h3>
            <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.body}</p>
          </div>
        ))}
      </div>
      <div className="px-8 md:px-16 py-20 max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
        <p className="font-display text-3xl italic max-w-sm leading-snug" style={{ color: 'var(--text-muted)' }}>
          Every great space begins with a conversation.
        </p>
        <a
          href="/contact"
          className="font-body text-[10px] tracking-widest uppercase px-10 py-4 transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--brass)', color: 'var(--bg)' }}
        >
          Begin a Conversation
        </a>
      </div>
    </div>
  )
}

function JournalListPage({ entries }: { entries: JournalEntry[] }) {
  const [featured, ...rest] = entries
  return (
    <div className="min-h-screen pt-28 pb-24" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <div className="px-8 md:px-16 max-w-screen-xl mx-auto">
        {!entries.length ? (
          <div className="py-48 text-center">
            <p className="font-display text-3xl italic" style={{ color: 'var(--text-faint)' }}>
              First entry coming soon.
            </p>
          </div>
        ) : (
          <>
            {featured && (
              <div className="mb-16 pb-16 border-b" style={{ borderColor: 'var(--border)' }}>
                <JournalCard entry={featured} large />
              </div>
            )}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {rest.map(e => <JournalCard key={e.id} entry={e} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function JournalCard({ entry, large = false }: { entry: JournalEntry; large?: boolean }) {
  const date = entry.published_at
    ? new Date(entry.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : ''
  return (
    <a href={`/journal/${entry.slug}`} className="group block">
      <div
        className="relative overflow-hidden mb-4"
        style={{
          aspectRatio:     large ? '21/9' : '4/3',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        {entry.cover_image && (
          <img
            src={entry.cover_image}
            alt={entry.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex items-center gap-3 mb-2">
        <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--brass)' }}>{date}</span>
        <span style={{ color: 'var(--text-faint)' }}>·</span>
        <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>{entry.read_time} min</span>
      </div>
      <h3
        className="font-display leading-tight"
        style={{
          fontSize: large ? '2rem' : '1.25rem',
          color:    'var(--text)',
        }}
      >
        {entry.title}
      </h3>
      {entry.excerpt && (
        <p className="font-body text-sm mt-2 leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
          {entry.excerpt}
        </p>
      )}
    </a>
  )
}