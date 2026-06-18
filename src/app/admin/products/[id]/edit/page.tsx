'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadProductImage } from '@/lib/utils/upload'
import { getTemplate } from '@/lib/utils/templates'
import { ChevronLeft, Plus, Trash2, Upload, GripVertical, X } from 'lucide-react'
import ProductPreview from '@/components/admin/ProductPreview'
import toast from 'react-hot-toast'
import type { Product, ProductSection, SectionType } from '@/types'

interface ItemDraft {
  id:         string
  db_id:      string | null
  image_url:  string | null
  imageFile:  File | null
  title:      string
  subtitle:   string
  body:       string
  sort_order: number
}

interface SectionDraft {
  id:           string
  db_id:        string | null
  section_type: SectionType
  header:       string
  sort_order:   number
  items:        ItemDraft[]
}

export default function EditProductPage() {
  const router    = useRouter()
  const params    = useParams()
  const productId = params.id as string

  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [product,  setProduct]  = useState<Product | null>(null)

  // Core fields
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
  const [coverPreview,    setCoverPreview]    = useState<string | null>(null)
  const [coverFile,       setCoverFile]       = useState<File | null>(null)
  const [galleryItems,    setGalleryItems]    = useState<{ url: string; file: File | null; isNew: boolean }[]>([])
  const [sections,        setSections]        = useState<SectionDraft[]>([])
  const [deletedImages,   setDeletedImages]   = useState<string[]>([])
  const [deletedItems,    setDeletedItems]    = useState<string[]>([])
  const [deletedSections, setDeletedSections] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select(`*, sections:product_sections(*, items:section_items(*))`)
        .eq('id', productId)
        .single()

      if (!data) { router.push('/admin/products'); return }

      const p = data as Product
      setProduct(p)
      setName(p.name)
      setSlug(p.slug)
      setCategory(p.category)
      setTagline(p.tagline || '')
      setSubtitle(p.subtitle || '')
      setBrandStatement(p.brand_statement || '')
      setFooterStatement(p.footer_statement || '')
      setCollectionLabel(p.collection_label || 'Collection')
      setStatus(p.status)
      setFeatured(p.featured)
      setPriceOnRequest(p.price_on_request)
      setPrice(p.price ? String(p.price) : '')
      setCoverPreview(p.cover_image)

      // Gallery
      setGalleryItems((p.images || []).map(url => ({ url, file: null, isNew: false })))

      // Sections
      const sorted = (p.sections || [])
        .sort((a: ProductSection, b: ProductSection) => a.sort_order - b.sort_order)
        .map((s: ProductSection) => ({
          id:           s.id,
          db_id:        s.id,
          section_type: s.section_type,
          header:       s.header,
          sort_order:   s.sort_order,
          items: (s.items || [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(item => ({
              id:         item.id,
              db_id:      item.id,
              image_url:  item.image_url,
              imageFile:  null,
              title:      item.title || '',
              subtitle:   item.subtitle || '',
              body:       item.body || '',
              sort_order: item.sort_order,
            })),
        }))

      setSections(sorted)
      setLoading(false)
    }
    load()
  }, [productId, router])

  function newItem(): ItemDraft {
    return { id: Math.random().toString(36).slice(2), db_id: null, image_url: null, imageFile: null, title: '', subtitle: '', body: '', sort_order: 0 }
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  function handleGalleryAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setGalleryItems(prev => [...prev, ...files.map(f => ({ url: URL.createObjectURL(f), file: f, isNew: true }))])
  }

  function removeGalleryItem(index: number) {
    const item = galleryItems[index]
    if (!item.isNew) setDeletedImages(prev => [...prev, item.url])
    setGalleryItems(prev => prev.filter((_, i) => i !== index))
  }

  function updateSectionHeader(sIdx: number, val: string) {
    setSections(prev => prev.map((s, i) => i === sIdx ? { ...s, header: val } : s))
  }

  function addItem(sIdx: number) {
    setSections(prev => prev.map((s, i) => i === sIdx ? { ...s, items: [...s.items, newItem()] } : s))
  }

  function removeItem(sIdx: number, iIdx: number) {
    const item = sections[sIdx].items[iIdx]
    if (item.db_id) setDeletedItems(prev => [...prev, item.db_id!])
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, items: s.items.filter((_, j) => j !== iIdx) } : s
    ))
  }

  function updateItem(sIdx: number, iIdx: number, field: string, val: string) {
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, items: s.items.map((item, j) => j === iIdx ? { ...item, [field]: val } : item) } : s
    ))
  }

  function handleItemImage(sIdx: number, iIdx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? {
        ...s,
        items: s.items.map((item, j) => j === iIdx ? { ...item, imageFile: file, image_url: preview } : item),
      } : s
    ))
  }

  function removeSection(sIdx: number) {
    const sec = sections[sIdx]
    if (sec.db_id) setDeletedSections(prev => [...prev, sec.db_id!])
    setSections(prev => prev.filter((_, i) => i !== sIdx))
  }

  async function handleSave() {
    if (!name || !slug) { toast.error('Name required.'); return }
    setSaving(true)
    const supabase = createClient()

    try {
      // 1. Upload new cover
      let coverUrl = product?.cover_image || null
      if (coverFile) coverUrl = await uploadProductImage(coverFile, slug, 'cover')

      // 2. Upload new gallery images
      const finalGallery: string[] = []
      for (const item of galleryItems) {
        if (item.isNew && item.file) {
          const url = await uploadProductImage(item.file, slug, 'gallery')
          if (url) finalGallery.push(url)
        } else if (!item.isNew) {
          finalGallery.push(item.url)
        }
      }

      // 3. Update product
      const { error: productError } = await supabase
        .from('products')
        .update({
          name, slug, category,
          tagline:           tagline          || null,
          subtitle:          subtitle         || null,
          brand_statement:   brandStatement   || null,
          footer_statement:  footerStatement  || null,
          collection_label:  collectionLabel  || 'Collection',
          status, featured,
          price_on_request:  priceOnRequest,
          price:             priceOnRequest ? null : parseFloat(price) || null,
          cover_image:       coverUrl,
          images:            finalGallery,
        })
        .eq('id', productId)

      if (productError) throw productError

      // 4. Delete removed items and sections
      if (deletedItems.length)    await supabase.from('section_items').delete().in('id', deletedItems)
      if (deletedSections.length) await supabase.from('product_sections').delete().in('id', deletedSections)

      // 5. Upsert sections and items
      for (let sIdx = 0; sIdx < sections.length; sIdx++) {
        const sec = sections[sIdx]

        let sectionId = sec.db_id
        if (sectionId) {
          await supabase.from('product_sections')
            .update({ header: sec.header, sort_order: sIdx })
            .eq('id', sectionId)
        } else {
          const { data: newSec } = await supabase.from('product_sections')
            .insert({ product_id: productId, section_type: sec.section_type, header: sec.header, sort_order: sIdx })
            .select().single()
          sectionId = newSec?.id
        }

        if (!sectionId) continue

        for (let iIdx = 0; iIdx < sec.items.length; iIdx++) {
          const item = sec.items[iIdx]
          let imageUrl = item.image_url

          // Upload new image if changed
          if (item.imageFile) {
            imageUrl = await uploadProductImage(item.imageFile, slug, `s${sIdx}`)
          }

          const hasContent = item.title || item.body || item.subtitle || imageUrl
          if (!hasContent) continue

          if (item.db_id) {
            await supabase.from('section_items')
              .update({
                image_url:  imageUrl,
                title:      item.title    || null,
                subtitle:   item.subtitle || null,
                body:       item.body     || null,
                sort_order: iIdx,
              })
              .eq('id', item.db_id)
          } else {
            await supabase.from('section_items').insert({
              section_id: sectionId,
              image_url:  imageUrl,
              title:      item.title    || null,
              subtitle:   item.subtitle || null,
              body:       item.body     || null,
              sort_order: iIdx,
            })
          }
        }
      }

      toast.success('Product saved.')
      router.push('/admin/products')
    } catch (err) {
      console.error(err)
      toast.error('Error saving. Check console.')
    } finally {
      setSaving(false)
    }
  }

  const templateDef = product?.template ? getTemplate(product.template) : null

  // Build preview product
  const previewProduct = {
    ...(product || {}),
    name, slug, category: category as Product['category'],
    template: product?.template || 'surface',
    tagline: tagline || null,
    subtitle: subtitle || null,
    brand_statement: brandStatement || null,
    footer_statement: footerStatement || null,
    collection_label: collectionLabel,
    status: status as Product['status'],
    featured, price_on_request: priceOnRequest,
    price: priceOnRequest ? null : parseFloat(price) || null,
    cover_image: coverPreview,
    images: galleryItems.map(g => g.url),
    materials: product?.materials || [],
    sections: sections.map((s, si) => ({
      id: s.id, product_id: productId,
      section_type: s.section_type, header: s.header, sort_order: si,
      created_at: new Date().toISOString(),
      items: s.items.map((item, ii) => ({
        id: item.id, section_id: s.id,
        image_url: item.image_url, title: item.title || null,
        subtitle: item.subtitle || null, body: item.body || null,
        sort_order: ii, created_at: new Date().toISOString(),
      })),
    })) as ProductSection[],
  } as Partial<Product>

  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <p className="font-body text-xs tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>
        Loading...
      </p>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>

      {/* ── LEFT: Form ── */}
      <div
        className="w-full lg:w-[480px] xl:w-[520px] shrink-0 flex flex-col border-r overflow-hidden"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-4 px-6 py-5 border-b shrink-0"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}
        >
          <button onClick={() => router.back()} style={{ color: 'var(--text-faint)' }}>
            <ChevronLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg truncate" style={{ color: 'var(--text)' }}>
              {name || 'Edit Product'}
            </p>
            <p className="font-body text-[9px] tracking-widest uppercase mt-0.5" style={{ color: 'var(--text-faint)' }}>
              {product?.template} template · {category}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-btn-primary shrink-0 text-[9px] px-5 py-2.5"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-7">

          {/* Cover */}
          <div>
            <label className="admin-label">Cover Image</label>
            <div className="mt-2">
              {coverPreview ? (
                <div className="relative w-full aspect-video overflow-hidden">
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  <label
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                  >
                    <Upload size={20} color="white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                  </label>
                </div>
              ) : (
                <label
                  className="flex flex-col items-center justify-center w-full aspect-video border border-dashed cursor-pointer"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Upload size={18} style={{ color: 'var(--text-faint)', marginBottom: 6 }} />
                  <span className="font-body text-[9px] tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>
                    Upload Cover
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                </label>
              )}
            </div>
          </div>

          {/* Gallery */}
          <div>
            <label className="admin-label">Gallery</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {galleryItems.map((item, i) => (
                <div key={i} className="relative w-20 h-20 overflow-hidden group">
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeGalleryItem(i)}
                    className="absolute top-1 right-1 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: 'white' }}
                  >
                    <X size={9} />
                  </button>
                </div>
              ))}
              <label
                className="flex items-center justify-center w-20 h-20 border border-dashed cursor-pointer"
                style={{ borderColor: 'var(--border)' }}
              >
                <Plus size={14} style={{ color: 'var(--text-faint)' }} />
                <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleGalleryAdd} />
              </label>
            </div>
          </div>

          {/* Core fields */}
          <F label="Product Name *" value={name} onChange={v => {
            setName(v)
            setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
          }} />
          <F label="URL Slug *"        value={slug}            onChange={setSlug} mono />
          <F label="Collection Label"  value={collectionLabel} onChange={setCollectionLabel} />
          <F label="Tagline"           value={tagline}         onChange={setTagline} />
          <F label="Subtitle"          value={subtitle}        onChange={setSubtitle} />
          <T label="Brand Statement"   value={brandStatement}  onChange={setBrandStatement} />
          <T label="Footer Statement"  value={footerStatement} onChange={setFooterStatement} rows={2} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="admin-input mt-2 w-full">
                <option value="surfaces">Surfaces</option>
                <option value="lighting">Lighting</option>
                <option value="objects">Objects</option>
                <option value="bespoke">Bespoke</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="admin-input mt-2 w-full">
                <option value="active">Active</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="accent-brass" />
              <span className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={priceOnRequest} onChange={e => setPriceOnRequest(e.target.checked)} className="accent-brass" />
              <span className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>Price on request</span>
            </label>
          </div>

          {!priceOnRequest && <F label="Price (₦)" value={price} onChange={setPrice} type="number" />}

          {/* Sections */}
          <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
            <p className="admin-label mb-4">Content Sections</p>
            <div className="flex flex-col gap-6">
              {sections.map((section, sIdx) => {
                const def = templateDef?.sections.find(s => s.section_type === section.section_type)
                return (
                  <div key={section.id} className="border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                    {/* Section header */}
                    <div
                      className="flex items-center justify-between px-4 py-3 border-b"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical size={12} style={{ color: 'var(--text-faint)' }} />
                        <input
                          type="text"
                          value={section.header}
                          onChange={e => updateSectionHeader(sIdx, e.target.value)}
                          className="bg-transparent font-body text-[9px] tracking-widest uppercase focus:outline-none border-b border-transparent focus:border-b pb-0.5 transition-colors"
                          style={{ color: 'var(--brass)', borderColor: 'var(--brass)' }}
                        />
                      </div>
                      <button
                        onClick={() => removeSection(sIdx)}
                        style={{ color: 'var(--text-faint)' }}
                        className="hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>

                    {/* Items */}
                    <div className="p-4 flex flex-col gap-4">
                      {section.items.map((item, iIdx) => (
                        <div
                          key={item.id}
                          className="relative p-3 border"
                          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}
                        >
                          <button
                            onClick={() => removeItem(sIdx, iIdx)}
                            className="absolute top-2 right-2 transition-colors"
                            style={{ color: 'var(--text-faint)' }}
                          >
                            <Trash2 size={11} />
                          </button>

                          <div className="flex gap-3">
                            {def?.has_image && (
                              <div className="shrink-0">
                                {item.image_url ? (
                                  <div className="relative w-20 h-20 overflow-hidden">
                                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                    <label
                                      className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                                      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                                    >
                                      <Upload size={12} color="white" />
                                      <input type="file" accept="image/*" className="hidden" onChange={e => handleItemImage(sIdx, iIdx, e)} />
                                    </label>
                                  </div>
                                ) : (
                                  <label
                                    className="flex flex-col items-center justify-center w-20 h-20 border border-dashed cursor-pointer"
                                    style={{ borderColor: 'var(--border)' }}
                                  >
                                    <Upload size={12} style={{ color: 'var(--text-faint)' }} />
                                    <input type="file" accept="image/*" className="hidden" onChange={e => handleItemImage(sIdx, iIdx, e)} />
                                  </label>
                                )}
                              </div>
                            )}
                            <div className="flex-1 flex flex-col gap-2 pr-6">
                              {def?.has_title    && <input type="text" placeholder="Title"    value={item.title}    onChange={e => updateItem(sIdx, iIdx, 'title',    e.target.value)} className="admin-input text-xs" />}
                              {def?.has_subtitle && <input type="text" placeholder="Subtitle" value={item.subtitle} onChange={e => updateItem(sIdx, iIdx, 'subtitle', e.target.value)} className="admin-input text-xs" />}
                              {def?.has_body     && (
                                <textarea
                                  placeholder="Description"
                                  value={item.body}
                                  onChange={e => updateItem(sIdx, iIdx, 'body', e.target.value)}
                                  rows={section.section_type === 'detail' ? 4 : 2}
                                  className="admin-input text-xs resize-none"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {(!def || section.items.length < def.max_items) && (
                        <button
                          onClick={() => addItem(sIdx)}
                          className="flex items-center gap-2 font-body text-[9px] tracking-widest uppercase self-start transition-colors"
                          style={{ color: 'var(--text-faint)' }}
                        >
                          <Plus size={10} />
                          Add Item
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Product-Journal linking */}
          <ProductJournalLinker productId={productId} />

          <div className="pb-8">
            <button onClick={handleSave} disabled={saving} className="admin-btn-primary w-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Live Preview ── */}
      <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
        <ProductPreview product={previewProduct} />
      </div>
    </div>
  )
}

// ── Product-Journal Linker ──
function ProductJournalLinker({ productId }: { productId: string }) {
  const [journals,  setJournals]  = useState<{ id: string; title: string; slug: string }[]>([])
  const [linked,    setLinked]    = useState<string[]>([])
  const [loadingJ,  setLoadingJ]  = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: all }, { data: links }] = await Promise.all([
        supabase.from('journal_entries').select('id, title, slug').eq('status', 'published').order('created_at', { ascending: false }),
        supabase.from('product_journals').select('journal_id').eq('product_id', productId),
      ])
      setJournals(all || [])
      setLinked((links || []).map((l: { journal_id: string }) => l.journal_id))
      setLoadingJ(false)
    }
    load()
  }, [productId])

  async function toggle(journalId: string) {
    const supabase = createClient()
    if (linked.includes(journalId)) {
      await supabase.from('product_journals')
        .delete()
        .eq('product_id', productId)
        .eq('journal_id', journalId)
      setLinked(prev => prev.filter(id => id !== journalId))
      toast.success('Journal unlinked.')
    } else {
      await supabase.from('product_journals').insert({ product_id: productId, journal_id: journalId })
      setLinked(prev => [...prev, journalId])
      toast.success('Journal linked.')
    }
  }

  if (loadingJ) return null

  return (
    <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
      <p className="admin-label mb-4">Linked Journal Entries</p>
      {!journals.length ? (
        <p className="font-body text-xs" style={{ color: 'var(--text-faint)' }}>
          No published journal entries yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {journals.map(j => (
            <label key={j.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={linked.includes(j.id)}
                onChange={() => toggle(j.id)}
                className="accent-brass"
              />
              <span
                className="font-body text-xs transition-colors duration-200"
                style={{ color: linked.includes(j.id) ? 'var(--brass)' : 'var(--text-muted)' }}
              >
                {j.title}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Field helpers ──
function F({ label, value, onChange, placeholder, type = 'text', mono = false }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; mono?: boolean
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`admin-input mt-1 w-full ${mono ? 'font-mono text-xs' : ''}`} />
    </div>
  )
}

function T({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        rows={rows} className="admin-input mt-1 w-full resize-none" />
    </div>
  )
}