'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronLeft, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProductRow {
  id:          string
  name:        string
  category:    string
  status:      string
  cover_image: string | null
  sort_order:  number
}

function SortableRow({ product }: { product: ProductRow }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className="flex items-center gap-4 px-5 py-4 border-b"
      style={{
        transform:       CSS.Transform.toString(transform),
        transition,
        opacity:         isDragging ? 0.5 : 1,
        borderColor:     'rgba(184,146,74,0.08)',
        backgroundColor: isDragging ? 'rgba(184,146,74,0.08)' : 'rgba(255,255,255,0.02)',
        cursor:          isDragging ? 'grabbing' : 'default',
        zIndex:          isDragging ? 50 : 'auto',
      }}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing p-1 transition-colors"
        style={{ color: 'rgba(245,240,232,0.2)', touchAction: 'none' }}
        title="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      {/* Cover thumbnail */}
      <div
        className="w-12 h-12 shrink-0 overflow-hidden"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        {product.cover_image ? (
          <img
            src={product.cover_image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-[8px]" style={{ color: 'rgba(245,240,232,0.15)' }}>
              IHE
            </span>
          </div>
        )}
      </div>

      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm truncate" style={{ color: '#f5f0e8' }}>
          {product.name}
        </p>
        <p
          className="font-body text-[9px] tracking-widests uppercase"
          style={{ color: 'rgba(184,146,74,0.6)' }}
        >
          {product.category}
        </p>
      </div>

      {/* Status */}
      <span
        className="font-body text-[8px] tracking-widests uppercase px-2.5 py-1 shrink-0"
        style={{
          color:           product.status === 'active' ? '#b8924a' : 'rgba(245,240,232,0.25)',
          backgroundColor: product.status === 'active' ? 'rgba(184,146,74,0.1)' : 'rgba(255,255,255,0.04)',
        }}
      >
        {product.status}
      </span>
    </div>
  )
}

export default function ProductSortPage() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('id, name, category, status, cover_image, sort_order')
        .order('sort_order', { ascending: true })
      setProducts((data as ProductRow[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setProducts(prev => {
      const oldIndex = prev.findIndex(p => p.id === active.id)
      const newIndex = prev.findIndex(p => p.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    try {
      await Promise.all(
        products.map((p, i) =>
          supabase
            .from('products')
            .update({ sort_order: i + 1 })
            .eq('id', p.id)
        )
      )
      setSaved(true)
      toast.success('Sort order saved.')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save order.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="p-8 admin-dark"
      style={{ minHeight: '100vh', backgroundColor: '#0d0d0d' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/products')}
            style={{ color: 'rgba(245,240,232,0.3)' }}
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="font-display text-3xl" style={{ color: '#f5f0e8' }}>
              Sort Products
            </h1>
            <p
              className="font-body text-xs mt-1 tracking-wider"
              style={{ color: 'rgba(245,240,232,0.3)' }}
            >
              Drag rows to set display order on the public site
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="admin-btn-primary flex items-center gap-2"
        >
          {saved && <Check size={12} />}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save Order'}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="h-16 animate-pulse"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            />
          ))}
        </div>
      ) : (
        <div className="border" style={{ borderColor: 'rgba(184,146,74,0.12)' }}>
          {/* Column headers */}
          <div
            className="flex items-center gap-4 px-5 py-3 border-b"
            style={{
              borderColor:     'rgba(184,146,74,0.1)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <div className="w-6 shrink-0" />
            <div className="w-12 shrink-0" />
            <span
              className="flex-1 font-body text-[9px] tracking-widests uppercase"
              style={{ color: 'rgba(245,240,232,0.25)' }}
            >
              Product
            </span>
            <span
              className="font-body text-[9px] tracking-widests uppercase"
              style={{ color: 'rgba(245,240,232,0.25)' }}
            >
              Status
            </span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={products.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {products.map(product => (
                <SortableRow key={product.id} product={product} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      <p
        className="font-body text-[9px] mt-4 tracking-wider"
        style={{ color: 'rgba(245,240,232,0.18)' }}
      >
        Changes apply after clicking Save Order.
      </p>
    </div>
  )
}