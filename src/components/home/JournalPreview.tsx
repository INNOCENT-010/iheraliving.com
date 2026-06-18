'use client'

import Link from 'next/link'
import { useJournalEntries } from '@/lib/hooks/useJournal'
import JournalCard from '@/components/ui/JournalCard'

export default function JournalPreview() {
  const { entries, loading } = useJournalEntries(3)

  if (loading) return null

  return (
    <section className="py-24 px-8 md:px-16 max-w-screen-xl mx-auto border-t border-brass/10">
      <div className="flex items-end justify-between mb-14">
        <div>
          <span className="font-body text-[10px] tracking-widest uppercase text-brass mb-4 block">
            The Journal
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-cream">
            Perspectives on
            <br />
            <em className="text-brass">living well.</em>
          </h2>
        </div>
        <Link
          href="/journal"
          className="hidden md:block font-body text-[10px] tracking-widest uppercase text-cream/40 hover:text-brass transition-colors duration-300"
        >
          All Articles →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {entries.map((entry, i) => (
          <JournalCard
            key={entry.id}
            entry={entry}
            variant={i === 0 ? 'featured' : 'default'}
          />
        ))}
      </div>
    </section>
  )
}
