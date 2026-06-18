import { createClient } from '@/lib/supabase/server'
import StatsCard from '@/components/admin/StatsCard'
import { Package, BookOpen, Mail, Eye } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: productCount  },
    { count: journalCount  },
    { count: enquiryCount  },
    { count: viewCount     },
    { count: newEnquiries  },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).neq('status', 'archived'),
    supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('enquiries').select('*', { count: 'exact', head: true }),
    supabase.from('page_views').select('*', { count: 'exact', head: true }),
    supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
  ])

  // Recent enquiries
  const { data: enquiries } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="font-display text-3xl text-cream">Dashboard</h1>
        <p className="font-body text-xs text-cream/40 mt-1 tracking-wider">
          Welcome back
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatsCard label="Products"   value={productCount  ?? 0} icon={Package}  />
        <StatsCard label="Articles"   value={journalCount  ?? 0} icon={BookOpen} />
        <StatsCard label="Page Views" value={viewCount     ?? 0} icon={Eye}      />
        <StatsCard
          label="New Enquiries"
          value={newEnquiries ?? 0}
          icon={Mail}
          change={`${enquiryCount ?? 0} total`}
          positive={(newEnquiries ?? 0) > 0}
        />
      </div>

      {/* Recent enquiries */}
      <div className="border border-brass/10 p-6">
        <h2 className="font-body text-xs tracking-widest uppercase text-cream/50 mb-6">
          Recent Enquiries
        </h2>
        {enquiries?.length === 0 ? (
          <p className="font-body text-sm text-cream/30">No enquiries yet.</p>
        ) : (
          <div className="flex flex-col gap-0">
            {enquiries?.map((enq: {
              id: string
              name: string
              email: string
              message: string
              status: string
              created_at: string
            }) => (
              <div
                key={enq.id}
                className="flex items-start justify-between py-4 border-b border-brass/5 last:border-0"
              >
                <div>
                  <p className="font-body text-sm text-cream">{enq.name}</p>
                  <p className="font-body text-xs text-cream/40">{enq.email}</p>
                  <p className="font-body text-xs text-cream/30 mt-1 max-w-sm truncate">
                    {enq.message}
                  </p>
                </div>
                <span className={`font-body text-[9px] tracking-widest uppercase px-2 py-1 ${
                  enq.status === 'new'
                    ? 'bg-brass/20 text-brass'
                    : 'bg-charcoal-600 text-cream/30'
                }`}>
                  {enq.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
