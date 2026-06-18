import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PageTracker from '@/components/layout/PageTracker'

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: settingsRows } = await supabase
    .from('site_settings')
    .select('key, value')

  const settings: Record<string, string> = {}
  for (const row of settingsRows || []) {
    settings[row.key] = typeof row.value === 'string'
      ? row.value.replace(/^"|"$/g, '')
      : String(row.value)
  }

  return (
    <>
      <PageTracker />
      <Navbar />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  )
}