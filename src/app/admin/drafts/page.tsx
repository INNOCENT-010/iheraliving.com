'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchDraftsFromDb, deleteDraftFromDb } from '@/lib/utils/draft'
import { formatRelative } from '@/lib/utils/formatters'
import { FileText, Package, Trash2, ArrowRight, Clock, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface Draft {
  id:         string
  type:       'product' | 'journal'
  title:      string | null
  data:       Record<string, unknown>
  created_at: string
  updated_at: string
}

export default function DraftsPage() {
  const router = useRouter()
  const [drafts,   setDrafts]   = useState<Draft[]>([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function loadDrafts() {
    setLoading(true)
    const data = await fetchDraftsFromDb()
    setDrafts(data as Draft[])
    setLoading(false)
  }

  useEffect(() => { loadDrafts() }, [])

  async function deleteDraft(id: string) {
    if (!confirm('Delete this draft?')) return
    await deleteDraftFromDb(id)
    toast.success('Draft deleted.')
    setDrafts(prev => prev.filter(d => d.id !== id))
  }

  function continueDraft(draft: Draft) {
    const payload = JSON.stringify({
      ...draft.data,
      draft_id: draft.id,
      savedAt:  draft.updated_at,
    })
    if (draft.type === 'product') {
      localStorage.setItem('ihera_product_draft', payload)
      router.push('/admin/products/new')
    } else {
      localStorage.setItem('ihera_journal_draft', payload)
      router.push('/admin/journal/new')
    }
  }

  function getSummary(draft: Draft): string[] {
    const d = draft.data
    const lines: string[] = []
    if (d.category)  lines.push(`Category: ${d.category}`)
    if (d.tagline)   lines.push(`"${d.tagline}"`)
    if (d.status)    lines.push(`Status: ${d.status}`)
    if (d.template)  lines.push(`Template: ${d.template}`)
    if (Array.isArray(d.sections) && d.sections.length)
      lines.push(`${d.sections.length} section${d.sections.length > 1 ? 's' : ''} filled`)
    return lines.slice(0, 3)
  }

  function getStepLabel(draft: Draft): string {
    if (draft.type !== 'product') return ''
    const map: Record<string, string> = {
      template: 'Stopped at: Template',
      details:  'Stopped at: Details',
      sections: 'Stopped at: Sections',
      review:   'Ready to publish',
    }
    return map[String(draft.data.step)] || ''
  }

  return (
    <div className="p-8 admin-dark" style={{ minHeight: '100vh', backgroundColor: '#0d0d0d' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl" style={{ color: '#f5f0e8' }}>Drafts</h1>
          <p className="font-body text-xs mt-1 tracking-wider" style={{ color: 'rgba(245,240,232,0.3)' }}>
            {loading ? '…' : `${drafts.length} saved ${drafts.length === 1 ? 'draft' : 'drafts'}`}
          </p>
        </div>
        <button
          onClick={loadDrafts}
          className="p-2 transition-colors"
          style={{ color: 'rgba(245,240,232,0.25)' }}
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }} />
          ))}
        </div>
      ) : drafts.length === 0 ? (
        <div className="py-32 text-center border" style={{ borderColor: 'rgba(184,146,74,0.12)' }}>
          <p className="font-display text-2xl italic mb-3" style={{ color: 'rgba(245,240,232,0.2)' }}>
            No drafts yet.
          </p>
          <p className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.15)' }}>
            Click "Save Draft" while creating a product or journal entry.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {drafts.map(draft => {
            const isOpen  = expanded === draft.id
            const summary = getSummary(draft)
            const step    = getStepLabel(draft)

            return (
              <div
                key={draft.id}
                className="border overflow-hidden"
                style={{ borderColor: 'rgba(184,146,74,0.12)' }}
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                  style={{ backgroundColor: isOpen ? 'rgba(184,146,74,0.06)' : 'rgba(255,255,255,0.02)' }}
                  onClick={() => setExpanded(isOpen ? null : draft.id)}
                >
                  {/* Icon */}
                  <div
                    className="w-8 h-8 flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(184,146,74,0.1)' }}
                  >
                    {draft.type === 'product'
                      ? <Package size={13} style={{ color: '#b8924a' }} />
                      : <FileText size={13} style={{ color: '#b8924a' }} />
                    }
                  </div>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm truncate" style={{ color: '#f5f0e8' }}>
                      {draft.title || 'Untitled Draft'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="font-body text-[8px] tracking-widest uppercase"
                        style={{ color: 'rgba(184,146,74,0.6)' }}
                      >
                        {draft.type}
                      </span>
                      {step && (
                        <>
                          <span style={{ color: 'rgba(245,240,232,0.12)' }}>·</span>
                          <span className="font-body text-[8px]" style={{ color: 'rgba(245,240,232,0.3)' }}>
                            {step}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Clock size={10} style={{ color: 'rgba(245,240,232,0.2)' }} />
                    <span className="font-body text-[9px]" style={{ color: 'rgba(245,240,232,0.3)' }}>
                      {formatRelative(draft.updated_at)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); continueDraft(draft) }}
                      className="flex items-center gap-1 font-body text-[9px] tracking-widest uppercase px-3 py-1.5 transition-colors"
                      style={{ backgroundColor: 'rgba(184,146,74,0.15)', color: '#b8924a' }}
                    >
                      Continue <ArrowRight size={10} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); deleteDraft(draft.id) }}
                      className="p-1.5 transition-colors hover:text-red-400"
                      style={{ color: 'rgba(245,240,232,0.2)' }}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div
                    className="px-5 py-4 border-t"
                    style={{ borderColor: 'rgba(184,146,74,0.08)', backgroundColor: 'rgba(255,255,255,0.01)' }}
                  >
                    {summary.length > 0 ? (
                      <div className="flex flex-col gap-1.5 mb-4">
                        {summary.map((line, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: '#b8924a' }} />
                            <p className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.45)' }}>{line}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-body text-xs mb-4" style={{ color: 'rgba(245,240,232,0.2)' }}>
                        No text content saved yet.
                      </p>
                    )}

                    {/* Section tags */}
                    {draft.type === 'product' &&
                     Array.isArray(draft.data.sections) &&
                     draft.data.sections.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(draft.data.sections as { header: string; items: unknown[] }[]).map((s, i) => (
                          <span
                            key={i}
                            className="font-body text-[8px] tracking-widest uppercase px-2 py-1 border"
                            style={{ color: '#b8924a', borderColor: 'rgba(184,146,74,0.2)' }}
                          >
                            {s.header} ({s.items?.length || 0})
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => continueDraft(draft)}
                      className="font-body text-[9px] tracking-widest uppercase flex items-center gap-2"
                      style={{ color: '#b8924a' }}
                    >
                      Continue editing <ArrowRight size={11} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}