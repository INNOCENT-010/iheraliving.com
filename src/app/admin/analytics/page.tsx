'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, Eye, TrendingUp, Users } from 'lucide-react'

interface PageStat { path: string; views: number }
interface DayStat  { date: string; views: number }

export default function AnalyticsPage() {
  const [totalViews,     setTotalViews]     = useState(0)
  const [recentViews,    setRecentViews]    = useState(0)
  const [enquiryCount,   setEnquiryCount]   = useState(0)
  const [subscriberCount,setSubscriberCount]= useState(0)
  const [topPages,       setTopPages]       = useState<PageStat[]>([])
  const [dailyStats,     setDailyStats]     = useState<DayStat[]>([])
  const [loading,        setLoading]        = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      await supabase.auth.refreshSession()

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { console.error('No session on analytics page'); setLoading(false); return }

      const thirtyDaysAgo  = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

      const [
        { count: total },
        { count: recent },
        { count: enq },
        { count: subs },
        { data: recentViews },
        { data: dailyViews },
      ] = await Promise.all([
        supabase.from('page_views').select('*', { count: 'exact', head: true }),
        supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('viewed_at', thirtyDaysAgo),
        supabase.from('enquiries').select('*', { count: 'exact', head: true }),
        supabase.from('subscribers').select('*', { count: 'exact', head: true }),
        supabase.from('page_views').select('path').gte('viewed_at', thirtyDaysAgo),
        supabase.from('page_views').select('viewed_at').gte('viewed_at', fourteenDaysAgo).order('viewed_at', { ascending: true }),
      ])

      setTotalViews(total     ?? 0)
      setRecentViews(recent   ?? 0)
      setEnquiryCount(enq     ?? 0)
      setSubscriberCount(subs ?? 0)

      // Top pages
      const pathCounts: Record<string, number> = {}
      for (const row of recentViews || []) {
        pathCounts[row.path] = (pathCounts[row.path] || 0) + 1
      }
      const top = Object.entries(pathCounts)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)
      setTopPages(top)

      // Daily stats
      const dayCounts: Record<string, number> = {}
      for (const row of dailyViews || []) {
        const day = new Date(row.viewed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        dayCounts[day] = (dayCounts[day] || 0) + 1
      }
      setDailyStats(Object.entries(dayCounts).map(([date, views]) => ({ date, views })))
      setLoading(false)
    }
    load()
  }, [])

  const maxDay = Math.max(...dailyStats.map(d => d.views), 1)

  if (loading) return (
    <div
      className="p-4 md:p-8 admin-dark"
      style={{ minHeight: '100vh', backgroundColor: '#0d0d0d' }}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-24 animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    </div>
  )

  return (
    <div
      className="p-4 md:p-8 admin-dark"
      style={{ minHeight: '100vh', backgroundColor: '#0d0d0d' }}
    >
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl" style={{ color: '#f5f0e8' }}>Analytics</h1>
        <p className="font-body text-xs mt-1 tracking-wider" style={{ color: 'rgba(245,240,232,0.3)' }}>
          Last 30 days
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {[
          { label: 'Total Views',     value: totalViews,      icon: Eye       },
          { label: 'Views (30 days)', value: recentViews,     icon: TrendingUp },
          { label: 'Enquiries',       value: enquiryCount,    icon: Users     },
          { label: 'Subscribers',     value: subscriberCount, icon: BarChart3 },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="border p-4 md:p-6"
            style={{ borderColor: 'rgba(184,146,74,0.12)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="font-body text-[8px] md:text-[9px] tracking-widests uppercase"
                style={{ color: 'rgba(245,240,232,0.3)' }}
              >
                {label}
              </span>
              <Icon size={13} style={{ color: 'rgba(184,146,74,0.4)' }} />
            </div>
            <p className="font-display text-3xl md:text-4xl" style={{ color: '#f5f0e8' }}>
              {value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Daily chart */}
        <div className="border" style={{ borderColor: 'rgba(184,146,74,0.12)' }}>
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: 'rgba(184,146,74,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <p className="font-body text-[9px] tracking-widests uppercase" style={{ color: 'rgba(245,240,232,0.4)' }}>
              Daily Views — Last 14 Days
            </p>
          </div>
          <div className="p-5">
            {dailyStats.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.2)' }}>
                  No data yet.
                </p>
              </div>
            ) : (
              <div className="flex items-end gap-1.5 h-32">
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
                      className="font-body text-[6px]"
                      style={{ color: 'rgba(245,240,232,0.2)', writingMode: 'vertical-rl' }}
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
            className="px-5 py-4 border-b"
            style={{ borderColor: 'rgba(184,146,74,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <p className="font-body text-[9px] tracking-widests uppercase" style={{ color: 'rgba(245,240,232,0.4)' }}>
              Top Pages — Last 30 Days
            </p>
          </div>
          {topPages.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.2)' }}>
                No page views yet.
              </p>
            </div>
          ) : (
            <div>
              {topPages.map(({ path, views }, i) => {
                const pct = Math.round((views / topPages[0].views) * 100)
                return (
                  <div
                    key={path}
                    className="flex items-center gap-4 px-5 py-3.5 border-b"
                    style={{ borderColor: 'rgba(184,146,74,0.06)' }}
                  >
                    <span
                      className="font-mono text-[10px] w-4 shrink-0"
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
                        style={{ width: `${pct}%`, backgroundColor: '#b8924a', opacity: 0.4 }}
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