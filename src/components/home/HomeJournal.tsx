'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { formatDateLong } from '@/lib/utils/formatters'
import type { JournalEntry } from '@/types'

export default function HomeJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(2)
      setEntries((data as JournalEntry[]) || [])
    }
    load()
  }, [])

  if (!entries.length) return null

  return (
    <section
      className="w-full border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Label row */}
      <div
        className="flex items-center justify-between px-10 md:px-20 py-8 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-4">
          <span className="block w-6 h-px" style={{ backgroundColor: 'var(--brass)' }} />
          <span
            className="font-body text-[9px] tracking-widest uppercase"
            style={{ color: 'var(--brass)' }}
          >
            Journal
          </span>
        </div>
        <Link
          href="/journal"
          className="font-body text-[9px] tracking-widest uppercase transition-colors duration-300"
          style={{ color: 'var(--text-faint)' }}
        >
          All Articles →
        </Link>
      </div>

      {/* Two entries */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {entries.map((entry, i) => (
          <Link
            key={entry.id}
            href={`/journal/${entry.slug}`}
            className="group relative overflow-hidden block h-[60vh]"
            style={i === 0 ? { borderRight: '1px solid var(--border)' } : {}}
          >
            {entry.cover_image ? (
              <Image
                src={entry.cover_image}
                alt={entry.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="50vw"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: 'var(--bg-card)' }}
              />
            )}

            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, var(--bg) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
              }}
            />

            <div className="absolute bottom-0 left-0 right-0 p-10 md:p-14">
              <span
                className="font-body text-[9px] tracking-widest uppercase block mb-3"
                style={{ color: 'var(--brass)' }}
              >
                {formatDateLong(entry.published_at)} · {entry.read_time} min read
              </span>
              <h3
                className="font-display text-2xl md:text-3xl leading-tight mb-4 transition-colors duration-500"
                style={{ color: 'var(--text)' }}
              >
                {entry.title}
              </h3>
              <div
                className="flex items-center gap-2 transition-colors duration-300"
                style={{ color: 'var(--text-faint)' }}
              >
                <span className="font-body text-[9px] tracking-widest uppercase">Read</span>
                <span
                  className="block w-4 h-px transition-all duration-300 group-hover:w-8"
                  style={{ backgroundColor: 'currentColor' }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}