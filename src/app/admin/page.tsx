import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package, BookOpen, Mail, Eye } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: productCount  },
    { count: journalCount  },
    { count: enquiryCount  },
    { count: viewCount     },
    { count: newEnquiries  },
    { data:  recentEnquiries },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).neq('status', 'archived'),
    supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('enquiries').select('*', { count: 'exact', head: true }),
    supabase.from('page_views').select('*', { count: 'exact', head: true }),
    supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('email_sent', false),
    supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Products',      value: productCount  ?? 0, icon: Package,  href: '/admin/products'  },
    { label: 'Articles',      value: journalCount  ?? 0, icon: BookOpen, href: '/admin/journal'   },
    { label: 'Page Views',    value: viewCount     ?? 0, icon: Eye,      href: '/admin/analytics' },
    { label: 'New Enquiries', value: newEnquiries  ?? 0, icon: Mail,     href: '/admin/enquiries',
      sub: `${enquiryCount ?? 0} total` },
  ]

  return (
    <div
      className="p-4 md:p-8 admin-dark"
      style={{ minHeight: '100vh', backgroundColor: '#0d0d0d' }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl" style={{ color: '#f5f0e8' }}>
          Dashboard
        </h1>
        <p className="font-body text-xs mt-1 tracking-wider" style={{ color: 'rgba(245,240,232,0.3)' }}>
          Welcome back
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href, sub }) => (
          <Link
            key={label}
            href={href}
            className="border p-4 md:p-6 flex flex-col gap-3 transition-colors hover:border-brass/30"
            style={{ borderColor: 'rgba(184,146,74,0.12)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <div className="flex items-center justify-between">
              <span
                className="font-body text-[8px] md:text-[9px] tracking-widest uppercase"
                style={{ color: 'rgba(245,240,232,0.3)' }}
              >
                {label}
              </span>
              <Icon size={13} style={{ color: 'rgba(184,146,74,0.4)' }} />
            </div>
            <p className="font-display text-3xl md:text-4xl" style={{ color: '#f5f0e8' }}>
              {value.toLocaleString()}
            </p>
            {sub && (
              <p className="font-body text-[9px]" style={{ color: 'rgba(245,240,232,0.2)' }}>
                {sub}
              </p>
            )}
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Add Product',    href: '/admin/products/new' },
          { label: 'New Journal',    href: '/admin/journal/new'  },
          { label: 'View Enquiries', href: '/admin/enquiries'    },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="font-body text-[10px] tracking-widest uppercase py-3.5 text-center transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'rgba(184,146,74,0.12)', color: '#b8924a' }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Recent enquiries */}
      <div className="border" style={{ borderColor: 'rgba(184,146,74,0.12)' }}>
        <div
          className="px-4 md:px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'rgba(184,146,74,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
        >
          <span
            className="font-body text-[9px] tracking-widest uppercase"
            style={{ color: 'rgba(245,240,232,0.4)' }}
          >
            Recent Enquiries
          </span>
          <Link
            href="/admin/enquiries"
            className="font-body text-[9px] tracking-widest uppercase transition-opacity hover:opacity-60"
            style={{ color: '#b8924a' }}
          >
            View All →
          </Link>
        </div>

        {!recentEnquiries?.length ? (
          <div className="px-4 md:px-6 py-10 text-center">
            <p className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.2)' }}>
              No enquiries yet.
            </p>
          </div>
        ) : (
          recentEnquiries.map((e: {
            id: string
            name: string
            email: string
            message: string
            created_at: string
          }) => (
            <div
              key={e.id}
              className="px-4 md:px-6 py-4 border-b last:border-0 flex items-start justify-between gap-4"
              style={{ borderColor: 'rgba(184,146,74,0.06)' }}
            >
              <div className="min-w-0 flex-1">
                <p className="font-body text-sm truncate" style={{ color: '#f5f0e8' }}>
                  {e.name}
                </p>
                <p
                  className="font-body text-xs truncate"
                  style={{ color: 'rgba(245,240,232,0.3)' }}
                >
                  {e.email}
                </p>
                <p
                  className="font-body text-xs mt-1 line-clamp-1"
                  style={{ color: 'rgba(245,240,232,0.2)' }}
                >
                  {e.message}
                </p>
              </div>
              <span
                className="font-body text-[9px] shrink-0"
                style={{ color: 'rgba(245,240,232,0.2)' }}
              >
                {new Date(e.created_at).toLocaleDateString('en-GB', {
                  day:   '2-digit',
                  month: 'short',
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}