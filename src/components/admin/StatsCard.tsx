import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label:       string
  value:       string | number
  icon:        LucideIcon
  change?:     string
  positive?:   boolean
  className?:  string
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  change,
  positive,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'bg-charcoal-700/40 border border-brass/10 p-6 flex flex-col gap-4',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-body text-[10px] tracking-widest uppercase text-cream/40">
          {label}
        </span>
        <Icon size={16} className="text-brass/40" />
      </div>
      <div>
        <p className="font-display text-3xl text-cream">{value}</p>
        {change && (
          <p className={cn(
            'font-body text-xs mt-1',
            positive ? 'text-green-400/70' : 'text-cream/30'
          )}>
            {change}
          </p>
        )}
      </div>
    </div>
  )
}
