import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatDateLong(date: string | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'MMMM dd, yyyy')
}

export function formatRelative(date: string | null | undefined): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatPrice(price: number | null, on_request: boolean): string {
  if (on_request || !price) return 'Price on Request'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(price)
}

export function truncate(str: string | null | undefined, length = 120): string {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}
