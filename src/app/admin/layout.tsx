import AdminSidebar from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen admin-dark" style={{ backgroundColor: '#0d0d0d' }}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto admin-dark">{children}</main>
    </div>
  )
}