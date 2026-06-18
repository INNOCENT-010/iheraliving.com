import { createClient } from '@/lib/supabase/client'

// Convert any image file to a compressed JPEG blob
async function compressImage(file: File, maxWidth = 1600, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas  = document.createElement('canvas')
      const scale   = Math.min(1, maxWidth / img.width)
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(file); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image load failed'))
    }

    img.src = url
  })
}

export async function uploadProductImage(
  file: File,
  productSlug: string,
  folder: string = 'general'
): Promise<string | null> {
  const supabase = createClient()

  await supabase.auth.refreshSession()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    console.error('Upload error: No active session')
    return null
  }

  try {
    // Compress all images to JPEG before upload
    // This also fixes .jfif, .webp, .heic etc.
    const compressed = await compressImage(file)
    const filename   = `${productSlug}/${folder}/${Date.now()}.jpg`

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filename, compressed, {
        upsert:      true,
        contentType: 'image/jpeg',
      })

    if (error) {
      console.error('Upload error:', error.message)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (err) {
    console.error('Upload processing error:', err)
    return null
  }
}

// Safe preview URL — compresses before creating blob URL
// Use this instead of URL.createObjectURL directly
export async function createSafePreview(file: File): Promise<string> {
  try {
    const compressed = await compressImage(file, 800, 0.75)
    return URL.createObjectURL(compressed)
  } catch {
    // Fallback to direct object URL
    return URL.createObjectURL(file)
  }
}