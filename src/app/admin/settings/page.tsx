'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X } from 'lucide-react'
import { uploadProductImage } from '@/lib/utils/upload'
import toast from 'react-hot-toast'

interface Setting {
  key:   string
  value: string
  label: string
}

const SETTING_LABELS: Record<string, string> = {
  hero_image:      'Hero Image',
  hero_headline:   'Hero Headline',
  hero_subline:    'Hero Subline',
  brand_statement: 'Brand Statement',
  contact_email:   'Contact Email',
  contact_whatsapp:  'WhatsApp URL',
  contact_instagram: 'Instagram URL',
}

export default function SettingsPage() {
  const [settings,      setSettings]      = useState<Setting[]>([])
  const [saving,        setSaving]        = useState(false)
  const [heroPreview,   setHeroPreview]   = useState<string | null>(null)
  const [heroUploading, setHeroUploading] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      const supabase = createClient()
      const { data } = await supabase.from('site_settings').select('*')
      const mapped = (data || []).map((s: { key: string; value: unknown }) => ({
        key:   s.key,
        value: typeof s.value === 'string'
          ? s.value
          : JSON.stringify(s.value).replace(/^"|"$/g, ''),
        label: SETTING_LABELS[s.key] || s.key,
      }))
      setSettings(mapped)

      // Set hero preview
      const hero = mapped.find(s => s.key === 'hero_image')
      if (hero?.value) setHeroPreview(hero.value)
    }
    fetchSettings()
  }, [])

  function updateValue(key: string, value: string) {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s))
    if (key === 'hero_image') setHeroPreview(value)
  }

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 30 * 1024 * 1024) { toast.error('Max 30 MB.'); return }

    setHeroUploading(true)
    const tid = toast.loading('Uploading hero image…')
    const url = await uploadProductImage(file, 'site', 'hero')
    toast.dismiss(tid)

    if (url) {
      updateValue('hero_image', url)
      toast.success('Hero image uploaded.')
    } else {
      toast.error('Upload failed.')
    }
    setHeroUploading(false)
  }

  async function saveSettings() {
    setSaving(true)
    const supabase = createClient()

    for (const setting of settings) {
      await supabase
        .from('site_settings')
        .upsert(
          { key: setting.key, value: setting.value },
          { onConflict: 'key' }
        )
    }

    toast.success('Settings saved.')
    setSaving(false)
  }

  const heroSetting  = settings.find(s => s.key === 'hero_image')
  const otherSettings = settings.filter(s => s.key !== 'hero_image')

  return (
    <div className="p-8 max-w-2xl admin-dark" style={{ backgroundColor: '#0d0d0d', minHeight: '100vh' }}>
      <div className="mb-10">
        <h1 className="font-display text-3xl" style={{ color: '#f5f0e8' }}>Settings</h1>
        <p className="font-body text-xs mt-1 tracking-wider" style={{ color: 'rgba(245,240,232,0.3)' }}>
          Site content and configuration
        </p>
      </div>

      <div className="flex flex-col gap-8">

        {/* Hero Image */}
        <div className="border p-6" style={{ borderColor: 'rgba(184,146,74,0.15)' }}>
          <p className="admin-label mb-4">Hero Image</p>

          {heroPreview ? (
            <div className="relative w-full overflow-hidden mb-4" style={{ aspectRatio: '16/7' }}>
              <img src={heroPreview} alt="Hero" className="w-full h-full object-cover" />
              <button
                onClick={() => { updateValue('hero_image', ''); setHeroPreview(null) }}
                className="absolute top-3 right-3 p-1.5"
                style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white' }}
              >
                <X size={14} />
              </button>
              <div
                className="absolute bottom-3 left-3 font-body text-[8px] tracking-widest uppercase px-2.5 py-1"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#b8924a' }}
              >
                Current Hero
              </div>
            </div>
          ) : (
            <div
              className="w-full flex items-center justify-center border border-dashed mb-4"
              style={{ aspectRatio: '16/7', borderColor: 'rgba(184,146,74,0.2)' }}
            >
              <p className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.2)' }}>
                No hero image set
              </p>
            </div>
          )}

          <div className="flex gap-3 items-center">
            <label
              className="flex items-center gap-2 font-body text-[9px] tracking-widest uppercase px-5 py-3 cursor-pointer transition-colors"
              style={{ backgroundColor: 'rgba(184,146,74,0.15)', color: '#b8924a', borderColor: 'rgba(184,146,74,0.3)', border: '1px solid' }}
            >
              <Upload size={12} />
              {heroUploading ? 'Uploading…' : 'Upload New Hero'}
              <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} disabled={heroUploading} />
            </label>

            <p className="font-body text-[9px]" style={{ color: 'rgba(245,240,232,0.2)' }}>
              Recommended: 1800 × 900px · JPG
            </p>
          </div>

          {/* Or paste URL */}
          {heroSetting && (
            <div className="mt-4">
              <label className="admin-label">Or paste image URL</label>
              <input
                type="text"
                value={heroSetting.value}
                onChange={e => updateValue('hero_image', e.target.value)}
                placeholder="https://…"
                className="admin-input mt-1 w-full"
              />
            </div>
          )}
        </div>

        {/* Other settings */}
        {otherSettings.map(setting => (
          <div key={setting.key}>
            <label className="admin-label">{setting.label}</label>
            {setting.value.length > 80 || setting.key === 'brand_statement' ? (
              <textarea
                rows={3}
                value={setting.value}
                onChange={e => updateValue(setting.key, e.target.value)}
                className="admin-input mt-2 w-full resize-none"
              />
            ) : (
              <input
                type="text"
                value={setting.value}
                onChange={e => updateValue(setting.key, e.target.value)}
                className="admin-input mt-2 w-full"
              />
            )}
          </div>
        ))}

        <button
          onClick={saveSettings}
          disabled={saving}
          className="admin-btn-primary self-start mt-2"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}