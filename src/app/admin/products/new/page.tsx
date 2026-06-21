'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadProductImage, createSafePreview } from '@/lib/utils/upload'
import { saveDraftToDb, deleteDraftFromDb } from '@/lib/utils/draft'
import { TEMPLATES, getTemplate } from '@/lib/utils/templates'
import {
  ChevronLeft, Plus, Trash2, Upload,
  GripVertical, Save, X, Eye, Loader,
} from 'lucide-react'
import ProductPreview from '@/components/admin/ProductPreview'
import toast from 'react-hot-toast'
import type {
  ProductTemplate, SectionType,
  ProductSection, Product,
} from '@/types'

type Step = 'template' | 'details' | 'sections' | 'review'

interface ItemDraft {
  id:        string
  image_url: string | null  // permanent Supabase URL after upload
  title:     string
  subtitle:  string
  body:      string
}

interface SectionDraft {
  id:           string
  section_type: SectionType
  header:       string
  sort_order:   number
  items:        ItemDraft[]
}

interface GalleryItem {
  id:  string
  url: string  // permanent Supabase URL
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function newItem(): ItemDraft {
  return { id: makeId(), image_url: null, title: '', subtitle: '', body: '' }
}

function buildPreview(fields: {
  template:        ProductTemplate | null
  name:            string
  slug:            string
  category:        string
  tagline:         string
  subtitle:        string
  brandStatement:  string
  footerStatement: string
  collectionLabel: string
  status:          string
  featured:        boolean
  priceOnRequest:  boolean
  price:           string
  coverUrl:        string | null
  galleryUrls:     string[]
  sections:        SectionDraft[]
}): Partial<Product> {
  return {
    name:             fields.name,
    slug:             fields.slug,
    template:         fields.template ?? 'surface',
    category:         fields.category as Product['category'],
    tagline:          fields.tagline         || null,
    subtitle:         fields.subtitle        || null,
    brand_statement:  fields.brandStatement  || null,
    footer_statement: fields.footerStatement || null,
    collection_label: fields.collectionLabel || 'Collection',
    status:           fields.status as Product['status'],
    featured:         fields.featured,
    price_on_request: fields.priceOnRequest,
    price:            fields.priceOnRequest ? null : parseFloat(fields.price) || null,
    cover_image:      fields.coverUrl,
    images:           fields.galleryUrls,
    materials:        [],
    sections: fields.sections.map((s, si) => ({
      id:           s.id,
      product_id:   'preview',
      section_type: s.section_type,
      header:       s.header,
      sort_order:   si,
      created_at:   new Date().toISOString(),
      items: s.items.map((item, ii) => ({
        id:         item.id,
        section_id: s.id,
        image_url:  item.image_url,
        title:      item.title    || null,
        subtitle:   item.subtitle || null,
        body:       item.body     || null,
        sort_order: ii,
        created_at: new Date().toISOString(),
      })),
    })) as ProductSection[],
  }
}

export default function NewProductPage() {
  const router     = useRouter()
  const draftIdRef = useRef<string | null>(null)
  // Track a temp slug for image uploads before name is set
  const uploadSlug = useRef<string>(`draft-${Date.now()}`)

  const [step,            setStep]            = useState<Step>('template')
  const [publishing,      setPublishing]      = useState(false)
  const [savingDraft,     setSavingDraft]     = useState(false)
  const [draftSavedAt,    setDraftSavedAt]    = useState<string | null>(null)
  const [showPreview,     setShowPreview]     = useState(false)

  // Core fields
  const [template,        setTemplate]        = useState<ProductTemplate | null>(null)
  const [name,            setName]            = useState('')
  const [slug,            setSlug]            = useState('')
  const [category,        setCategory]        = useState('surfaces')
  const [tagline,         setTagline]         = useState('')
  const [subtitle,        setSubtitle]        = useState('')
  const [brandStatement,  setBrandStatement]  = useState('')
  const [footerStatement, setFooterStatement] = useState('')
  const [collectionLabel, setCollectionLabel] = useState('Collection')
  const [status,          setStatus]          = useState('active')
  const [featured,        setFeatured]        = useState(false)
  const [priceOnRequest,  setPriceOnRequest]  = useState(true)
  const [price,           setPrice]           = useState('')

  // Media — permanent URLs only
  const [coverUrl,     setCoverUrl]     = useState<string | null>(null)
  const [coverLoading, setCoverLoading] = useState(false)
  const [gallery,      setGallery]      = useState<GalleryItem[]>([])
  const [galleryLoadingIds, setGalleryLoadingIds] = useState<string[]>([])

  // Sections
  const [sections, setSections] = useState<SectionDraft[]>([])

  // ── Build draft data ──
  const buildDraftData = useCallback(() => ({
    template, name, slug, category, tagline, subtitle,
    brandStatement, footerStatement, collectionLabel,
    status, featured, priceOnRequest, price, step,
    coverUrl,
    galleryUrls: gallery.map(g => g.url),
    sections,
  }), [
    template, name, slug, category, tagline, subtitle,
    brandStatement, footerStatement, collectionLabel,
    status, featured, priceOnRequest, price, step,
    coverUrl, gallery, sections,
  ])

  // ── Restore draft ──
  useEffect(() => {
    const raw = sessionStorage.getItem('ihera_product_draft')
    if (!raw) return
    try {
      const draft = JSON.parse(raw)
      if (!draft.name && !draft.template) return
      if (draft.template)                     setTemplate(draft.template)
      if (draft.name)                         setName(draft.name)
      if (draft.slug)                         setSlug(draft.slug)
      if (draft.category)                     setCategory(draft.category)
      if (draft.tagline)                      setTagline(draft.tagline)
      if (draft.subtitle)                     setSubtitle(draft.subtitle)
      if (draft.brandStatement)               setBrandStatement(draft.brandStatement)
      if (draft.footerStatement)              setFooterStatement(draft.footerStatement)
      if (draft.collectionLabel)              setCollectionLabel(draft.collectionLabel)
      if (draft.status)                       setStatus(draft.status)
      if (draft.featured !== undefined)       setFeatured(draft.featured)
      if (draft.priceOnRequest !== undefined) setPriceOnRequest(draft.priceOnRequest)
      if (draft.price)                        setPrice(draft.price)
      if (draft.step)                         setStep(draft.step)
      if (draft.coverUrl)                     setCoverUrl(draft.coverUrl)
      if (Array.isArray(draft.galleryUrls))   setGallery(draft.galleryUrls.map((url: string) => ({ id: makeId(), url })))
      if (Array.isArray(draft.sections))      setSections(draft.sections)
      if (draft.draft_id)                     draftIdRef.current = draft.draft_id
      if (draft.savedAt)                      setDraftSavedAt(new Date(draft.savedAt).toLocaleTimeString())
    } catch {
      sessionStorage.removeItem('ihera_product_draft')
    }
  }, [])

  // ── Manual save draft ──
  async function handleSaveDraft() {
    if (!name && !template) {
      toast.error('Add a product name or choose a template first.')
      return
    }
    setSavingDraft(true)
    try {
      const data = buildDraftData()
      const id   = await saveDraftToDb('product', name || 'Untitled', data, draftIdRef.current)
      if (id) {
        draftIdRef.current = id
        sessionStorage.setItem('ihera_product_draft', JSON.stringify({
          ...data,
          draft_id: id,
          savedAt:  new Date().toISOString(),
        }))
        const time = new Date().toLocaleTimeString()
        setDraftSavedAt(time)
        toast.success('Draft saved.')
      } else {
        toast.error('Draft save failed. Check your connection.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Draft save failed.')
    } finally {
      setSavingDraft(false)
    }
  }

  function clearDraft() {
    if (!window.confirm('Clear draft and start over?')) return
    sessionStorage.removeItem('ihera_product_draft')
    if (draftIdRef.current) {
      deleteDraftFromDb(draftIdRef.current).catch(console.error)
      draftIdRef.current = null
    }
    window.location.reload()
  }

  // ── Template select ──
  function handleTemplateSelect(t: ProductTemplate) {
    setTemplate(t)
    const def = getTemplate(t)
    if (!def) return
    const catMap: Record<ProductTemplate, string> = {
      textile: 'textiles', surface: 'surfaces',
      lighting: 'lighting', object: 'objects',
    }
    setCategory(catMap[t])
    setSections(def.sections.map((s, i) => ({
      id:           makeId(),
      section_type: s.section_type,
      header:       s.header,
      sort_order:   i,
      items:        [newItem()],
    })))
    setStep('details')
  }

  function handleNameChange(val: string) {
    setName(val)
    const generated = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setSlug(generated)
    uploadSlug.current = generated || `draft-${Date.now()}`
  }

  // ── Cover — upload immediately ──
  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 30 * 1024 * 1024) { toast.error('Max 30 MB.'); return }

    setCoverLoading(true)
    const tid = toast.loading('Uploading cover…')
    try {
      const url = await uploadProductImage(file, uploadSlug.current, 'cover')
      if (url) {
        setCoverUrl(url)
        toast.success('Cover uploaded.', { id: tid })
      } else {
        toast.error('Upload failed. Check storage permissions.', { id: tid })
      }
    } catch (err) {
      console.error(err)
      toast.error('Upload error.', { id: tid })
    } finally {
      setCoverLoading(false)
    }
  }

