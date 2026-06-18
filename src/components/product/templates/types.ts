import type { Product } from '@/types'

export interface TemplateProps {
  product: Product
  preview?: boolean
  onImageClick?: (images: string[], index: number) => void
}