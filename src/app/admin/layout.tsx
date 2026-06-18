'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/admin/Sidebar'
import { Menu, X } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen admin-dark" style={{ backgroundColor: '#0d0d0d' }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <div
        className={`
          fixed top-0 left-0 h-full z-50 transition-transform duration-300
          lg:relative lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b lg:hidden shrink-0"
          style={{ borderColor: 'rgba(184,146,74,0.12)', backgroundColor: '#111111' }}
        >
          <div>
            <p className="font-display text-base tracking-widest" style={{ color: '#f5f0e8' }}>
              IHE&apos;RA
            </p>
            <p className="font-body text-[8px] tracking-widest uppercase" style={{ color: 'rgba(184,146,74,0.6)' }}>
              Admin
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2"
            style={{ color: 'rgba(245,240,232,0.6)' }}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}