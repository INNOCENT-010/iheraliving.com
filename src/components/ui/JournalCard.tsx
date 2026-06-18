import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { formatDateLong } from '@/lib/utils/formatters'
import type { JournalEntry } from '@/types'

interface JournalCardProps {
  entry: JournalEntry
  className?: string
  variant?: 'default' | 'featured'
}

export default function JournalCard({
  entry,
  className,
  variant = 'default',
}: JournalCardProps) {
  return (
    <Link
      href={`/journal/${entry.slug}`}
      className={cn('group block', className)}
    >
      {/* Image */}
      <div className={cn(
        'relative overflow-hidden bg-charcoal-700 mb-5',
        variant === 'featured' ? 'aspect-[16/9]' : 'aspect-[4/3]'
      )}>
        {entry.cover_image ? (
          <Image
            src={entry.cover_image}
            alt={entry.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-charcoal-600" />
        )}
        <div className="absolute bottom-0 left-0 w-0 h-px bg-brass group-hover:w-full transition-all duration-500" />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 mb-3">
        <span className="font-body text-[9px] tracking-widest uppercase text-brass">
          {formatDateLong(entry.published_at)}
        </span>
        <span className="text-cream/20">·</span>
        <span className="font-body text-[9px] tracking-widest uppercase text-cream/40">
          {entry.read_time} min read
        </span>
      </div>

      <h3 className={cn(
        'font-display text-cream group-hover:text-brass transition-colors duration-300 leading-snug',
        variant === 'featured' ? 'text-2xl' : 'text-xl'
      )}>
        {entry.title}
      </h3>

      {entry.excerpt && (
        <p className="font-body text-sm text-cream/40 mt-2 leading-relaxed line-clamp-2">
          {entry.excerpt}
        </p>
      )}

      <span className="inline-block mt-4 font-body text-[10px] tracking-widest uppercase text-brass/60 group-hover:text-brass transition-colors duration-300">
        Read →
      </span>
    </Link>
  )
}
