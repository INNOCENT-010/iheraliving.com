'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JournalEntry } from '@/types'

export function useJournalEntries(limit?: number) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEntries() {
      const supabase = createClient()
      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (limit) query = query.limit(limit)

      const { data } = await query
      setEntries((data as JournalEntry[]) || [])
      setLoading(false)
    }

    fetchEntries()
  }, [limit])

  return { entries, loading }
}

export function useJournalEntry(slug: string) {
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEntry() {
      const supabase = createClient()
      const { data } = await supabase
        .from('journal_entries')
        .select(`
          *,
          product_journals (
            products (*)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      setEntry(data as JournalEntry | null)
      setLoading(false)
    }

    fetchEntry()
  }, [slug])

  return { entry, loading }
}
