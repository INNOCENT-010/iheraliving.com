'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadProductImage } from '@/lib/utils/upload'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'
import { ChevronLeft, Bold, Italic, Heading2, List, Quote, ImageIcon, Minus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditJournalPage() {
  const router  = useRouter()
  const params  = useParams()
  const entryId = params.id as string

  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [title,        setTitle]        = useState('')
  const [slug,         setSlug]         = useState('')
  const [excerpt,      setExcerpt]      = useState('')
  const [readTime,     setReadTime]     = useState('5')
  const [tags,         setTags]         = useState('')
  const [status,       setStatus]       = useState('draft')
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile,    setCoverFile]    = useState<File | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({ inline: false }),
      TiptapLink.configure({ openOnClick: false }),
    ],
    content: '',
    editorProps: {
      attributes: { class: 'journal-editor-content focus:outline-none min-h-[400px]' },
    },
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', entryId)
        .single()

      if (!data) { router.push('/admin/journal'); return }

      setTitle(data.title)
      setSlug(data.slug)
      setExcerpt(data.excerpt || '')
      setReadTime(String(data.read_time || 5))
      setTags((data.tags || []).join(', '))
      setStatus(data.status)
      setCoverPreview(data.cover_image)
      if (editor && data.content) {
        setTimeout(() => editor.commands.setContent(data.content), 100)
      }
      setLoading(false)
    }
    if (editor) load()
  }, [editor, entryId, router])

  function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  async function handleImageInsert(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    toast.loading('Uploading image...', { id: 'img' })
    const url = await uploadProductImage(file, `journal-${slug}`, 'content')
    toast.dismiss('img')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  async function handleSave(publish = false) {
    if (!title || !slug) { toast.error('Title required.'); return }
    setSaving(true)
    const supabase = createClient()

    try {
      let coverUrl = coverPreview
      if (coverFile) {
        toast.loading('Uploading cover...', { id: 'upload' })
        coverUrl = await uploadProductImage(coverFile, `journal-${slug}`, 'cover')
        toast.dismiss('upload')
      }

      const updates: Record<string, unknown> = {
        title,
        slug,
        excerpt:     excerpt  || null,
        content:     editor?.getHTML() || '',
        cover_image: coverUrl,
        read_time:   parseInt(readTime) || 5,
        tags:        tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        status:      publish ? 'published' : status,
      }

      if (publish && status !== 'published') {
        updates.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', entryId)

      if (error) throw error

      toast.success(publish ? 'Published.' : 'Saved.')
      router.push('/admin/journal')
    } catch (err) {
      console.error(err)
      toast.error('Error saving.')
    } finally {
      setSaving(false)
    }
  }

  const toolbarItems = [
    { icon: <Bold size={13} />,     action: () => editor?.chain().focus().toggleBold().run(),                active: editor?.isActive('bold'),                 title: 'Bold'    },
    { icon: <Italic size={13} />,   action: () => editor?.chain().focus().toggleItalic().run(),              active: editor?.isActive('italic'),               title: 'Italic'  },
    { icon: <Heading2 size={13} />, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }), title: 'Heading' },
    { icon: <List size={13} />,     action: () => editor?.chain().focus().toggleBulletList().run(),          active: editor?.isActive('bulletList'),           title: 'List'    },
    { icon: <Quote size={13} />,    action: () => editor?.chain().focus().toggleBlockquote().run(),          active: editor?.isActive('blockquote'),           title: 'Quote'   },
    { icon: <Minus size={13} />,    action: () => editor?.chain().focus().setHorizontalRule().run(),         active: false,                                    title: 'Divider' },
  ]

  if (loading) return (
    <div
      className="flex items-center justify-center h-screen admin-dark"
      style={{ backgroundColor: '#0d0d0d' }}
    >
      <p className="font-body text-xs tracking-widest uppercase" style={{ color: 'rgba(245,240,232,0.3)' }}>
        Loading...
      </p>
    </div>
  )

  return (
    <div className="min-h-screen p-8 admin-dark" style={{ backgroundColor: '#0d0d0d' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} style={{ color: 'rgba(245,240,232,0.3)' }}>
            <ChevronLeft size={16} />
          </button>
          <p
            className="font-display text-2xl truncate max-w-md"
            style={{ color: '#f5f0e8' }}
          >
            {title || 'Edit Entry'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSave(false)} disabled={saving} className="admin-btn-outline">
            Save
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="admin-btn-primary">
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* Cover */}
        <div>
          <label className="admin-label">Cover Image</label>
          <div className="mt-2">
            {coverPreview ? (
              <div className="relative w-full aspect-video max-w-2xl overflow-hidden">
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                <label
                  className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                  <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'white' }}>
                    Change
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCover} />
                </label>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center w-full max-w-2xl aspect-video border border-dashed cursor-pointer"
                style={{ borderColor: 'rgba(184,146,74,0.2)' }}
              >
                <ImageIcon size={20} style={{ color: 'rgba(245,240,232,0.2)', marginBottom: 6 }} />
                <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'rgba(245,240,232,0.2)' }}>
                  Upload Cover
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCover} />
              </label>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="admin-label">Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="admin-input mt-1 w-full"
            style={{ fontSize: '1.1rem' }}
          />
        </div>

        {/* Slug */}
        <div>
          <label className="admin-label">Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            className="admin-input mt-1 w-full font-mono text-xs"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="admin-label">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={3}
            className="admin-input mt-1 w-full resize-none"
          />
        </div>

        {/* Read time + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Read Time (min)</label>
            <input
              type="number"
              value={readTime}
              onChange={e => setReadTime(e.target.value)}
              className="admin-input mt-1 w-full"
            />
          </div>
          <div>
            <label className="admin-label">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="admin-input mt-1 w-full"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="admin-label">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="materials, surfaces"
            className="admin-input mt-1 w-full"
          />
        </div>

        {/* Editor */}
        <div>
          <label className="admin-label mb-2 block">Content</label>
          <div className="border overflow-hidden" style={{ borderColor: 'rgba(184,146,74,0.15)' }}>
            {/* Toolbar */}
            <div
              className="flex items-center gap-1 px-4 py-2 border-b flex-wrap"
              style={{ borderColor: 'rgba(184,146,74,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
            >
              {toolbarItems.map(({ icon, action, active, title }) => (
                <button
                  key={title}
                  onClick={action}
                  title={title}
                  className="p-1.5 rounded transition-colors duration-150"
                  style={{
                    color:           active ? '#b8924a' : 'rgba(245,240,232,0.4)',
                    backgroundColor: active ? 'rgba(184,146,74,0.12)' : 'transparent',
                  }}
                >
                  {icon}
                </button>
              ))}
              <label
                className="p-1.5 rounded cursor-pointer"
                style={{ color: 'rgba(245,240,232,0.4)' }}
                title="Insert Image"
              >
                <ImageIcon size={13} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageInsert} />
              </label>
            </div>

            {/* Editor area */}
            <div className="px-6 py-5" style={{ backgroundColor: '#111111', minHeight: '400px' }}>
              <style>{`
                .journal-editor-content { color: rgba(245,240,232,0.8); font-family: var(--font-jost); font-size: 14px; line-height: 1.9; }
                .journal-editor-content h2 { font-family: var(--font-cormorant); font-size: 1.6rem; color: #f5f0e8; margin: 1.5rem 0 0.8rem; }
                .journal-editor-content p { margin-bottom: 1rem; }
                .journal-editor-content strong { color: #f5f0e8; font-weight: 500; }
                .journal-editor-content em { font-style: italic; }
                .journal-editor-content ul { padding-left: 1.5rem; margin-bottom: 1rem; list-style: disc; }
                .journal-editor-content blockquote { border-left: 2px solid #b8924a; padding-left: 1.2rem; margin: 1.5rem 0; font-style: italic; color: rgba(245,240,232,0.6); }
                .journal-editor-content img { max-width: 100%; height: auto; margin: 1.5rem 0; }
                .journal-editor-content hr { border: none; border-top: 1px solid rgba(184,146,74,0.2); margin: 2rem 0; }
                .ProseMirror:focus { outline: none; }
              `}</style>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex gap-3 pb-12">
          <button onClick={() => handleSave(false)} disabled={saving} className="admin-btn-outline">
            Save
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="admin-btn-primary">
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}