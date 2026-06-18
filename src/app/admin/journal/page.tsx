'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Globe, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatters'
import toast from 'react-hot-toast'
import type { JournalEntry } from '@/types'

export default function AdminJournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchEntries() {
    const supabase = createClient()
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })
    setEntries((data as JournalEntry[]) || [])
    setLoading(false)
  }

  useEffect(() => { fetchEntries() }, [])

  async function togglePublish(entry: JournalEntry) {
    const supabase = createClient()
    const newStatus = entry.status === 'published' ? 'draft' : 'published'
    const { error } = await supabase
      .from('journal_entries')
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', entry.id)
    if (error) { toast.error('Failed.'); return }
    toast.success(newStatus === 'published' ? 'Published.' : 'Moved to draft.')
    fetchEntries()
  }

  async function deleteEntry(id: string) {
    if (!confirm('Delete this entry?')) return
    const supabase = createClient()
    const { error } = await supabase.from('journal_entries').delete().eq('id', id)
    if (error) { toast.error('Failed.'); return }
    toast.success('Deleted.')
    fetchEntries()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl" style={{ color: '#f5f0e8' }}>Journal</h1>
          <p className="font-body text-xs mt-1 tracking-wider" style={{ color: 'rgba(245,240,232,0.3)' }}>
            {entries.length} entries
          </p>
        </div>
        <Link
          href="/admin/journal/new"
          className="flex items-center gap-2 font-body text-[10px] tracking-widest uppercase px-6 py-3 transition-colors"
          style={{ backgroundColor: '#b8924a', color: '#0d0d0d' }}
        >
          <Plus size={14} />
          New Entry
        </Link>
      </div>

      <div className="border" style={{ borderColor: 'rgba(184,146,74,0.12)' }}>
        <div
          className="grid px-6 py-3 border-b"
          style={{
            gridTemplateColumns: '2fr 1fr 1fr 100px',
            borderColor: 'rgba(184,146,74,0.12)',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}
        >
          {['Title', 'Status', 'Published', 'Actions'].map(h => (
            <span key={h} className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'rgba(245,240,232,0.3)' }}>
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="p-6">
            <p className="font-body text-sm" style={{ color: 'rgba(245,240,232,0.3)' }}>Loading...</p>
          </div>
        ) : entries.map(entry => (
          <div
            key={entry.id}
            className="grid px-6 py-4 border-b last:border-0 items-center"
            style={{ gridTemplateColumns: '2fr 1fr 1fr 100px', borderColor: 'rgba(184,146,74,0.06)' }}
          >
            <div>
              <p className="font-body text-sm" style={{ color: '#f5f0e8' }}>{entry.title}</p>
              <p className="font-body text-xs truncate max-w-xs" style={{ color: 'rgba(245,240,232,0.3)' }}>
                {entry.excerpt}
              </p>
            </div>

            <span
              className="font-body text-[9px] tracking-widest uppercase inline-block px-2 py-1 w-fit"
              style={{
                backgroundColor: entry.status === 'published' ? 'rgba(74,184,74,0.12)' : 'rgba(255,255,255,0.06)',
                color:           entry.status === 'published' ? '#6ee26e'               : 'rgba(245,240,232,0.3)',
              }}
            >
              {entry.status}
            </span>

            <span className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.4)' }}>
              {formatDate(entry.published_at)}
            </span>

            <div className="flex items-center gap-3">
              <Link
                href={`/admin/journal/${entry.id}/edit`}
                style={{ color: 'rgba(245,240,232,0.3)' }}
                title="Edit"
              >
                <Pencil size={13} />
              </Link>
              <button
                onClick={() => togglePublish(entry)}
                style={{ color: 'rgba(245,240,232,0.3)' }}
                title={entry.status === 'published' ? 'Unpublish' : 'Publish'}
              >
                {entry.status === 'published' ? <FileText size={13} /> : <Globe size={13} />}
              </button>
              <button
                onClick={() => deleteEntry(entry.id)}
                className="hover:text-red-400 transition-colors"
                style={{ color: 'rgba(245,240,232,0.3)' }}
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        {!entries.length && !loading && (
          <div className="px-6 py-16 text-center">
            <p className="font-body text-sm" style={{ color: 'rgba(245,240,232,0.3)' }}>No entries yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}