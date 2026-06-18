import type { Product } from '@/types'
import TextileTemplate  from './templates/TextileTemplate'
import SurfaceTemplate  from './templates/SurfaceTemplate'
import LightingTemplate from './templates/LightingTemplate'
import ObjectTemplate   from './templates/ObjectTemplate'

interface Props {
  product:       Product
  preview?:      boolean
  onImageClick?: (images: string[], index: number) => void
}

export default function ProductTemplate({ product, preview, onImageClick }: Props) {
  switch (product.template) {
    case 'textile':  return <TextileTemplate  product={product} preview={preview} onImageClick={onImageClick} />
    case 'lighting': return <LightingTemplate product={product} preview={preview} onImageClick={onImageClick} />
    case 'object':   return <ObjectTemplate   product={product} preview={preview} onImageClick={onImageClick} />
    case 'surface':
    default:         return <SurfaceTemplate  product={product} preview={preview} onImageClick={onImageClick} />
  }
}