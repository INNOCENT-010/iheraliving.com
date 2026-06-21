'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard, Package, BookOpen,
  BarChart3, Settings, LogOut,
  Mail, FileText, Send, X,
} from 'lucide-react'

const navItems = [
  { href: '/admin',           icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/admin/products',  icon: Package,         label: 'Products'   },
  { href: '/admin/journal',   icon: BookOpen,        label: 'Journal'    },
  { href: '/admin/drafts',    icon: FileText,        label: 'Drafts'     },
  { href: '/admin/enquiries', icon: Mail,            label: 'Enquiries'  },
  { href: '/admin/marketing', icon: Send,            label: 'Marketing'  },
  { href: '/admin/analytics', icon: BarChart3,       label: 'Analytics'  },
  { href: '/admin/settings',  icon: Settings,        label: 'Settings'   },
]

interface Props {
  onNavigate?: () => void
}

export default function AdminSidebar({ onNavigate }: Props) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
  const supabase = createClient()
  await supabase.auth.signOut({ scope: 'local' })
  router.refresh()
  router.push('/login')
}

  return (
    <aside
      className="w-56 h-full flex flex-col shrink-0"
      style={{ backgroundColor: '#111111', borderRight: '1px solid rgba(184,146,74,0.12)' }}
    >
      {/* Logo + close on mobile */}
      <div
        className="flex items-center justify-between px-6 py-7 border-b"
        style={{ borderColor: 'rgba(184,146,74,0.12)' }}
      >
        <div>
          <p className="font-display text-lg tracking-widest" style={{ color: '#f5f0e8' }}>
            IHE&apos;RA
          </p>
          <p
            className="font-body text-[8px] tracking-widest uppercase mt-0.5"
            style={{ color: 'rgba(184,146,74,0.6)' }}
          >
            Admin
          </p>
        </div>
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="lg:hidden p-1"
            style={{ color: 'rgba(245,240,232,0.3)' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href ||
            (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-3 transition-all duration-200 font-body text-xs tracking-wider'
              )}
              style={{
                backgroundColor: active ? 'rgba(184,146,74,0.12)' : 'transparent',
                color:           active ? '#b8924a' : 'rgba(245,240,232,0.4)',
              }}
            >
              <Icon size={14} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div
        className="px-3 py-5 border-t"
        style={{ borderColor: 'rgba(184,146,74,0.1)' }}
      >
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full font-body text-xs tracking-wider transition-colors"
          style={{ color: 'rgba(245,240,232,0.22)' }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}