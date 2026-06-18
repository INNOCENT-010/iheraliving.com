'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import JournalCard from '@/components/ui/JournalCard'
import type { JournalEntry } from '@/types'

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
      setEntries((data as JournalEntry[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="min-h-screen pt-32 pb-24" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="px-10 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] mb-4" style={{ backgroundColor: 'var(--bg-card)' }} />
              <div className="h-3 w-24 mb-2" style={{ backgroundColor: 'var(--bg-card)' }} />
              <div className="h-5 w-48" style={{ backgroundColor: 'var(--bg-card)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const [featured, ...rest] = entries

  return (
    <div className="min-h-screen pt-32 pb-24" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <div className="px-10 md:px-20">
        {featured && (
          <div className="pb-16 mb-16 border-b" style={{ borderColor: 'var(--border)' }}>
            <JournalCard entry={featured} variant="featured" />
          </div>
        )}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {rest.map(entry => <JournalCard key={entry.id} entry={entry} />)}
          </div>
        )}
        {!entries.length && (
          <div className="py-48 text-center">
            <p className="font-display text-3xl italic" style={{ color: 'var(--text-faint)' }}>
              First entry coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}