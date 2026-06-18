export async function saveDraftToDb(
  type: 'product' | 'journal',
  title: string,
  data: Record<string, unknown>,
  draftId?: string | null
): Promise<string | null> {
  try {
    const res = await fetch('/api/drafts', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type, title, data, draftId }),
    })
    if (!res.ok) {
      const err = await res.json()
      console.warn('Draft save failed:', err.error)
      return null
    }
    const { id } = await res.json()
    return id || null
  } catch (err) {
    console.warn('Draft save network error:', err)
    return null
  }
}

export async function deleteDraftFromDb(draftId: string): Promise<void> {
  try {
    await fetch('/api/drafts', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ draftId }),
    })
  } catch (err) {
    console.warn('Draft delete failed:', err)
  }
}

export async function fetchDraftsFromDb(): Promise<{
  id:         string
  type:       string
  title:      string
  data:       Record<string, unknown>
  created_at: string
  updated_at: string
}[]> {
  try {
    const res = await fetch('/api/drafts')
    if (!res.ok) return []
    const { drafts } = await res.json()
    return drafts || []
  } catch {
    return []
  }
}