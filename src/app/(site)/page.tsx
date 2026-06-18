import { createClient } from '@/lib/supabase/server'
import Hero from '@/components/home/Hero'
import HomeProducts from '@/components/home/HomeProducts'
import HomeJournal from '@/components/home/HomeJournal'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: heroSetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'hero_image')
    .single()

  const heroImage = heroSetting?.value
    ? String(heroSetting.value).replace(/^"|"$/g, '')
    : 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=1800&q=85'

  return (
    <>
      <Hero heroImage={heroImage} />
      <HomeProducts />
      <HomeJournal />
    </>
  )
}