import { cn } from '@/lib/utils/cn'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'brass' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

export default function Button({
  variant = 'brass',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center tracking-widest uppercase font-body transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
        {
          sm: 'text-[10px] px-5 py-2.5',
          md: 'text-[11px] px-8 py-4',
          lg: 'text-xs px-10 py-5',
        }[size],
        {
          brass:   'bg-brass text-charcoal hover:bg-brass-light',
          outline: 'border border-brass text-brass hover:bg-brass hover:text-charcoal',
          ghost:   'text-cream/60 hover:text-brass',
        }[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
