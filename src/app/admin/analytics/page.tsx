
import { createClient } from '@/lib/supabase/server'
import { BarChart3, Eye, TrendingUp, Users } from 'lucide-react'
export const dynamic = 'force-dynamic'
export const revalidate = 0
interface PageStat {
  path:  string
  views: number
}

interface DayStat {
  date:  string
  views: number
}

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Total views
  const { count: totalViews } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })

  // Views last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { count: recentViews } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .gte('viewed_at', thirtyDaysAgo)

  // Top pages
  const { data: rawViews } = await supabase
    .from('page_views')
    .select('path')
    .gte('viewed_at', thirtyDaysAgo)

  // Count by path
  const pathCounts: Record<string, number> = {}
  for (const row of rawViews || []) {
    pathCounts[row.path] = (pathCounts[row.path] || 0) + 1
  }
  const topPages: PageStat[] = Object.entries(pathCounts)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  // Views by day last 14 days
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data: dailyRaw } = await supabase
    .from('page_views')
    .select('viewed_at')
    .gte('viewed_at', fourteenDaysAgo)
    .order('viewed_at', { ascending: true })

  const dayCounts: Record<string, number> = {}
  for (const row of dailyRaw || []) {
    const day = new Date(row.viewed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    dayCounts[day] = (dayCounts[day] || 0) + 1
  }
  const dailyStats: DayStat[] = Object.entries(dayCounts)
    .map(([date, views]) => ({ date, views }))

  const maxDay = Math.max(...dailyStats.map(d => d.views), 1)

  // Enquiries count
  const { count: enquiryCount } = await supabase
    .from('enquiries')
    .select('*', { count: 'exact', head: true })

  // Subscribers count
  const { count: subscriberCount } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact', head: true })

  return (
    <div
      className="p-8 admin-dark"
      style={{ minHeight: '100vh', backgroundColor: '#0d0d0d' }}
    >
      <div className="mb-10">
        <h1 className="font-display text-3xl" style={{ color: '#f5f0e8' }}>Analytics</h1>
        <p
          className="font-body text-xs mt-1 tracking-wider"
          style={{ color: 'rgba(245,240,232,0.3)' }}
        >
          Last 30 days
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Views',       value: totalViews    ?? 0, icon: Eye       },
          { label: 'Views (30 days)',   value: recentViews   ?? 0, icon: TrendingUp },
          { label: 'Enquiries',         value: enquiryCount  ?? 0, icon: Users     },
          { label: 'Subscribers',       value: subscriberCount ?? 0, icon: BarChart3 },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="border p-6"
            style={{ borderColor: 'rgba(184,146,74,0.12)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="font-body text-[9px] tracking-widest uppercase"
                style={{ color: 'rgba(245,240,232,0.3)' }}
              >
                {label}
              </span>
              <Icon size={14} style={{ color: 'rgba(184,146,74,0.4)' }} />
            </div>
            <p className="font-display text-4xl" style={{ color: '#f5f0e8' }}>
              {value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Daily chart */}
        <div className="border" style={{ borderColor: 'rgba(184,146,74,0.12)' }}>
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: 'rgba(184,146,74,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <p
              className="font-body text-[9px] tracking-widest uppercase"
              style={{ color: 'rgba(245,240,232,0.4)' }}
            >
              Daily Views — Last 14 Days
            </p>
          </div>
          <div className="p-6">
            {dailyStats.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.2)' }}>
                  No data yet. Views will appear as visitors arrive.
                </p>
              </div>
            ) : (
              <div className="flex items-end gap-2 h-40">
                {dailyStats.map(({ date, views }) => (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full transition-all duration-500"
                      style={{
                        height:          `${Math.round((views / maxDay) * 100)}%`,
                        minHeight:       '2px',
                        backgroundColor: '#b8924a',
                        opacity:         0.7,
                      }}
                      title={`${views} views`}
                    />
                    <span
                      className="font-body text-[7px] rotate-45 origin-left"
                      style={{ color: 'rgba(245,240,232,0.2)' }}
                    >
                      {date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top pages */}
        <div className="border" style={{ borderColor: 'rgba(184,146,74,0.12)' }}>
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: 'rgba(184,146,74,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <p
              className="font-body text-[9px] tracking-widest uppercase"
              style={{ color: 'rgba(245,240,232,0.4)' }}
            >
              Top Pages — Last 30 Days
            </p>
          </div>

          {topPages.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.2)' }}>
                No page views recorded yet.
              </p>
            </div>
          ) : (
            <div>
              {topPages.map(({ path, views }, i) => {
                const pct = Math.round((views / topPages[0].views) * 100)
                return (
                  <div
                    key={path}
                    className="flex items-center gap-4 px-6 py-4 border-b"
                    style={{ borderColor: 'rgba(184,146,74,0.06)' }}
                  >
                    <span
                      className="font-mono text-[10px] w-5 shrink-0"
                      style={{ color: 'rgba(245,240,232,0.2)' }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-body text-xs truncate mb-1"
                        style={{ color: '#f5f0e8' }}
                      >
                        {path}
                      </p>
                      <div
                        className="h-px"
                        style={{
                          width:           `${pct}%`,
                          backgroundColor: '#b8924a',
                          opacity:         0.4,
                        }}
                      />
                    </div>
                    <span
                      className="font-body text-xs shrink-0"
                      style={{ color: 'rgba(245,240,232,0.4)' }}
                    >
                      {views.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}