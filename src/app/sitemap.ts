import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ihera.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('slug, category, updated_at')
    .eq('status', 'active')

  const { data: journals } = await supabase
    .from('journal_entries')
    .select('slug, updated_at')
    .eq('status', 'published')

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                      lastModified: new Date(), changeFrequency: 'weekly',  priority: 1    },
    { url: `${SITE_URL}/surfaces`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SITE_URL}/lighting`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SITE_URL}/objects`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SITE_URL}/textiles`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SITE_URL}/collection`,      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8  },
    { url: `${SITE_URL}/studio`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7  },
    { url: `${SITE_URL}/journal`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8  },
    { url: `${SITE_URL}/contact`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6  },
  ]

  const productRoutes: MetadataRoute.Sitemap = (products || []).map(p => ({
    url:             `${SITE_URL}/${p.category}/${p.slug}`,
    lastModified:    new Date(p.updated_at),
    changeFrequency: 'monthly' as const,
    priority:        0.8,
  }))

  const journalRoutes: MetadataRoute.Sitemap = (journals || []).map(j => ({
    url:             `${SITE_URL}/journal/${j.slug}`,
    lastModified:    new Date(j.updated_at),
    changeFrequency: 'monthly' as const,
    priority:        0.7,
  }))

  return [...staticRoutes, ...productRoutes, ...journalRoutes]
}