  function removeCover() {
    setCoverUrl(null)
  }

  // ── Gallery — upload immediately ──
  async function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return

    const valid = files.filter(f => f.size <= 30 * 1024 * 1024)
    const over  = files.length - valid.length
    if (over) toast.error(`${over} file(s) skipped — max 30 MB each.`)
    if (!valid.length) return

    // Create placeholder items immediately so UI feels responsive
    const placeholders = valid.map(() => makeId())
    setGalleryLoadingIds(prev => [...prev, ...placeholders])

    const tid = toast.loading(`Uploading ${valid.length} image${valid.length > 1 ? 's' : ''}…`)

    const uploaded: GalleryItem[] = []
    for (let i = 0; i < valid.length; i++) {
      try {
        const url = await uploadProductImage(valid[i], uploadSlug.current, 'gallery')
        if (url) uploaded.push({ id: placeholders[i], url })
      } catch (err) {
        console.error('Gallery upload error:', err)
      }
    }

    setGalleryLoadingIds(prev => prev.filter(id => !placeholders.includes(id)))

    if (uploaded.length) {
      setGallery(prev => [...prev, ...uploaded])
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded.`, { id: tid })
    } else {
      toast.error('No images uploaded. Check storage permissions.', { id: tid })
    }
  }

  function removeGalleryItem(id: string) {
    setGallery(prev => prev.filter(g => g.id !== id))
  }

  // ── Section helpers ──
  function updateSectionHeader(sIdx: number, val: string) {
    setSections(prev => prev.map((s, i) => i === sIdx ? { ...s, header: val } : s))
  }

  function addItem(sIdx: number) {
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, items: [...s.items, newItem()] } : s
    ))
  }

  function removeItem(sIdx: number, iIdx: number) {
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, items: s.items.filter((_, j) => j !== iIdx) } : s
    ))
  }

  function updateItem(sIdx: number, iIdx: number, field: keyof ItemDraft, val: string) {
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? {
        ...s,
        items: s.items.map((item, j) =>
          j === iIdx ? { ...item, [field]: val } : item
        ),
      } : s
    ))
  }

  // ── Section item image — upload immediately ──
  async function handleItemImage(sIdx: number, iIdx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 30 * 1024 * 1024) { toast.error('Max 30 MB.'); return }

    // Show local preview immediately while uploading
    const preview = await createSafePreview(file)
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? {
        ...s,
        items: s.items.map((item, j) =>
          j === iIdx ? { ...item, image_url: preview } : item
        ),
      } : s
    ))

    const tid = toast.loading('Uploading image…')
    try {
      const url = await uploadProductImage(file, uploadSlug.current, `s${sIdx}i${iIdx}`)
      if (url) {
        // Replace blob preview with permanent URL
        setSections(prev => prev.map((s, i) =>
          i === sIdx ? {
            ...s,
            items: s.items.map((item, j) =>
              j === iIdx ? { ...item, image_url: url } : item
            ),
          } : s
        ))
        toast.success('Image uploaded.', { id: tid })
      } else {
        toast.error('Image upload failed.', { id: tid })
        // Revert preview
        setSections(prev => prev.map((s, i) =>
          i === sIdx ? {
            ...s,
            items: s.items.map((item, j) =>
              j === iIdx ? { ...item, image_url: null } : item
            ),
          } : s
        ))
      }
    } catch (err) {
      console.error(err)
      toast.error('Upload error.', { id: tid })
    }
  }

  // ── Publish ──
  async function handlePublish() {
    if (!template)    { toast.error('Choose a template.');        setStep('template'); return }
    if (!name.trim()) { toast.error('Product name is required.'); setStep('details');  return }
    if (!slug.trim()) { toast.error('URL slug is required.');     setStep('details');  return }

    setPublishing(true)
    const supabase = createClient()

    try {
      await supabase.auth.refreshSession()
    } catch { /* non-fatal */ }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('Session expired. Please sign in again.')
      setPublishing(false)
      router.push('/login')
      return
    }

    try {
      // All images already uploaded — just save the product record
      const tid = toast.loading('Saving product…')

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name:              name.trim(),
          slug:              slug.trim(),
          category,
          template,
          tagline:           tagline.trim()         || null,
          subtitle:          subtitle.trim()        || null,
          brand_statement:   brandStatement.trim()  || null,
          footer_statement:  footerStatement.trim() || null,
          collection_label:  collectionLabel.trim() || 'Collection',
          status,
          featured,
          price_on_request:  priceOnRequest,
          price:             priceOnRequest ? null : (parseFloat(price) || null),
          cover_image:       coverUrl,
          images:            gallery.map(g => g.url),
        })
        .select()
        .single()

      toast.dismiss(tid)
      if (productError) throw productError

      // Insert sections
      for (let sIdx = 0; sIdx < sections.length; sIdx++) {
        const sec = sections[sIdx]
        const { data: section, error: secError } = await supabase
          .from('product_sections')
          .insert({
            product_id:   product.id,
            section_type: sec.section_type,
            header:       sec.header,
            sort_order:   sIdx,
          })
          .select()
          .single()
        if (secError) throw secError

        for (let iIdx = 0; iIdx < sec.items.length; iIdx++) {
          const item = sec.items[iIdx]
          const hasContent = item.title.trim() || item.body.trim() || item.subtitle.trim() || item.image_url
          if (!hasContent) continue
          const { error: itemError } = await supabase
            .from('section_items')
            .insert({
              section_id: section.id,
              image_url:  item.image_url,
              title:      item.title.trim()    || null,
              subtitle:   item.subtitle.trim() || null,
              body:       item.body.trim()     || null,
              sort_order: iIdx,
            })
          if (itemError) console.error('Section item error:', itemError)
        }
      }

      // Clean up
      sessionStorage.removeItem('ihera_product_draft')
      if (draftIdRef.current) {
        await deleteDraftFromDb(draftIdRef.current).catch(console.error)
      }

      toast.success('Product published.')
      router.push('/admin/products')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err)
      console.error('Publish error:', err)
      toast.error(`Failed: ${msg}`)
    } finally {
      setPublishing(false)
    }
  }

  const previewProduct = buildPreview({
    template, name, slug, category, tagline, subtitle,
    brandStatement, footerStatement, collectionLabel,
    status, featured, priceOnRequest, price,
    coverUrl, galleryUrls: gallery.map(g => g.url), sections,
  })

  const templateDef = template ? getTemplate(template) : null

  return (
    <div className="flex h-screen overflow-hidden admin-dark" style={{ backgroundColor: '#0d0d0d' }}>

      {/* ── LEFT: Form ── */}
      <div
        className="w-full lg:w-[460px] xl:w-[500px] shrink-0 flex flex-col border-r overflow-hidden"
        style={{ borderColor: 'rgba(184,146,74,0.12)', backgroundColor: '#111111' }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'rgba(184,146,74,0.12)', backgroundColor: '#0d0d0d' }}
        >
          <button onClick={() => router.back()} style={{ color: 'rgba(245,240,232,0.35)' }}>
            <ChevronLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-display text-base" style={{ color: '#f5f0e8' }}>New Product</p>
            <p className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'rgba(245,240,232,0.3)' }}>
              {step === 'template' && '01 — Choose Template'}
              {step === 'details'  && '02 — Product Details'}
              {step === 'sections' && '03 — Content Sections'}
              {step === 'review'   && '04 — Review & Publish'}
            </p>
          </div>
          <button
            onClick={() => setShowPreview(v => !v)}
            className="lg:hidden p-1.5"
            style={{ color: 'rgba(245,240,232,0.4)' }}
          >
            <Eye size={15} />
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft}
            className="flex items-center gap-1.5 font-body text-[9px] tracking-widest uppercase px-3 py-2 border transition-colors shrink-0"
            style={{
              borderColor:     'rgba(184,146,74,0.3)',
              color:           savingDraft ? 'rgba(184,146,74,0.35)' : '#b8924a',
              backgroundColor: 'rgba(184,146,74,0.07)',
            }}
          >
            <Save size={11} />
            {savingDraft ? 'Saving…' : 'Save Draft'}
          </button>
        </div>

        {/* Draft saved banner */}
        {draftSavedAt && (
          <div
            className="flex items-center justify-between px-5 py-1.5 border-b shrink-0"
            style={{ borderColor: 'rgba(184,146,74,0.08)', backgroundColor: 'rgba(184,146,74,0.05)' }}
          >
            <span className="font-body text-[8px]" style={{ color: 'rgba(245,240,232,0.35)' }}>
              ✓ Draft saved {draftSavedAt} — images included
            </span>
            <button
              onClick={clearDraft}
              className="font-body text-[8px] tracking-widest uppercase"
              style={{ color: 'rgba(245,240,232,0.18)' }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Step dots */}
        <div
          className="flex items-center gap-2 px-5 py-3 border-b shrink-0"
          style={{ borderColor: 'rgba(184,146,74,0.1)' }}
        >
          {(['template', 'details', 'sections', 'review'] as Step[]).map((s, i) => {
            const current = (['template', 'details', 'sections', 'review'] as Step[]).indexOf(step)
            const done    = current > i
            const active  = step === s
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[8px] transition-all duration-200"
                  style={{
                    backgroundColor: active ? '#b8924a' : done ? 'rgba(184,146,74,0.25)' : 'rgba(255,255,255,0.06)',
                    color:           active ? '#0d0d0d' : done ? '#b8924a' : 'rgba(245,240,232,0.25)',
                  }}
                >
                  {i + 1}
                </div>
                {i < 3 && (
                  <div className="w-5 h-px" style={{ backgroundColor: done ? 'rgba(184,146,74,0.3)' : 'rgba(255,255,255,0.08)' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-5 py-5" style={{ backgroundColor: '#111111' }}>

          {/* STEP 1 — Template */}
          {step === 'template' && (
            <div className="flex flex-col gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateSelect(t.id)}
                  className="border p-5 text-left transition-all duration-150"
                  style={{ borderColor: 'rgba(184,146,74,0.15)', backgroundColor: 'rgba(255,255,255,0.025)' }}
                >
                  <p className="font-display text-base mb-1" style={{ color: '#f5f0e8' }}>{t.label}</p>
                  <p className="font-body text-xs leading-relaxed mb-3" style={{ color: 'rgba(245,240,232,0.38)' }}>
                    {t.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {t.sections.map(s => (
                      <span
                        key={s.section_type}
                        className="font-body text-[7px] tracking-widest uppercase px-2 py-0.5 border"
                        style={{ color: '#b8924a', borderColor: 'rgba(184,146,74,0.2)' }}
                      >
                        {s.header}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2 — Details */}
          {step === 'details' && (
            <div className="flex flex-col gap-5">

              {/* Cover */}
              <div>
                <label className="admin-label">
                  Cover Image *
                  <span className="ml-2 normal-case font-body text-[8px]" style={{ color: 'rgba(245,240,232,0.2)' }}>
                    uploads immediately
                  </span>
                </label>
                <div className="mt-2">
                  {coverLoading ? (
                    <div
                      className="w-full flex items-center justify-center border"
                      style={{ aspectRatio: '16/9', borderColor: 'rgba(184,146,74,0.2)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                    >
                      <Loader size={20} className="animate-spin" style={{ color: '#b8924a' }} />
                    </div>
                  ) : coverUrl ? (
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                      <button
                        onClick={removeCover}
                        className="absolute top-2 right-2 p-1.5"
                        style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: 'white' }}
                      >
                        <X size={12} />
                      </button>
                      <div
                        className="absolute bottom-2 left-2 font-body text-[8px] tracking-widest uppercase px-2 py-1"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#b8924a' }}
                      >
                        ✓ Uploaded
                      </div>
                    </div>
                  ) : (
                    <label
                      className="flex flex-col items-center justify-center w-full border border-dashed cursor-pointer transition-colors"
                      style={{ aspectRatio: '16/9', borderColor: 'rgba(184,146,74,0.2)' }}
                    >
                      <Upload size={18} style={{ color: 'rgba(245,240,232,0.2)', marginBottom: 6 }} />
                      <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'rgba(245,240,232,0.2)' }}>
                        Upload Cover
                      </span>
                      <span className="font-body text-[8px] mt-1" style={{ color: 'rgba(245,240,232,0.1)' }}>
                        JPG · PNG · max 30 MB
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                    </label>
                  )}
                </div>
              </div>

              {/* Gallery */}
              <div>
                <label className="admin-label">
                  Gallery
                  <span className="ml-2 normal-case font-body text-[8px]" style={{ color: 'rgba(245,240,232,0.2)' }}>
                    uploads immediately — {gallery.length} uploaded
                  </span>
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {gallery.map((g) => (
                    <div key={g.id} className="relative w-20 h-20 overflow-hidden shrink-0 group">
                      <img src={g.url} alt="" className="w-full h-full object-cover" />
                      <div
                        className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                      >
                        <button onClick={() => removeGalleryItem(g.id)}>
                          <X size={10} color="white" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Loading placeholders */}
                  {galleryLoadingIds.map(id => (
                    <div
                      key={id}
                      className="w-20 h-20 shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                    >
                      <Loader size={14} className="animate-spin" style={{ color: '#b8924a' }} />
                    </div>
                  ))}

                  <label
                    className="flex flex-col items-center justify-center w-20 h-20 border border-dashed cursor-pointer shrink-0"
                    style={{ borderColor: 'rgba(184,146,74,0.2)' }}
                  >
                    <Plus size={14} style={{ color: 'rgba(245,240,232,0.2)' }} />
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
                  </label>
                </div>
              </div>

              <F label="Product Name *"   value={name}            onChange={handleNameChange}     placeholder="e.g. Fluted Flexible Stone" />
              <F label="URL Slug *"       value={slug}            onChange={setSlug}              placeholder="auto-generated" mono />
              <F label="Collection Label" value={collectionLabel} onChange={setCollectionLabel}   placeholder="e.g. Surface Collection 01" />
              <F label="Tagline"          value={tagline}         onChange={setTagline}           placeholder="Short poetic line" />
              <F label="Subtitle"         value={subtitle}        onChange={setSubtitle}          placeholder="e.g. CARVED FROM NATURAL STONE" />
              <T label="Brand Statement"  value={brandStatement}  onChange={setBrandStatement}    placeholder="A poetic statement…" rows={3} />
              <T label="Footer Statement" value={footerStatement} onChange={setFooterStatement}   placeholder="e.g. Where stone becomes sculpture." rows={2} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="admin-input mt-1 w-full">
                    <option value="surfaces">Surfaces</option>
                    <option value="lighting">Lighting</option>
                    <option value="objects">Objects</option>
                    <option value="textiles">Textiles & Drapes</option>
                    <option value="bespoke">Bespoke</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="admin-input mt-1 w-full">
                    <option value="active">Active</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
                  <span className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.5)' }}>Featured on homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={priceOnRequest} onChange={e => setPriceOnRequest(e.target.checked)} />
                  <span className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.5)' }}>Price on request</span>
                </label>
              </div>

              {!priceOnRequest && (
                <F label="Price (₦)" value={price} onChange={setPrice} type="number" placeholder="0.00" />
              )}

              <div className="flex gap-3 pt-2 border-t" style={{ borderColor: 'rgba(184,146,74,0.1)' }}>
                <button onClick={() => setStep('template')} className="admin-btn-outline">← Back</button>
                <button onClick={() => setStep('sections')} className="admin-btn-primary">Sections →</button>
              </div>
            </div>
          )}

          {/* STEP 3 — Sections */}
          {step === 'sections' && templateDef && (
            <div className="flex flex-col gap-5">
              <p className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'rgba(245,240,232,0.25)' }}>
                Section images upload immediately when selected
              </p>

              {sections.map((section, sIdx) => {
                const def = templateDef.sections.find(s => s.section_type === section.section_type)
                if (!def) return null
                return (
                  <div key={section.id} className="border overflow-hidden" style={{ borderColor: 'rgba(184,146,74,0.12)' }}>
                    <div
                      className="flex items-center justify-between px-4 py-3 border-b"
                      style={{ borderColor: 'rgba(184,146,74,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical size={12} style={{ color: 'rgba(245,240,232,0.18)' }} />
                        <input
                          type="text"
                          value={section.header}
                          onChange={e => updateSectionHeader(sIdx, e.target.value)}
                          className="bg-transparent font-body text-[9px] tracking-widest uppercase focus:outline-none border-b border-transparent pb-0.5"
                          style={{ color: '#b8924a', borderColor: '#b8924a' }}
                        />
                      </div>
                      <span className="font-body text-[8px]" style={{ color: 'rgba(245,240,232,0.18)' }}>
                        {section.items.length} / {def.max_items}
                      </span>
                    </div>

                    <div className="p-4 flex flex-col gap-3">
                      {section.items.map((item, iIdx) => (
                        <div
                          key={item.id}
                          className="relative p-3 border"
                          style={{ borderColor: 'rgba(184,146,74,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                        >
                          <button
                            onClick={() => removeItem(sIdx, iIdx)}
                            className="absolute top-2 right-2"
                            style={{ color: 'rgba(245,240,232,0.18)' }}
                          >
                            <Trash2 size={11} />
                          </button>

                          <div className="flex gap-3">
                            {def.has_image && (
                              <div className="shrink-0">
                                {item.image_url ? (
                                  <div className="relative w-20 h-20 overflow-hidden group">
                                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                    <label
                                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                                      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                                    >
                                      <Upload size={13} color="white" />
                                      <input type="file" accept="image/*" className="hidden" onChange={e => handleItemImage(sIdx, iIdx, e)} />
                                    </label>
                                    {/* Uploaded indicator */}
                                    {!item.image_url.startsWith('blob:') && (
                                      <div className="absolute bottom-0 left-0 right-0 py-0.5 text-center" style={{ backgroundColor: 'rgba(184,146,74,0.8)' }}>
                                        <span className="font-body text-[7px]" style={{ color: '#0d0d0d' }}>✓</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <label
                                    className="flex flex-col items-center justify-center w-20 h-20 border border-dashed cursor-pointer"
                                    style={{ borderColor: 'rgba(184,146,74,0.2)' }}
                                  >
                                    <Upload size={12} style={{ color: 'rgba(245,240,232,0.2)' }} />
                                    <input type="file" accept="image/*" className="hidden" onChange={e => handleItemImage(sIdx, iIdx, e)} />
                                  </label>
                                )}
                              </div>
                            )}

                            <div className="flex-1 flex flex-col gap-2 pr-6">
                              {def.has_title && (
                                <input
                                  type="text"
                                  placeholder="Title"
                                  value={item.title}
                                  onChange={e => updateItem(sIdx, iIdx, 'title', e.target.value)}
                                  className="admin-input text-xs"
                                />
                              )}
                              {def.has_subtitle && (
                                <input
                                  type="text"
                                  placeholder="Subtitle"
                                  value={item.subtitle}
                                  onChange={e => updateItem(sIdx, iIdx, 'subtitle', e.target.value)}
                                  className="admin-input text-xs"
                                />
                              )}
                              {def.has_body && (
                                <textarea
                                  placeholder={section.section_type === 'specifications' ? 'One spec per item' : 'Description'}
                                  value={item.body}
                                  onChange={e => updateItem(sIdx, iIdx, 'body', e.target.value)}
                                  rows={section.section_type === 'detail' ? 5 : 2}
                                  className="admin-input text-xs resize-none"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {section.items.length < def.max_items && (
                        <button
                          onClick={() => addItem(sIdx)}
                          className="flex items-center gap-2 font-body text-[9px] tracking-widest uppercase self-start"
                          style={{ color: 'rgba(245,240,232,0.22)' }}
                        >
                          <Plus size={10} />
                          Add {def.has_image ? 'Item' : 'Line'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              <div className="flex gap-3 pt-2 border-t" style={{ borderColor: 'rgba(184,146,74,0.1)' }}>
                <button onClick={() => setStep('details')} className="admin-btn-outline">← Back</button>
                <button onClick={() => setStep('review')}  className="admin-btn-primary">Review →</button>
              </div>
            </div>
          )}

          {/* STEP 4 — Review */}
          {step === 'review' && (
            <div className="flex flex-col gap-4">
              <div className="border p-5" style={{ borderColor: 'rgba(184,146,74,0.12)' }}>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    ['Template',  templateDef?.label    ?? '—'],
                    ['Name',      name                  || '—'],
                    ['Category',  category],
                    ['Status',    status],
                    ['Featured',  featured      ? 'Yes' : 'No'],
                    ['Price',     priceOnRequest ? 'On Request' : `₦${price || '0'}`],
                    ['Sections',  `${sections.length}`],
                    ['Cover',     coverUrl      ? '✓ Uploaded' : '— None'],
                    ['Gallery',   `${gallery.length} image${gallery.length !== 1 ? 's' : ''} uploaded`],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <span className="admin-label block mb-0.5">{label}</span>
                      <span className="font-body text-sm" style={{ color: '#f5f0e8' }}>{val}</span>
                    </div>
                  ))}
                </div>

                {coverUrl && (
                  <div className="mt-5 pt-4 border-t" style={{ borderColor: 'rgba(184,146,74,0.1)' }}>
                    <span className="admin-label block mb-2">Cover</span>
                    <img src={coverUrl} alt="Cover" className="w-48 h-32 object-cover" />
                  </div>
                )}
              </div>

              {/* No upload wait — images already done */}
              <div
                className="px-4 py-3 border"
                style={{ borderColor: 'rgba(184,146,74,0.15)', backgroundColor: 'rgba(184,146,74,0.05)' }}
              >
                <p className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.5)' }}>
                  All images already uploaded. Publishing will be instant.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('sections')} disabled={publishing} className="admin-btn-outline">
                  ← Back
                </button>
                <button onClick={handlePublish} disabled={publishing} className="admin-btn-primary flex-1">
                  {publishing ? 'Publishing…' : 'Publish Product'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── RIGHT: Preview ── */}
      <div
        className={`flex-col flex-1 overflow-hidden ${showPreview ? 'flex' : 'hidden lg:flex'}`}
        style={{ backgroundColor: '#0d0d0d' }}
      >
        <ProductPreview product={previewProduct} />
      </div>
    </div>
  )
}

function F({ label, value, onChange, placeholder, type = 'text', mono = false }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; mono?: boolean
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`admin-input mt-1 w-full ${mono ? 'font-mono text-xs' : ''}`}
        autoComplete="off"
      />
    </div>
  )
}

function T({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; rows?: number
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="admin-input mt-1 w-full resize-none"
      />
    </div>
  )
}